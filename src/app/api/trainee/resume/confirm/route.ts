// src/app/api/trainee/resume/confirm/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized: Trainee access required." }, { status: 401 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
      include: { skills: true, projects: true },
    });

    if (!trainee) {
      return NextResponse.json({ error: "Trainee profile not found." }, { status: 404 });
    }

    const body = await req.json();
    const { name, age, gender, educationLevel, skills, projects } = body;

    // 1. Update personal info
    if (name && name.trim()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    await prisma.traineeProfile.update({
      where: { id: trainee.id },
      data: {
        age: age ? parseInt(age, 10) : trainee.age,
        gender: gender || trainee.gender,
        educationLevel: educationLevel || trainee.educationLevel,
      },
    });

    // 2. Synchronize Skills
    let addedSkillsCount = 0;
    if (Array.isArray(skills)) {
      for (const s of skills) {
        if (!s.name || !s.name.trim()) continue;
        const skillName = s.name.trim();

        // Find or create master skill
        let masterSkill = await prisma.skill.findUnique({
          where: { name: skillName },
        });

        if (!masterSkill) {
          masterSkill = await prisma.skill.create({
            data: {
              name: skillName,
              category: s.category || "Technical",
              description: "Extracted from verified resume documentation",
            },
          });
        }

        // Connect to TraineeSkill if not already added
        const existingTraineeSkill = await prisma.traineeSkill.findUnique({
          where: {
            traineeId_skillId: {
              traineeId: trainee.id,
              skillId: masterSkill.id,
            },
          },
        });

        if (!existingTraineeSkill) {
          await prisma.traineeSkill.create({
            data: {
              traineeId: trainee.id,
              skillId: masterSkill.id,
              proficiencyLevel: s.proficiencyLevel || "INTERMEDIATE",
            },
          });
          addedSkillsCount++;
        }
      }
    }

    // 3. Synchronize Projects
    let addedProjectsCount = 0;
    if (Array.isArray(projects)) {
      for (const p of projects) {
        if (!p.title || !p.title.trim()) continue;
        const title = p.title.trim();

        const exists = trainee.projects.some(
          (ep) => ep.title.toLowerCase() === title.toLowerCase()
        );

        if (!exists) {
          await prisma.project.create({
            data: {
              traineeId: trainee.id,
              title,
              description: p.description || null,
              techStack: p.techStack || null,
            },
          });
          addedProjectsCount++;
        }
      }
    }

    await logAuditAction({
      userId: user.id,
      role: "TRAINEE",
      action: "CONFIRMED_RESUME_SYNC",
      targetEntity: "TraineeProfile",
      targetEntityId: trainee.id,
      metadata: { addedSkillsCount, addedProjectsCount },
    });

    return NextResponse.json({
      success: true,
      message: `Profile synchronized successfully. Added ${addedSkillsCount} new skill(s) and ${addedProjectsCount} project(s).`,
      addedSkillsCount,
      addedProjectsCount,
    });
  } catch (error: any) {
    console.error("Resume confirmation error:", error);
    return NextResponse.json({ error: error.message || "Failed to synchronize profile." }, { status: 500 });
  }
}
