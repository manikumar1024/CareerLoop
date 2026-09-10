/**
 * CareerLoop Intelligence Engine
 * Calculates Career Readiness, Skill Gap, and generates Roadmap items.
 * All values are derived from real database records — no fabrication.
 */

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: string;
  importance: "REQUIRED" | "RECOMMENDED" | "OPTIONAL";
  requiredLevel: string;
  userLevel: string | null;          // null = missing
  status: "STRONG" | "DEVELOPING" | "MISSING";
  reasoning: string;
}

export interface CareerReadiness {
  overall: number | null;            // null = insufficient data
  breakdown: {
    skills: number | null;
    projects: number | null;
    experience: number | null;
    certifications: number | null;
    evidence: number | null;
  };
  explanation: string;
  dataQuality: "SUFFICIENT" | "PARTIAL" | "INSUFFICIENT";
}

const LEVEL_ORDER: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

/**
 * Compute the skill gap between a trainee's skills and a career path's requirements.
 */
export function computeSkillGap(
  requirements: Array<{
    skillId: string;
    skillName: string;
    category: string;
    importance: string;
    minLevel: string;
  }>,
  userSkills: Array<{
    skillId: string;
    proficiencyLevel: string;
  }>
): SkillGapItem[] {
  const userSkillMap = new Map(userSkills.map((s) => [s.skillId, s.proficiencyLevel]));

  return requirements.map((req) => {
    const userLevel = userSkillMap.get(req.skillId) ?? null;
    const requiredRank = LEVEL_ORDER[req.minLevel] ?? 2;
    const userRank = userLevel ? (LEVEL_ORDER[userLevel] ?? 1) : 0;

    let status: "STRONG" | "DEVELOPING" | "MISSING";
    if (!userLevel) {
      status = "MISSING";
    } else if (userRank >= requiredRank) {
      status = "STRONG";
    } else {
      status = "DEVELOPING";
    }

    let reasoning = "";
    if (status === "MISSING") {
      reasoning = `${req.skillName} is ${req.importance.toLowerCase()} for this career path but is not in your profile.`;
    } else if (status === "DEVELOPING") {
      reasoning = `You know ${req.skillName} at ${userLevel} level, but ${req.minLevel} is required.`;
    } else {
      reasoning = `Your ${req.skillName} (${userLevel}) meets the requirement.`;
    }

    return {
      skillId: req.skillId,
      skillName: req.skillName,
      category: req.category,
      importance: req.importance as "REQUIRED" | "RECOMMENDED" | "OPTIONAL",
      requiredLevel: req.minLevel,
      userLevel,
      status,
      reasoning,
    };
  });
}

/**
 * Calculate Career Readiness from real profile data.
 * Returns null for overall/breakdown if there is insufficient data.
 */
