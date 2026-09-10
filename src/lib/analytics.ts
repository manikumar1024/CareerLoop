import prisma from "@/lib/prisma";

export async function getLongitudinalOverview() {
  const totalTrainees = await prisma.traineeProfile.count();
  if (totalTrainees === 0) {
    return {
      hasData: false,
      totalTrainees: 0,
      totalCertified: 0,
      totalEmployed: 0,
      totalSelfEmployed: 0,
      totalApprenticeship: 0,
      overallEmploymentRate: 0,
      retention90Days: 0,
      retention180Days: 0,
      retention365Days: 0,
      avgInitialSalary: 0,
      avgCurrentSalary: 0,
      avgWageGrowthPercent: 0,
      avgSkillRelevanceScore: 0,
    };
  }

  const totalCertified = await prisma.certification.count();
  const totalEmployed = await prisma.employmentRecord.count({ where: { isCurrent: true } });
  const totalSelfEmployed = await prisma.selfEmploymentRecord.count({ where: { businessStatus: "ACTIVE" } });
  const totalApprenticeship = await prisma.apprenticeshipRecord.count({ where: { isCompleted: false } });

  const totalPositiveLivelihoods = totalEmployed + totalSelfEmployed + totalApprenticeship;
  const overallEmploymentRate = totalCertified > 0 ? (totalPositiveLivelihoods / totalCertified) * 100 : 0;

  // Retention rates from FollowUp table
  const followUps90 = await prisma.followUp.findMany({ where: { milestoneDays: 90, isCompleted: true } });
  const retained90 = followUps90.filter((f) => f.isEmployed).length;
  const retention90Days = followUps90.length > 0 ? (retained90 / followUps90.length) * 100 : 0;

  const followUps180 = await prisma.followUp.findMany({ where: { milestoneDays: 180, isCompleted: true } });
  const retained180 = followUps180.filter((f) => f.isEmployed).length;
  const retention180Days = followUps180.length > 0 ? (retained180 / followUps180.length) * 100 : 0;

  const followUps365 = await prisma.followUp.findMany({ where: { milestoneDays: 365, isCompleted: true } });
  const retained365 = followUps365.filter((f) => f.isEmployed).length;
  const retention365Days = followUps365.length > 0 ? (retained365 / followUps365.length) * 100 : 0;

  // Salary calculations
  const employments = await prisma.employmentRecord.findMany({
    select: { monthlySalary: true, skillRelevanceScore: true },
  });

  const avgInitialSalary =
    employments.length > 0
      ? Math.round(employments.reduce((acc, curr) => acc + curr.monthlySalary, 0) / employments.length)
      : 0;

  // Current salary from latest followups
  const salariesFollowups = followUps180.filter((f) => f.currentSalary && f.currentSalary > 0);
  const avgCurrentSalary =
    salariesFollowups.length > 0
      ? Math.round(salariesFollowups.reduce((acc, curr) => acc + (curr.currentSalary || 0), 0) / salariesFollowups.length)
      : avgInitialSalary;

  const avgWageGrowthPercent =
    avgInitialSalary > 0 && avgCurrentSalary > avgInitialSalary
      ? Math.round(((avgCurrentSalary - avgInitialSalary) / avgInitialSalary) * 1000) / 10
      : 0;

  const employmentsWithScore = employments.filter(e => e.skillRelevanceScore !== null);
  const avgSkillRelevanceScore =
    employmentsWithScore.length > 0
      ? Math.round((employmentsWithScore.reduce((acc, curr) => acc + (curr.skillRelevanceScore ?? 0), 0) / employmentsWithScore.length) * 10) / 10
      : 0;

  return {
    hasData: true,
    totalTrainees,
    totalCertified,
    totalEmployed,
    totalSelfEmployed,
    totalApprenticeship,
    overallEmploymentRate: Math.round(overallEmploymentRate * 10) / 10,
    retention90Days: Math.round(retention90Days * 10) / 10,
    retention180Days: Math.round(retention180Days * 10) / 10,
    retention365Days: Math.round(retention365Days * 10) / 10,
    avgInitialSalary,
    avgCurrentSalary,
    avgWageGrowthPercent,
    avgSkillRelevanceScore,
  };
}

