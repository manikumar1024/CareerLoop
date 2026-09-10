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
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  GraduationCap, 
  Award, 
  Briefcase, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  CheckCircle2
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
    },
  });

  if (!trainee) {
    return (
      <EmptyState
        title="Trainee Profile Not Initialized"
        description="Please complete your profile details to activate your digital trainee identifier and career tracking."
        actionText="Setup Trainee Profile"
        actionHref="/onboarding"
      />
    );
  }

  // Calculate real AI employability risk score
  const activeEnrollment = trainee.enrollments[0];
  const assessment = activeEnrollment?.assessments[0];
  const riskReport = evaluateEmployabilityRisk({
    traineeId: trainee.traineeId,
    attendancePercentage: activeEnrollment?.attendancePercentage || 95,
    assessmentScore: assessment?.scoreObtained || 80,
    skillsCount: trainee.skills.length,
    isEmployed: trainee.employmentRecords.length > 0 || trainee.selfEmployments.length > 0,
    hasCertifiedCredentials: trainee.certifications.length > 0,
  });

  // Build real longitudinal timeline events
  const timelineEvents: TimelineEvent[] = [];

  trainee.enrollments.forEach((e) => {
    timelineEvents.push({
      id: e.id,
      type: "TRAINING",
      title: e.program.title,
      subtitle: `Enrolled in ${e.program.sector}`,
      date: e.enrollmentDate,
      details: `Attendance: ${e.attendancePercentage}% · Grade: ${e.grade || "In Progress"}`,
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
      details: `Issued by ${c.issuingAuthority}`,
      isVerified: c.verified,
    });
  });

  trainee.employmentRecords.forEach((emp) => {
    timelineEvents.push({
      id: emp.id,
      type: "EMPLOYMENT",
      title: `${emp.jobTitle} at ${emp.companyName}`,
      subtitle: `Location: ${emp.locationDistrict} · ${emp.employmentType.replace(/_/g, " ")}`,
      date: emp.startDate,
      salary: emp.monthlySalary,
      details: `Skill Relevance: ${emp.skillRelevanceScore}/5 · Status: ${emp.verificationStatus.replace(/_/g, " ")}`,
      isVerified: emp.verificationStatus === "EMPLOYER_VERIFIED",
    });
  });

  trainee.selfEmployments.forEach((s) => {
    timelineEvents.push({
      id: s.id,
      type: "PLACEMENT",
      title: `Founded ${s.businessName}`,
      subtitle: `${s.businessType} · ${s.sector}`,
      date: s.startDate,
      salary: s.monthlyNetIncome,
      details: `Active Enterprise · Hired ${s.employeesHired} employee(s)`,
      status: s.businessStatus,
    });
  });

  trainee.apprenticeships.forEach((a) => {
    timelineEvents.push({
      id: a.id,
      type: "PLACEMENT",
      title: `Apprentice: ${a.tradeRole}`,
      subtitle: `Host: ${a.hostOrganization}`,
      date: a.startDate,
      salary: a.stipendAmount,
      details: a.isCompleted ? "Completed Apprenticeship" : "Active Apprenticeship",
    });
  });

  trainee.followUps.forEach((f) => {
    if (f.isCompleted) {
      timelineEvents.push({
        id: f.id,
        type: "FOLLOWUP",
        title: `${f.milestoneDays}-Day Longitudinal Outcome Follow-up`,
        subtitle: f.isEmployed ? `Employed as ${f.jobTitle || "Active"}` : `Non-placement: ${f.nonPlacementReason || "Seeking Job"}`,
        date: f.completedDate || f.createdAt,
        salary: f.currentSalary || undefined,
        details: f.feedback || (f.wageIncreasePercent ? `Received +${f.wageIncreasePercent}% wage increment` : undefined),
      });
    }
  });

  // Sort events chronologically (newest first)
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pending follow-ups
  const pendingFollowups = trainee.followUps.filter((f) => !f.isCompleted);

  return (
    <div className="space-y-8">
      
      {/* Top Header & Identity Capsule */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {trainee.traineeId}
            </span>
            <StatusBadge status={trainee.currentStatus} />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            {user.name || "Trainee Dashboard"}
          </h1>
          <p className="text-xs text-muted">
            District: {trainee.district} · Target Role: {trainee.targetRole || "Skill Trainee"}
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
            href="/trainee/recommendations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-pill hover:bg-white text-charcoal-800 text-xs font-semibold border border-border transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>AI Skill Gap</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Verified Skills"
          value={trainee.skills.length}
          subtitle="Assessed & mapped skills"
          icon={Award}
          badge={trainee.skills.length >= 4 ? "Broad Profile" : "Building"}
        />

        <MetricCard
          title="Certifications"
          value={trainee.certifications.length}
          subtitle="Verifiable credentials"
          icon={GraduationCap}
        />

        <MetricCard
          title="Milestone Follow-ups"
          value={trainee.followUps.filter((f) => f.isCompleted).length}
          subtitle={`${pendingFollowups.length} pending survey`}
          icon={Clock}
        />

        <MetricCard
          title="Employability Score"
          value={`${riskReport.employabilityScore}/100`}
          subtitle={`Risk Level: ${riskReport.riskLevel}`}
          icon={Sparkles}
          badge={riskReport.riskLevel === "LOW" ? "High Readiness" : "Action Needed"}
        />
      </div>

      {/* Pending Follow-Up Alert Banner */}
      {pendingFollowups.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-amber-900">
                {pendingFollowups[0].milestoneDays}-Day Career Follow-Up Milestone Due
              </h4>
              <p className="text-[11px] text-amber-800">
                Please complete your quick check-in to record your current employment and wage progression.
              </p>
            </div>
          </div>
          <Link
            href="/trainee/followups"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shrink-0"
          >
            <span>Complete Follow-Up</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Grid: Skills Snapshot + AI Employability Risk Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Skills Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-800" />
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Skill Profile & Verified Competencies
              </h3>
            </div>
            <Link href="/trainee/skills" className="text-xs text-emerald-800 hover:underline font-semibold">
              Manage Skills →
            </Link>
          </div>

          {trainee.skills.length === 0 ? (
            <p className="text-xs text-muted py-4">No skills mapped yet. Add your core technical and soft skills.</p>
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

        {/* AI Employability Risk Diagnostic (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-border shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="font-display font-bold text-base text-charcoal-800">
                AI Outcome Diagnostic
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                riskReport.riskLevel === "LOW"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : riskReport.riskLevel === "MODERATE"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {riskReport.riskLevel} RISK
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            {riskReport.advisorySummary}
          </p>

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
        </div>

      </div>

      {/* Longitudinal Timeline Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-charcoal-800">
              Longitudinal Career Timeline
            </h3>
            <p className="text-xs text-muted">
              Chronological lifecycle tracking from training enrollment to retention milestones
            </p>
          </div>
          <Link
            href="/trainee/outcomes"
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Add Career Event +
          </Link>
        </div>

        <Timeline
          events={timelineEvents}
          emptyMessage="No training or employment milestones recorded yet. Add your employment history to begin tracking."
        />
      </div>

    </div>
  );
}
