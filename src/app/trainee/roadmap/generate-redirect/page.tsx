import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { seedCareerData } from "@/lib/seed-career-data";
import prisma from "@/lib/prisma";
import { computeSkillGap, generateRoadmapItems } from "@/lib/career-engine";

/**
 * /trainee/roadmap/generate-redirect
 * Server-side page that triggers roadmap generation and then redirects back.
 */
export default async function RoadmapGenerateRedirectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      careerTarget: true,
      skills: true,
      roadmap: { include: { items: true } },
    },
  });

  if (!trainee || !trainee.careerTarget) {
    redirect("/trainee/career-target");
  }

  // Ensure career data is seeded
  await seedCareerData();

  const careerPath = await prisma.careerPath.findFirst({
    where: { title: { contains: trainee.careerTarget.targetRole } },
    include: { requirements: { include: { skill: true } } },
  });

  if (careerPath) {
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
    const gap = computeSkillGap(requirements, userSkills);
    const items = generateRoadmapItems(gap);

    // Preserve completed items
    const completedMap = new Map<string, { completedAt: Date | null }>();
    if (trainee.roadmap) {
      for (const item of trainee.roadmap.items) {
        if (item.skillId && item.status === "COMPLETED") {
          completedMap.set(item.skillId, { completedAt: item.completedAt });
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      if (trainee.roadmap) {
        await tx.roadmapItem.deleteMany({ where: { roadmapId: trainee.roadmap!.id } });
        await tx.userRoadmap.delete({ where: { id: trainee.roadmap!.id } });
      }
      const newRoadmap = await tx.userRoadmap.create({
        data: { traineeId: trainee.id, careerPathId: careerPath.id },
      });
      for (const item of items) {
        const prev = item.skillId ? completedMap.get(item.skillId) : null;
        await tx.roadmapItem.create({
          data: {
            roadmapId: newRoadmap.id,
            skillId: item.skillId || null,
            phase: item.phase,
            title: item.title,
            description: item.description,
            itemType: item.itemType,
            status: prev ? "COMPLETED" : "NOT_STARTED",
            completedAt: prev?.completedAt ?? null,
            reasoning: item.reasoning,
            orderIndex: item.orderIndex,
          },
        });
      }
    });
  }

  redirect("/trainee/roadmap");
}