export async function getDistrictAnalytics() {
  const trainees = await prisma.traineeProfile.findMany({
    include: {
      certifications: true,
      employmentRecords: { where: { isCurrent: true } },
      selfEmployments: { where: { businessStatus: "ACTIVE" } },
      apprenticeships: true,
      followUps: true,
      nonPlacements: true,
    },
  });

  const districtMap: Record<
    string,
    {
      district: string;
      totalTrainees: number;
      certifiedCount: number;
      employedCount: number;
      selfEmployedCount: number;
      apprenticeshipCount: number;
      retention90Count: number;
      followUps90Count: number;
      avgSalary: number;
      salarySum: number;
      salaryCount: number;
      nonPlacementCount: number;
    }
  > = {};

  trainees.forEach((t) => {
    const dist = t.district || "Unassigned District";
    if (!districtMap[dist]) {
      districtMap[dist] = {
        district: dist,
        totalTrainees: 0,
        certifiedCount: 0,
        employedCount: 0,
        selfEmployedCount: 0,
        apprenticeshipCount: 0,
        retention90Count: 0,
        followUps90Count: 0,
        avgSalary: 0,
        salarySum: 0,
        salaryCount: 0,
        nonPlacementCount: 0,
      };
    }

    const d = districtMap[dist];
    d.totalTrainees += 1;
    if (t.certifications.length > 0) d.certifiedCount += 1;
    if (t.employmentRecords.length > 0) {
      d.employedCount += 1;
      t.employmentRecords.forEach((emp) => {
        d.salarySum += emp.monthlySalary;
        d.salaryCount += 1;
      });
    }
    if (t.selfEmployments.length > 0) d.selfEmployedCount += 1;
    if (t.apprenticeships.length > 0) d.apprenticeshipCount += 1;
    if (t.nonPlacements.length > 0) d.nonPlacementCount += t.nonPlacements.length;

    const f90 = t.followUps.find((f) => f.milestoneDays === 90 && f.isCompleted);
    if (f90) {
      d.followUps90Count += 1;
      if (f90.isEmployed) d.retention90Count += 1;
    }
  });

  return Object.values(districtMap).map((d) => {
    const positiveLivelihood = d.employedCount + d.selfEmployedCount + d.apprenticeshipCount;
    const employmentRate = d.certifiedCount > 0 ? Math.round((positiveLivelihood / d.certifiedCount) * 1000) / 10 : 0;
    const retention90 = d.followUps90Count > 0 ? Math.round((d.retention90Count / d.followUps90Count) * 1000) / 10 : 0;
    const avgSalary = d.salaryCount > 0 ? Math.round(d.salarySum / d.salaryCount) : 0;

    return {
      district: d.district,
      totalCount: d.totalTrainees,
      certifiedCount: d.certifiedCount,
      employedCount: d.employedCount,
      selfEmployedCount: d.selfEmployedCount,
      apprenticeshipCount: d.apprenticeshipCount,
      employmentRate,
      retentionRate90: retention90,
      avgSalary,
      nonPlacementCount: d.nonPlacementCount,
    };
  });
}

export async function getNonPlacementDistribution() {
  const records = await prisma.nonPlacementRecord.findMany();
  const followUpNonPlacements = await prisma.followUp.findMany({
    where: { isCompleted: true, isEmployed: false, nonPlacementReason: { not: null } },
  });

  const reasonCounts: Record<string, number> = {};
  let totalCount = 0;

  records.forEach((r) => {
    const key = r.primaryReason;
    reasonCounts[key] = (reasonCounts[key] || 0) + 1;
    totalCount += 1;
  });

  followUpNonPlacements.forEach((f) => {
    if (f.nonPlacementReason) {
      const key = f.nonPlacementReason;
      reasonCounts[key] = (reasonCounts[key] || 0) + 1;
      totalCount += 1;
    }
  });

  if (totalCount === 0) return [];

  const readableLabels: Record<string, string> = {
    SKILL_GAP: "Practical Skill Gap / Divergence",
    LACK_OF_LOCAL_JOBS: "Lack of Local Industrial Vacancies",
    SALARY_MISMATCH: "Salary Below Living Wage Benchmark",
    COMMUNICATION_SKILLS: "Workplace & Soft Skills Deficit",
    LOCATION_MOBILITY: "Inability to Relocate",
    FURTHER_EDUCATION: "Pursuing Higher Education",
    PERSONAL_REASON: "Family / Personal Circumstances",
    EMPLOYER_EXPERIENCE_REQUIREMENT: "Employer Seeking Prior Experience",
    OTHER: "Other Barriers",
  };

  return Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason: readableLabels[reason] || reason,
      rawReason: reason,
      count,
      percentage: Math.round((count / totalCount) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count);
}
