// src/lib/matching-service.ts
// Intelligent candidate-to-job matching, retention risk forecasting, and explainable skill fit

export interface SkillMatchDetail {
  skillName: string;
  required: boolean;
  minLevel: string;
  candidateLevel?: string;
  matched: boolean;
  score: number; // 0 - 100
}

export interface CandidateFitResult {
  overallScore: number; // 0 - 100
  matchTier: "EXCELLENT" | "STRONG" | "MODERATE" | "GAP_IDENTIFIED";
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  skillBreakdown: SkillMatchDetail[];
  missingCriticalSkills: string[];
  retentionRisk: {
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    retentionProbabilityPct: number;
    riskFactors: string[];
    protectiveFactors: string[];
  };
  recommendations: string[];
}

const PROFICIENCY_WEIGHTS: Record<string, number> = {
  BEGINNER: 40,
  INTERMEDIATE: 75,
  ADVANCED: 90,
  EXPERT: 100,
};

/**
 * Calculates deterministic explainable candidate-job fit score and retention risk.
 */
export function calculateCandidateFit(
  candidate: {
    skills: Array<{ name: string; proficiencyLevel?: string; verified?: boolean }>;
    locationDistrict?: string;
    targetSalary?: number;
    historicalTenureMonths?: number;
  },
  job: {
    title: string;
    locationDistrict?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    requiredSkills: Array<{ name: string; required: boolean; minLevel: string }>;
  }
): CandidateFitResult {
  const candidateSkillMap = new Map(
    candidate.skills.map((s) => [s.name.toLowerCase().trim(), s])
  );

  let totalWeight = 0;
  let earnedScore = 0;
  let matchedSkillsCount = 0;
  const skillBreakdown: SkillMatchDetail[] = [];
  const missingCriticalSkills: string[] = [];

  for (const req of job.requiredSkills) {
    const weight = req.required ? 2.0 : 1.0;
    totalWeight += weight;

    const matchedSkill = candidateSkillMap.get(req.name.toLowerCase().trim());
    if (matchedSkill) {
      matchedSkillsCount++;
      const reqWeight = PROFICIENCY_WEIGHTS[req.minLevel.toUpperCase()] || 70;
      const candidateWeight = PROFICIENCY_WEIGHTS[(matchedSkill.proficiencyLevel || "INTERMEDIATE").toUpperCase()] || 60;
      const verificationBonus = matchedSkill.verified ? 10 : 0;
      
      const skillScore = Math.min(100, Math.round((candidateWeight / reqWeight) * 85 + verificationBonus));
      earnedScore += (skillScore / 100) * weight;

      skillBreakdown.push({
        skillName: req.name,
        required: req.required,
        minLevel: req.minLevel,
        candidateLevel: matchedSkill.proficiencyLevel || "INTERMEDIATE",
        matched: true,
        score: skillScore,
      });
    } else {
      if (req.required) {
        missingCriticalSkills.push(req.name);
      }
      skillBreakdown.push({
        skillName: req.name,
        required: req.required,
        minLevel: req.minLevel,
        matched: false,
        score: 0,
      });
    }
  }

  const rawPercentage = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 75;
  const overallScore = Math.max(0, Math.min(100, Math.round(rawPercentage)));

  let matchTier: CandidateFitResult["matchTier"] = "GAP_IDENTIFIED";
  if (overallScore >= 85) matchTier = "EXCELLENT";
  else if (overallScore >= 70) matchTier = "STRONG";
  else if (overallScore >= 50) matchTier = "MODERATE";

  // Retention Risk Heuristics
  const riskFactors: string[] = [];
  const protectiveFactors: string[] = [];
  let retentionProbability = 78; // baseline benchmark

  // Location alignment
  if (candidate.locationDistrict && job.locationDistrict) {
    if (candidate.locationDistrict.toLowerCase() === job.locationDistrict.toLowerCase()) {
      retentionProbability += 10;
      protectiveFactors.push(`Local district match (${candidate.locationDistrict}) reduces commute friction`);
    } else {
      retentionProbability -= 8;
      riskFactors.push(`Inter-district commute (${candidate.locationDistrict} to ${job.locationDistrict})`);
    }
  }

  // Salary alignment
  if (candidate.targetSalary && job.salaryMin) {
    if (candidate.targetSalary > (job.salaryMax || job.salaryMin * 1.3)) {
      retentionProbability -= 12;
      riskFactors.push("Candidate target compensation exceeds role ceiling");
    } else if (candidate.targetSalary <= (job.salaryMax || job.salaryMin)) {
      retentionProbability += 8;
      protectiveFactors.push("Salary meets or exceeds candidate target expectations");
    }
  }

  // Skill alignment impact
  if (overallScore >= 75) {
    retentionProbability += 10;
    protectiveFactors.push("High core competency fit minimizes on-the-job training friction");
  } else if (missingCriticalSkills.length > 1) {
    retentionProbability -= 15;
    riskFactors.push(`Missing ${missingCriticalSkills.length} critical required skills`);
  }

  const finalRetentionPct = Math.max(25, Math.min(96, Math.round(retentionProbability)));
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  if (finalRetentionPct >= 80) riskLevel = "LOW";
  else if (finalRetentionPct < 60) riskLevel = "HIGH";

  const recommendations: string[] = [];
  if (missingCriticalSkills.length > 0) {
    recommendations.push(`Targeted upskilling in: ${missingCriticalSkills.slice(0, 3).join(", ")}`);
  }
  if (riskLevel === "HIGH") {
    recommendations.push("Consider structured 30-day onboarding mentorship to mitigate early-stage attrition");
  }
  if (overallScore >= 80) {
    recommendations.push("Fast-track interview recommendation based on verified skill competencies");
  }

  return {
    overallScore,
    matchTier,
    matchedSkillsCount,
    totalRequiredSkills: job.requiredSkills.length,
    skillBreakdown,
    missingCriticalSkills,
    retentionRisk: {
      riskLevel,
      retentionProbabilityPct: finalRetentionPct,
      riskFactors,
      protectiveFactors,
    },
    recommendations,
  };
}
