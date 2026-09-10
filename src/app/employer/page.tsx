import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { 
  Building2, 
  Users, 
  CheckSquare, 
  Clock, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  TrendingUp
} from "lucide-react";

export const revalidate = 0;

export default async function EmployerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer) {
    return (
      <EmptyState
        title="Employer Profile Not Setup"
        description="Please initialize your enterprise profile to access employee verifications."
        actionText="Setup Organization"
        actionHref="/onboarding"
      />
    );
  }

  // Query records matching either employerId OR companyName
  const allEmployments = await prisma.employmentRecord.findMany({
    where: {
      OR: [
        { employerId: employer.id },
        { companyName: { contains: employer.companyName } },
      ],
    },
    include: {
      trainee: { include: { user: true, skills: { include: { skill: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const verifiedList = allEmployments.filter((e) => e.verificationStatus === "EMPLOYER_VERIFIED");
  const pendingList = allEmployments.filter((e) => e.verificationStatus === "PENDING_VERIFICATION" || e.verificationStatus === "SELF_REPORTED");

  const avgSalary =
    verifiedList.length > 0
      ? Math.round(verifiedList.reduce((acc, curr) => acc + curr.monthlySalary, 0) / verifiedList.length)
      : 0;

  const verifiedWithScore = verifiedList.filter(e => e.skillRelevanceScore !== null);
  const avgSkillScore =
    verifiedWithScore.length > 0
      ? Math.round((verifiedWithScore.reduce((acc, curr) => acc + (curr.skillRelevanceScore ?? 0), 0) / verifiedWithScore.length) * 10) / 10
      : 0;

  async function verifyEmploymentAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const recordId = formData.get("recordId") as string;
    const actionType = formData.get("actionType") as string; // VERIFY or REJECT
    const notes = formData.get("notes") as string;

    const empProfile = await prisma.employerProfile.findUnique({ where: { userId: userSession.id } });
    if (!empProfile) return;

    await prisma.employmentRecord.update({
      where: { id: recordId },
      data: {
        employerId: empProfile.id,
        verificationStatus: actionType === "VERIFY" ? "EMPLOYER_VERIFIED" : "REJECTED",
        verificationNotes: notes || (actionType === "VERIFY" ? "Verified by authorized HR representative." : "Rejected by employer."),
        verifiedAt: new Date(),
      },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "EMPLOYER",
      action: actionType === "VERIFY" ? "VERIFIED_EMPLOYMENT_RECORD" : "REJECTED_EMPLOYMENT_RECORD",
      targetEntity: "EmploymentRecord",
      targetEntityId: recordId,
    });

    revalidatePath("/employer");
    revalidatePath("/employer/verifications");
  }

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {employer.industry}
            </span>
            <span className="text-xs text-muted">District: {employer.district}</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            {employer.companyName}
          </h1>
          <p className="text-xs text-muted">
            Employer Verification & Longitudinal Retention Dashboard
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/employer/verifications"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Verification Queue ({pendingList.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Verified Employees"
          value={verifiedList.length}
          subtitle="Confirmed trainee hires"
          icon={Users}
        />

        <MetricCard
          title="Pending Verifications"
          value={pendingList.length}
          subtitle="Self-reported claims"
          icon={Clock}
          badge={pendingList.length > 0 ? "Action Required" : "Up to date"}
        />

        <MetricCard
          title="Avg Monthly Wage"
          value={avgSalary > 0 ? formatCurrency(avgSalary) : "—"}
          subtitle="Across active recruits"
          icon={TrendingUp}
        />

        <MetricCard
          title="Skill Relevance Score"
          value={avgSkillScore > 0 ? `${avgSkillScore}/5` : "—"}
          subtitle="Workplace skill alignment"
          icon={Star}
        />
      </div>

      {/* Pending Verification Queue Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div>
            <h3 className="font-display font-bold text-lg text-charcoal-800">
              Candidate Employment Verification Queue
            </h3>
            <p className="text-xs text-muted">
              Trainees who submitted employment records stating they work at {employer.companyName}.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            {pendingList.length} Pending
          </span>
        </div>

        {pendingList.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            ✨ All trainee employment claims have been verified. No pending records.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingList.map((record) => (
              <div
                key={record.id}
                className="p-5 rounded-2xl bg-sage-50/60 border border-sage-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-charcoal-800">
                      {record.trainee.user.name || "Candidate"}
                    </h4>
                    <span className="font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {record.trainee.traineeId}
                    </span>
                    <StatusBadge status={record.verificationStatus} />
                  </div>

                  <p className="text-xs text-charcoal-700 font-medium">
                    Claimed Role: <strong>{record.jobTitle}</strong> · Salary: <strong>{formatCurrency(record.monthlySalary)}/mo</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                    <span>Joined: {formatDate(record.startDate)}</span>
                    <span>·</span>
                    <span>Type: {record.employmentType.replace(/_/g, " ")}</span>
                    <span>·</span>
                    <span>Skill Relevance: {record.skillRelevanceScore}/5</span>
                  </div>

                  {record.trainee.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {record.trainee.skills.slice(0, 4).map((ts) => (
                        <span key={ts.id} className="text-[10px] px-2 py-0.5 rounded bg-white text-muted border border-border">
                          {ts.skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verification Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  <form action={verifyEmploymentAction}>
                    <input type="hidden" name="recordId" value={record.id} />
                    <input type="hidden" name="actionType" value="VERIFY" />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs tracking-wide transition shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Employment</span>
                    </button>
                  </form>

                  <form action={verifyEmploymentAction}>
                    <input type="hidden" name="recordId" value={record.id} />
                    <input type="hidden" name="actionType" value="REJECT" />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 font-semibold text-xs border border-red-200 transition"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Employees Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Active Verified Recruits ({verifiedList.length})
            </h3>
          </div>
          <Link href="/employer/employees" className="text-xs text-emerald-800 hover:underline font-semibold">
            View Full Employee Roster →
          </Link>
        </div>

        {verifiedList.length === 0 ? (
          <p className="text-xs text-muted py-4 text-center">
            No candidates currently confirmed. Verify candidate submissions above to build your audit-ready roster.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {verifiedList.map((emp) => (
              <div key={emp.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-charcoal-800">{emp.trainee.user.name}</span>
                    <span className="font-mono text-[10px] text-muted">({emp.trainee.traineeId})</span>
                  </div>
                  <p className="text-muted text-[11px]">{emp.jobTitle} · Joined {formatDate(emp.startDate)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-800">{formatCurrency(emp.monthlySalary)}/mo</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    Verified on {formatDate(emp.verifiedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
