import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  computeSkillGap,
  calculateCareerReadiness,
  generateRoadmapItems,
} from "@/lib/career-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/trainee/career-analysis
 * Returns career readiness, skill gap, and roadmap for the authenticated trainee.
 * All data is calculated from real DB records.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
      include: {
        careerTarget: true,
        skills: { include: { skill: true } },
        projects: true,
        certifications: true,
        employmentRecords: true,
        skillEvidence: true,
        roadmap: { include: { items: { include: { skill: true } } } },
      },
    });

    if (!trainee) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // No career target → return partial state
    if (!trainee.careerTarget) {
      return NextResponse.json({
        hasCareerTarget: false,
        readiness: {
          overall: null,
          breakdown: { skills: null, projects: null, experience: null, certifications: null, evidence: null },
          explanation: "Set your Career Target to unlock your personalized Career Readiness score.",
          dataQuality: "INSUFFICIENT",
        },
        skillGap: [],
        roadmap: null,
        careerPath: null,
      });
    }

    // Find matching career path
    const careerPath = await prisma.careerPath.findFirst({
      where: {
        title: {
          contains: trainee.careerTarget.targetRole,
        },
      },
      include: {
        requirements: {
          include: { skill: true },
        },
      },
    });

    if (!careerPath) {
      return NextResponse.json({
        hasCareerTarget: true,
        careerTarget: trainee.careerTarget,
        readiness: {
          overall: null,
          breakdown: { skills: null, projects: null, experience: null, certifications: null, evidence: null },
          explanation: `No structured career requirements found for "${trainee.careerTarget.targetRole}". Add skills to your profile to begin tracking progress.`,
          dataQuality: "INSUFFICIENT",
        },
        skillGap: [],
        roadmap: trainee.roadmap,
        careerPath: null,
      });
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

    const strongSkills = skillGap.filter(
      (g) => g.status === "STRONG" && g.importance === "REQUIRED"
    ).length;
    const developingSkills = skillGap.filter(
      (g) => g.status === "DEVELOPING" && g.importance === "REQUIRED"
    ).length;
    const missingRequired = skillGap.filter(
      (g) => g.status === "MISSING" && g.importance === "REQUIRED"
    ).length;
    const totalRequired = skillGap.filter((g) => g.importance === "REQUIRED").length;

    // Calculate readiness
    const readiness = calculateCareerReadiness({
      totalRequiredSkills: totalRequired,
      strongSkills,
      developingSkills,
      missingRequiredSkills: missingRequired,
      projectCount: trainee.projects.length,
      certificationCount: trainee.certifications.length,
      verifiedCertifications: trainee.certifications.filter(
        (c) => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED"
      ).length,
      employmentRecordCount: trainee.employmentRecords.length,
      evidenceCount: trainee.skillEvidence.length,
      hasCareerTarget: true,
    });

    return NextResponse.json({
      hasCareerTarget: true,
      careerTarget: trainee.careerTarget,
      careerPath: {
        id: careerPath.id,
        title: careerPath.title,
        category: careerPath.category,
        demandLevel: careerPath.demandLevel,
        avgSalaryMin: careerPath.avgSalaryMin,
        avgSalaryMax: careerPath.avgSalaryMax,
      },
      readiness,
      skillGap,
      roadmap: trainee.roadmap,
    });
  } catch (err: any) {
    console.error("Career analysis error:", err);
    return NextResponse.json({ error: "Failed to calculate career analysis" }, { status: 500 });
  }
}
