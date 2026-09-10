import prisma from "./prisma";
import { CAREER_PATHS, SKILLS_TAXONOMY, SKILL_RELATIONSHIPS } from "./career-data";

export async function seedCareerData() {
  // Check if already seeded
  const existingCareerPaths = await prisma.careerPath.count();
  if (existingCareerPaths > 0) return { message: "Career data already seeded" };

  // 1. Upsert all skills
  for (const skillData of SKILLS_TAXONOMY) {
    await prisma.skill.upsert({
      where: { name: skillData.name },
      update: {},
      create: {
        name: skillData.name,
        category: skillData.category,
        description: skillData.description,
      },
    });
  }

  // 2. Create career paths with requirements
  for (const pathData of CAREER_PATHS) {
    const careerPath = await prisma.careerPath.create({
      data: {
        title: pathData.title,
        category: pathData.category,
        description: pathData.description,
        avgSalaryMin: pathData.avgSalaryMin,
        avgSalaryMax: pathData.avgSalaryMax,
        demandLevel: pathData.demandLevel,
      },
    });

    for (const req of pathData.requirements) {
      const skill = await prisma.skill.findUnique({ where: { name: req.skill } });
      if (skill) {
        await prisma.careerRequirement.create({
          data: {
            careerPathId: careerPath.id,
            skillId: skill.id,
            importance: req.importance,
            minLevel: req.minLevel,
          },
        });
      }
    }
  }

  // 3. Create skill relationships
  for (const rel of SKILL_RELATIONSHIPS) {
    const skill = await prisma.skill.findUnique({ where: { name: rel.skill } });
    const relatedSkill = await prisma.skill.findUnique({ where: { name: rel.relatedSkill } });
    if (skill && relatedSkill) {
      await prisma.skillRelationship.upsert({
        where: { skillId_relatedSkillId: { skillId: skill.id, relatedSkillId: relatedSkill.id } },
        update: {},
        create: {
          skillId: skill.id,
          relatedSkillId: relatedSkill.id,
          relationshipType: rel.type,
        },
      });
    }
  }

  return { message: "Career data seeded successfully" };
}
