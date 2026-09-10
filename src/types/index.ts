export type UserRole = "TRAINEE" | "EMPLOYER" | "TRAINING_PROVIDER" | "GOVERNMENT_ADMIN";

export type VerificationStatus = "SELF_REPORTED" | "PENDING_VERIFICATION" | "EMPLOYER_VERIFIED" | "REJECTED";

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";

export type TraineeStatus = 
  | "TRAINING"
  | "CERTIFIED"
  | "EMPLOYED"
  | "SELF_EMPLOYED"
  | "APPRENTICESHIP"
  | "UNEMPLOYED"
  | "FURTHER_STUDIES";

export interface SkillGapAnalysisResult {
  targetRole: string;
  matchedScore: number; // 0 to 100
  matchedSkills: string[];
  missingCriticalSkills: string[];
  recommendedElectives: string[];
  explainableRationale: string;
  recommendedLearningPath: {
    stage: string;
    skills: string[];
    estimatedWeeks: number;
    resourceRecommendation: string;
  }[];
}

export interface EmployabilityRiskReport {
  traineeId: string;
  riskLevel: "LOW" | "MODERATE" | "ELEVATED";
  employabilityScore: number; // 0-100
  primaryFactors: {
    factor: string;
    impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    weight: number;
    explanation: string;
  }[];
  advisorySummary: string;
  recommendedInterventions: string[];
}

export interface PolicyRecommendationItem {
  id: string;
  district?: string;
  sector?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  issueSummary: string;
  recommendedAction: string;
  dataEvidence: string;
  status: "OPEN" | "UNDER_REVIEW" | "IMPLEMENTED";
}

export interface LongitudinalMetrics {
  totalTrainees: number;
  totalCertified: number;
  totalEmployed: number;
  totalSelfEmployed: number;
  totalApprenticeship: number;
  overallEmploymentRate: number; // percentage
  retention90Days: number; // percentage
  retention180Days: number; // percentage
  retention365Days: number; // percentage
  avgInitialSalary: number;
  avgCurrentSalary: number;
  avgWageGrowthPercent: number;
  avgSkillRelevanceScore: number; // 1 to 5
}
