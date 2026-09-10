import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import SkillBadge from "@/components/SkillBadge";
import Timeline, { TimelineEvent } from "@/components/Timeline";
import EmptyState from "@/components/EmptyState";
import { evaluateEmployabilityRisk } from "@/lib/ai-service";
import { computeSkillGap, calculateCareerReadiness } from "@/lib/career-engine";
import { formatCurrency } from "@/lib/utils";
import { 
  GraduationCap, Award, Briefcase, Clock, Sparkles, ArrowRight,
  TrendingUp, AlertCircle, PlusCircle, CheckCircle2, Target, BookOpen,
  BarChart3, Map
} from "lucide-react";

export const revalidate = 0;

export default async function TraineeDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      skills: { include: { skill: true } },
      enrollments: { include: { program: true, assessments: true } },
      certifications: { include: { program: true } },
      employmentRecords: { include: { employer: true } },
      selfEmployments: true,
      apprenticeships: true,
      followUps: true,
      careerTarget: true,
      projects: true,
      skillEvidence: true,
      roadmap: {
        include: {
          items: { orderBy: [{ phase: "asc" }, { orderIndex: "asc" }] },
        },
      },
    },
  });

  if (!trainee) {
    return (
      <EmptyState
        title="Profile Not Initialized"
        description="Your trainee profile hasn't been set up yet."
        actionText="Complete Onboarding"
        actionHref="/onboarding"
      />
    );
  }

  // ── Career Readiness from real data ──────────────────────────────────────
  let readiness = null;
  let skillGap: ReturnType<typeof computeSkillGap> = [];
  let careerPath = null;

  if (trainee.careerTarget) {
    const cp = await prisma.careerPath.findFirst({
      where: { title: { contains: trainee.careerTarget.targetRole } },
      include: { requirements: { include: { skill: true } } },
    });

    if (cp) {
      careerPath = cp;
      const requirements = cp.requirements.map((r) => ({
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
      skillGap = computeSkillGap(requirements, userSkills);

      const totalRequired = skillGap.filter((g) => g.importance === "REQUIRED").length;
      const strongSkills = skillGap.filter((g) => g.status === "STRONG" && g.importance === "REQUIRED").length;
      const developingSkills = skillGap.filter((g) => g.status === "DEVELOPING" && g.importance === "REQUIRED").length;
      const missingRequired = skillGap.filter((g) => g.status === "MISSING" && g.importance === "REQUIRED").length;

      readiness = calculateCareerReadiness({
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
    }
  }

  // ── AI employability risk (only when we have real data) ──────────────────
  const activeEnrollment = trainee.enrollments[0];
  const assessment = activeEnrollment?.assessments[0];
  const riskReport = evaluateEmployabilityRisk({
    traineeId: trainee.traineeId,
    attendancePercentage: activeEnrollment?.attendancePercentage ?? undefined,
    assessmentScore: assessment?.scoreObtained ?? undefined,
    skillsCount: trainee.skills.length,
    isEmployed: trainee.employmentRecords.length > 0 || trainee.selfEmployments.length > 0,
    hasCertifiedCredentials: trainee.certifications.some(
      (c: any) => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED"
    ),
  });

  // ── Roadmap progress ─────────────────────────────────────────────────────
  const roadmapTotal = trainee.roadmap?.items.length ?? 0;
  const roadmapCompleted = trainee.roadmap?.items.filter((i) => i.status === "COMPLETED").length ?? 0;
  const nextRoadmapItem = trainee.roadmap?.items.find((i) => i.status !== "COMPLETED");

  // ── Top missing skills (for dashboard) ──────────────────────────────────
  const missingRequiredSkills = skillGap
    .filter((g) => g.status === "MISSING" && g.importance === "REQUIRED")
    .slice(0, 3);

  // ── Timeline events from real data ───────────────────────────────────────
  const timelineEvents: TimelineEvent[] = [];

  trainee.enrollments.forEach((e) => {
    timelineEvents.push({
      id: e.id,
      type: "TRAINING",
      title: e.program.title,
      subtitle: `Enrolled in ${e.program.sector}`,
      date: e.enrollmentDate,
      details: `Grade: ${e.grade || "In Progress"}`,
      status: e.status,
    });
  });

  trainee.certifications.forEach((c) => {
    timelineEvents.push({
      id: c.id,
      type: "CERTIFICATION",
      title: `Certified: ${c.program.title}`,
      subtitle: `Credential: ${c.certificateNumber}`,
      date: c.issueDate,
      details: `${c.verificationStatus.replace(/_/g, " ")}`,
      isVerified: c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED",
    });
  });

  trainee.employmentRecords.forEach((emp) => {
    timelineEvents.push({
      id: emp.id,
      type: "EMPLOYMENT",
      title: `${emp.jobTitle} at ${emp.companyName}`,
      subtitle: `${emp.locationDistrict} · ${emp.employmentType.replace(/_/g, " ")}`,
      date: emp.startDate,
      salary: emp.monthlySalary,
      details: `${emp.verificationStatus.replace(/_/g, " ")}`,
      isVerified: emp.verificationStatus === "EMPLOYER_VERIFIED",
    });
  });

  trainee.followUps.forEach((f) => {
    if (f.isCompleted) {
      timelineEvents.push({
        id: f.id,
        type: "FOLLOWUP",
        title: `${f.milestoneDays}-Day Follow-up`,
        subtitle: f.isEmployed ? `Employed as ${f.jobTitle || "Active"}` : `Non-placement`,
        date: f.completedDate || f.createdAt,
        salary: f.currentSalary || undefined,
        details: f.wageIncreasePercent ? `+${f.wageIncreasePercent}% wage growth` : undefined,
      });
    }
  });

  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const pendingFollowups = trainee.followUps.filter((f) => !f.isCompleted);

  // ── Next Best Action ──────────────────────────────────────────────────────
  let nextAction: { text: string; href: string; why?: string } | null = null;
  if (!trainee.careerTarget) {
    nextAction = {
      text: "Set your Career Goal to unlock skill gap analysis and your personalized roadmap.",
      href: "/trainee/career-target",
      why: "CareerLoop needs a target to calculate what you're missing.",
    };
  } else if (trainee.skills.length === 0) {
    nextAction = {
      text: "Add your current skills to begin career matching.",
      href: "/trainee/skills",
      why: "Skills are the foundation of your career readiness score.",
    };
  } else if (!trainee.roadmap) {
    nextAction = {
      text: "Generate your personalized learning roadmap.",
      href: "/trainee/roadmap/generate-redirect",
      why: "Your roadmap shows exactly what to learn next for your target role.",
    };
  } else if (nextRoadmapItem) {
    nextAction = {
      text: nextRoadmapItem.title,
      href: "/trainee/roadmap",
      why: nextRoadmapItem.reasoning || "This is the highest-priority item in your roadmap.",
    };
  } else if (trainee.projects.length === 0) {
    nextAction = {
      text: "Add a project to demonstrate your skills.",
      href: "/trainee/identity",
      why: "Projects are the strongest evidence of practical ability.",
    };
  } else if (pendingFollowups.length > 0) {
    nextAction = {
      text: `Complete your ${pendingFollowups[0].milestoneDays}-Day follow-up milestone.`,
      href: "/trainee/followups",
    };
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {trainee.traineeId}
            </span>
            <StatusBadge status={trainee.currentStatus} />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            {user.name || "Dashboard"}
          </h1>
          <p className="text-xs text-muted">
            {trainee.district} · {trainee.careerTarget ? `Targeting: ${trainee.careerTarget.targetRole}` : "No career goal set yet"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/trainee/outcomes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Update Employment</span>
          </Link>
          <Link
            href="/trainee/roadmap"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border hover:bg-sage-50 text-charcoal-800 text-xs font-semibold transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>My Roadmap</span>
          </Link>
        </div>
      </div>

      {/* Next Best Action Banner */}
      {nextAction && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                Next Best Action
              </p>
              <p className="text-xs font-semibold text-emerald-900">{nextAction.text}</p>
              {nextAction.why && (
                <p className="text-[11px] text-emerald-700 mt-0.5">{nextAction.why}</p>
              )}
            </div>
          </div>
          <Link
            href={nextAction.href}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shrink-0"
          >
            Go
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Pending Follow-Up Alert */}
      {pendingFollowups.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-900">
                {pendingFollowups[0].milestoneDays}-Day Follow-Up Due
              </h4>
              <p className="text-[11px] text-amber-800">
                Complete your check-in to record employment progress.
              </p>
            </div>
          </div>
          <Link
            href="/trainee/followups"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shrink-0"
          >
            Complete Follow-Up
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Career Readiness */}
        <div className="bg-white rounded-3xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Career Readiness</p>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          {readiness?.overall !== null && readiness !== null ? (
            <>
              <p className="font-display font-extrabold text-3xl text-charcoal-800">{readiness.overall}%</p>
              <div className="mt-2 h-1 bg-sage-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${readiness.overall}%` }} />
              </div>
              <p className="text-[11px] text-muted mt-1">{readiness.dataQuality === "SUFFICIENT" ? "Based on profile" : "Partial data"}</p>
            </>
          ) : (
            <>
              <p className="font-display font-extrabold text-2xl text-charcoal-400">—</p>
              <p className="text-[11px] text-muted mt-1">
                {trainee.careerTarget ? "Add skills to calculate" : "Set career goal first"}
              </p>
            </>
          )}
        </div>

        {/* Skill Gap */}
        <div className="bg-white rounded-3xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Skill Gap</p>
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          {skillGap.length > 0 ? (
            <>
              <p className="font-display font-extrabold text-3xl text-charcoal-800">
                {skillGap.filter((g) => g.status === "MISSING" && g.importance === "REQUIRED").length}
              </p>
              <p className="text-[11px] text-muted mt-1">required skills missing</p>
              <Link href="/trainee/recommendations" className="text-[11px] text-emerald-800 font-semibold hover:underline mt-1 block">
                View gap →
              </Link>
            </>
          ) : (
            <>
              <p className="font-display font-extrabold text-2xl text-charcoal-400">—</p>
              <p className="text-[11px] text-muted mt-1">
                {trainee.careerTarget ? "No career path data yet" : "Set a career goal"}
              </p>
            </>
          )}
        </div>

        {/* Roadmap progress */}
        <div className="bg-white rounded-3xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Roadmap</p>
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          {roadmapTotal > 0 ? (
            <>
              <p className="font-display font-extrabold text-3xl text-charcoal-800">
                {roadmapCompleted}<span className="text-base text-muted">/{roadmapTotal}</span>
              </p>
              <div className="mt-2 h-1 bg-sage-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(roadmapCompleted / roadmapTotal) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-muted mt-1">milestones done</p>
            </>
          ) : (
            <>
              <p className="font-display font-extrabold text-2xl text-charcoal-400">—</p>
              <Link href="/trainee/roadmap" className="text-[11px] text-emerald-800 font-semibold hover:underline mt-1 block">
                Generate roadmap →
              </Link>
            </>
          )}
        </div>

        {/* Verified Skills */}
        <div className="bg-white rounded-3xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Skills</p>
            <Award className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <p className="font-display font-extrabold text-3xl text-charcoal-800">{trainee.skills.length}</p>
          <p className="text-[11px] text-muted mt-1">in your profile</p>
          <Link href="/trainee/skills" className="text-[11px] text-emerald-800 font-semibold hover:underline mt-1 block">
            Manage →
          </Link>
        </div>
      </div>

      {/* Middle grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Skill Gap breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-800" />
              <h3 className="font-display font-bold text-base text-charcoal-800">
                {trainee.careerTarget ? `Skill Gap: ${trainee.careerTarget.targetRole}` : "Skills Profile"}
              </h3>
            </div>
            <Link href="/trainee/recommendations" className="text-xs text-emerald-800 hover:underline font-semibold">
              Full Analysis →
            </Link>
          </div>

          {trainee.skills.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-border rounded-2xl">
              <Award className="w-6 h-6 text-muted mx-auto mb-2" />
              <p className="text-xs text-muted">No skills added yet.</p>
              <Link href="/trainee/skills" className="text-xs text-emerald-800 font-semibold hover:underline">
                Add your skills →
              </Link>
            </div>
          ) : skillGap.length > 0 ? (
            <div className="space-y-2">
              {/* Show strong, developing, missing */}
              {skillGap.filter((g) => g.importance === "REQUIRED").slice(0, 8).map((g) => (
                <div key={g.skillId} className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${
                    g.status === "STRONG" ? "text-charcoal-700" :
                    g.status === "DEVELOPING" ? "text-amber-700" :
                    "text-red-700"
                  }`}>
                    {g.skillName}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    g.status === "STRONG" ? "bg-emerald-50 text-emerald-700" :
                    g.status === "DEVELOPING" ? "bg-amber-50 text-amber-700" :
                    "bg-red-50 text-red-700"
                  }`}>
                    {g.status === "STRONG" ? "Strong" : g.status === "DEVELOPING" ? "Developing" : "Missing"}
                  </span>
                </div>
              ))}
              {missingRequiredSkills.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Top Gaps to Close</p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingRequiredSkills.map((g) => (
                      <span key={g.skillId} className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-medium border border-red-100">
                        {g.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {trainee.skills.map((ts) => (
                <SkillBadge
                  key={ts.id}
                  name={ts.skill.name}
                  category={ts.skill.category}
                  proficiency={ts.proficiencyLevel}
                  verifiedByAssessment={ts.verifiedByAssessment}
                  verifiedByEmployer={ts.verifiedByEmployer}
                />
              ))}
            </div>
          )}
        </div>

        {/* AI Diagnostic (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-border shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="font-display font-bold text-base text-charcoal-800">
                AI Diagnostic
              </h3>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              riskReport.riskLevel === "LOW" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
              riskReport.riskLevel === "MODERATE" ? "bg-amber-50 text-amber-800 border-amber-200" :
              "bg-red-50 text-red-800 border-red-200"
            }`}>
              {riskReport.riskLevel} RISK
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">{riskReport.advisorySummary}</p>

          <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px]">
            {riskReport.primaryFactors.slice(0, 3).map((f, idx) => (
              <div key={idx} className="flex items-center justify-between text-muted">
                <span>{f.factor}</span>
                <span className={f.impact === "POSITIVE" ? "text-emerald-700 font-semibold" : "text-amber-600 font-semibold"}>
                  {f.impact === "POSITIVE" ? `+${f.weight} pts` : `${f.weight} pts`}
                </span>
              </div>
            ))}
          </div>

          {/* Readiness breakdown if available */}
          {readiness?.breakdown?.skills !== null && readiness !== null && (
            <div className="pt-2 border-t border-border/50 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Readiness Breakdown</p>
              {[
                { label: "Skills", val: readiness.breakdown.skills },
                { label: "Projects", val: readiness.breakdown.projects },
                { label: "Certifications", val: readiness.breakdown.certifications },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center gap-2 text-[11px]">
                  <span className="w-20 text-muted">{label}</span>
                  <div className="flex-1 h-1 bg-sage-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${val ?? 0}%` }}
                    />
                  </div>
                  <span className="font-bold text-charcoal-700 w-8 text-right">{val ?? "—"}{val !== null ? "%" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-charcoal-800">Career Timeline</h3>
            <p className="text-xs text-muted">Training → certification → employment → retention milestones</p>
          </div>
          <Link href="/trainee/outcomes" className="text-xs font-semibold text-emerald-800 hover:underline">
            Add Event +
          </Link>
        </div>
        <Timeline
          events={timelineEvents}
          emptyMessage="No events yet. Add your employment history to start tracking your career journey."
        />
      </div>

    </div>
  );
}
