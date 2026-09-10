import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";



interface SkillEntry {
  name: string;
  category: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
}

/**
 * POST /api/trainee/onboarding-skills
 * Saves skills collected during onboarding.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { skills } = (await req.json()) as { skills: SkillEntry[] };
    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "Skills array required" }, { status: 400 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
    });
    if (!trainee) {
      return NextResponse.json({ error: "Trainee profile not found" }, { status: 404 });
    }

    for (const s of skills) {
      if (!s.name?.trim()) continue;

      // Upsert the skill record
      const skill = await prisma.skill.upsert({
        where: { name: s.name.trim() },
        update: {},
        create: {
          name: s.name.trim(),
          category: s.category || "Other",
          description: null,
        },
      });

      // Upsert trainee–skill relationship
      await prisma.traineeSkill.upsert({
        where: { traineeId_skillId: { traineeId: trainee.id, skillId: skill.id } },
        update: { proficiencyLevel: s.level },
        create: {
          traineeId: trainee.id,
          skillId: skill.id,
          proficiencyLevel: s.level,
        },
      });
    }

    return NextResponse.json({ success: true, count: skills.length });
  } catch (err: any) {
    console.error("Onboarding skills error:", err);
    return NextResponse.json({ error: err.message || "Failed to save skills" }, { status: 500 });
  }
}