export function calculateCareerReadiness(input: {
  totalRequiredSkills: number;
  strongSkills: number;
  developingSkills: number;
  missingRequiredSkills: number;
  projectCount: number;
  certificationCount: number;
  verifiedCertifications: number;
  employmentRecordCount: number;
  evidenceCount: number;
  hasCareerTarget: boolean;
}): CareerReadiness {
  const {
    totalRequiredSkills,
    strongSkills,
    developingSkills,
    missingRequiredSkills,
    projectCount,
    certificationCount,
    verifiedCertifications,
    employmentRecordCount,
    evidenceCount,
    hasCareerTarget,
  } = input;

  // Require a career target and at least some required skills to compute
  if (!hasCareerTarget || totalRequiredSkills === 0) {
    return {
      overall: null,
      breakdown: {
        skills: null,
        projects: null,
        experience: null,
        certifications: null,
        evidence: null,
      },
      explanation: hasCareerTarget
        ? "Set your career target to unlock your Career Readiness score."
        : "Complete your Career Target to calculate readiness.",
      dataQuality: "INSUFFICIENT",
    };
  }

  // Skills score: % of required skills met (strong = full credit, developing = half)
  const skillsScore =
    totalRequiredSkills > 0
      ? Math.round(
          ((strongSkills + developingSkills * 0.5) / totalRequiredSkills) * 100
        )
      : null;

  // Projects score: 0=0, 1=40, 2=65, 3=80, 4+=100
  const projectScore =
    projectCount === 0 ? 0 :
    projectCount === 1 ? 40 :
    projectCount === 2 ? 65 :
    projectCount === 3 ? 80 : 100;

  // Experience score: employment record present
  const experienceScore = employmentRecordCount > 0 ? 80 : 0;

  // Certifications score: 40 per cert, bonus for verified
  const certScore = Math.min(
    100,
    certificationCount * 40 + verifiedCertifications * 20
  );

  // Evidence score: skill evidence items
  const evidenceScore = Math.min(100, evidenceCount * 15);

  // Weighted overall
  const weights = { skills: 0.40, projects: 0.20, experience: 0.15, certifications: 0.15, evidence: 0.10 };
  const overall = Math.round(
    (skillsScore ?? 0) * weights.skills +
    projectScore * weights.projects +
    experienceScore * weights.experience +
    certScore * weights.certifications +
    evidenceScore * weights.evidence
  );

  // Determine data quality
  const dataQuality =
    totalRequiredSkills === 0
      ? "INSUFFICIENT"
      : strongSkills + developingSkills < 2
      ? "PARTIAL"
      : "SUFFICIENT";

  // Explanation
  let explanation = `Your readiness is ${overall}%.`;
  if (missingRequiredSkills > 0) {
    explanation += ` You are missing ${missingRequiredSkills} required skill${missingRequiredSkills > 1 ? "s" : ""}.`;
  }
  if (projectCount === 0) {
    explanation += " Adding projects will significantly boost your profile.";
  }
  if (certificationCount === 0) {
    explanation += " A certification would strengthen your credentials.";
  }

  return {
    overall,
    breakdown: {
      skills: skillsScore,
      projects: projectScore,
      experience: experienceScore,
      certifications: certScore,
      evidence: evidenceScore,
    },
    explanation,
    dataQuality,
  };
}

/**
 * Generate ordered roadmap items from a skill gap.
 * Required missing skills come first, then developing, then recommended.
 */
export function generateRoadmapItems(
  skillGap: SkillGapItem[]
): Array<{
  skillId: string;
  skillName: string;
  phase: number;
  title: string;
  description: string;
  itemType: "SKILL" | "PROJECT" | "MILESTONE";
  reasoning: string;
  orderIndex: number;
}> {
  const items: ReturnType<typeof generateRoadmapItems> = [];
  let order = 0;

  // Phase 1: Required missing skills
  const requiredMissing = skillGap.filter(
    (g) => g.importance === "REQUIRED" && g.status === "MISSING"
  );
  for (const g of requiredMissing) {
    items.push({
      skillId: g.skillId,
      skillName: g.skillName,
      phase: 1,
      title: `Learn ${g.skillName}`,
      description: `Build ${g.requiredLevel.toLowerCase()} proficiency in ${g.skillName}.`,
      itemType: "SKILL",
      reasoning: g.reasoning,
      orderIndex: order++,
    });
  }

  // Phase 2: Required developing skills (need level upgrade)
  const requiredDeveloping = skillGap.filter(
    (g) => g.importance === "REQUIRED" && g.status === "DEVELOPING"
  );
  for (const g of requiredDeveloping) {
    items.push({
      skillId: g.skillId,
      skillName: g.skillName,
      phase: 2,
      title: `Advance ${g.skillName} to ${g.requiredLevel}`,
      description: `Current: ${g.userLevel}. Target: ${g.requiredLevel}.`,
      itemType: "SKILL",
      reasoning: g.reasoning,
      orderIndex: order++,
    });
  }

  // Phase 3: Recommended missing skills
  const recommendedMissing = skillGap.filter(
    (g) => g.importance === "RECOMMENDED" && g.status === "MISSING"
  );
  for (const g of recommendedMissing) {
    items.push({
      skillId: g.skillId,
      skillName: g.skillName,
      phase: 3,
      title: `Learn ${g.skillName}`,
      description: `Recommended skill — adds competitive advantage.`,
      itemType: "SKILL",
      reasoning: g.reasoning,
      orderIndex: order++,
    });
  }

  // Phase 4: Build a portfolio project (milestone)
  if (requiredMissing.length > 0 || requiredDeveloping.length > 0) {
    items.push({
      skillId: "",
      skillName: "",
      phase: 4,
      title: "Build a Portfolio Project",
      description: "Apply your skills in a real project to demonstrate capability to employers.",
      itemType: "PROJECT",
      reasoning: "Projects are the strongest evidence of practical ability.",
      orderIndex: order++,
    });
  }

  return items;
}
