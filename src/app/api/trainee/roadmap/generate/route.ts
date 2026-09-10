import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { computeSkillGap, generateRoadmapItems } from "@/lib/career-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/trainee/roadmap/generate
 * Generates or regenerates the trainee's personalized roadmap.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
      include: {
        careerTarget: true,
        skills: true,
        roadmap: { include: { items: true } },
      },
    });

    if (!trainee || !trainee.careerTarget) {
      return NextResponse.json(
        { error: "Career target not set. Please set your career goal first." },
        { status: 400 }
      );
    }

    // Find matching career path
    const careerPath = await prisma.careerPath.findFirst({
      where: { title: { contains: trainee.careerTarget.targetRole } },
      include: {
        requirements: { include: { skill: true } },
      },
    });

    if (!careerPath) {
      return NextResponse.json(
        { error: `No career path found for "${trainee.careerTarget.targetRole}". Please seed career data.` },
        { status: 404 }
      );
    }

    // Compute skill gap
    const requirements = careerPath.requirements.map((r) => ({
      skillId: r.skillId,
      skillName: r.skill.name,
      category: r.skill.category,
      importance: r.importance,
      minLevel: r.minLevel,
    }));

    const userSkills = trainee.skills.map((s) => ({
      skillId: s.skillId,
      proficiencyLevel: s.proficiencyLevel,
    }));

    const skillGap = computeSkillGap(requirements, userSkills);
    const roadmapItems = generateRoadmapItems(skillGap);

    // Get existing completed items so we don't lose progress
    const existingCompletedMap = new Map<string, { status: string; completedAt: Date | null }>();
    if (trainee.roadmap) {
      for (const item of trainee.roadmap.items) {
        if (item.skillId && item.status === "COMPLETED") {
          existingCompletedMap.set(item.skillId, {
            status: item.status,
            completedAt: item.completedAt,
          });
        }
      }
    }

    // Delete and recreate roadmap (transactional)
    await prisma.$transaction(async (tx) => {
      if (trainee.roadmap) {
        await tx.roadmapItem.deleteMany({ where: { roadmapId: trainee.roadmap!.id } });
        await tx.userRoadmap.delete({ where: { id: trainee.roadmap!.id } });
      }

      const newRoadmap = await tx.userRoadmap.create({
        data: {
          traineeId: trainee.id,
          careerPathId: careerPath.id,
        },
      });

      for (const item of roadmapItems) {
        const existingProgress = item.skillId ? existingCompletedMap.get(item.skillId) : null;
        await tx.roadmapItem.create({
          data: {
            roadmapId: newRoadmap.id,
            skillId: item.skillId || null,
            phase: item.phase,
            title: item.title,
            description: item.description,
            itemType: item.itemType,
            status: existingProgress?.status ?? "NOT_STARTED",
            completedAt: existingProgress?.completedAt ?? null,
            reasoning: item.reasoning,
            orderIndex: item.orderIndex,
          },
        });
      }

      return newRoadmap;
    });

    return NextResponse.json({ success: true, itemCount: roadmapItems.length });
  } catch (err: any) {
    console.error("Roadmap generation error:", err);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}

/**
 * PATCH /api/trainee/roadmap/generate
 * Update a single roadmap item status.
 */
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, status } = await req.json();
    if (!itemId || !status) {
      return NextResponse.json({ error: "itemId and status are required" }, { status: 400 });
    }

    const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
      include: { roadmap: { include: { items: true } } },
    });

    if (!trainee?.roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    const item = trainee.roadmap.items.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found or not owned by user" }, { status: 404 });
    }

    await prisma.roadmapItem.update({
      where: { id: itemId },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Roadmap update error:", err);
    return NextResponse.json({ error: "Failed to update roadmap item" }, { status: 500 });
  }
}
