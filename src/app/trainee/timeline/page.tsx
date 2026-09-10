import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import Timeline, { TimelineEvent } from "@/components/Timeline";
import { Clock, BookOpen, Award, Briefcase, TrendingUp } from "lucide-react";

export const revalidate = 0;

export default async function CareerTimelinePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      enrollments: { include: { program: true, assessments: true } },
      certifications: { include: { program: true } },
      employmentRecords: { include: { employer: true } },
      selfEmployments: true,
      apprenticeships: true,
      followUps: { where: { isCompleted: true } },
      applications: {
        include: { job: { include: { employer: true } } },
        where: { status: { in: ["SHORTLISTED", "OFFER_MADE", "ACCEPTED"] } },
      },
    },
  });

  if (!trainee) return null;

  const events: TimelineEvent[] = [];

  trainee.enrollments.forEach(e => {
    events.push({
      id: `enroll-${e.id}`,
      type: "TRAINING",
      title: `Enrolled: ${e.program.title}`,
      subtitle: `${e.program.sector} · ${e.status.replace(/_/g, " ")}`,
      date: e.enrollmentDate,
      details: [
        e.attendancePercentage !== null && e.attendancePercentage !== undefined
          ? `Attendance: ${e.attendancePercentage}%`
          : null,
        e.grade ? `Grade: ${e.grade}` : null,
        e.completionDate ? `Completed: ${new Date(e.completionDate).toLocaleDateString()}` : null,
      ].filter(Boolean).join(" · ") || undefined,
      status: e.status,
    });

    e.assessments.forEach(a => {
      events.push({
        id: `assess-${a.id}`,
        type: "TRAINING",
        title: `Assessment: ${a.title}`,
        subtitle: `Score: ${a.scoreObtained}/${a.maxScore} · ${a.passed ? "Passed" : "Did not pass"}`,
        date: a.assessmentDate,
        details: a.feedback || undefined,
        status: a.passed ? "COMPLETED" : "FAILED",
      });
    });
  });

  trainee.certifications.forEach(c => {
    events.push({
      id: `cert-${c.id}`,
      type: "CERTIFICATION",
      title: `Certified: ${c.program.title}`,
      subtitle: `${c.issuingAuthority} · ${c.certificateNumber}`,
      date: c.issueDate,
      details: `Status: ${c.verificationStatus.replace(/_/g, " ")}`,
      isVerified: c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED",
    });
  });

  trainee.applications
    .filter(a => a.status === "ACCEPTED" || a.status === "OFFER_MADE")
    .forEach(a => {
      events.push({
        id: `app-${a.id}`,
        type: "PLACEMENT",
        title: `${a.status === "ACCEPTED" ? "Accepted Offer" : "Offer Received"}: ${a.job.title}`,
        subtitle: a.job.employer.companyName,
        date: a.updatedAt,
        status: a.status,
      });
    });

  trainee.employmentRecords.forEach(emp => {
    events.push({
      id: `emp-${emp.id}`,
      type: "EMPLOYMENT",
      title: `${emp.jobTitle} at ${emp.companyName}`,
      subtitle: `${emp.locationDistrict} · ${emp.employmentType.replace(/_/g, " ")}`,
      date: emp.startDate,
      salary: emp.monthlySalary,
      details: `Verification: ${emp.verificationStatus.replace(/_/g, " ")}`,
      isVerified: emp.verificationStatus === "EMPLOYER_VERIFIED",
    });
  });

  trainee.selfEmployments.forEach(s => {
    events.push({
      id: `self-${s.id}`,
      type: "PLACEMENT",
      title: `Founded: ${s.businessName}`,
      subtitle: `${s.businessType} · ${s.sector}`,
      date: s.startDate,
      salary: s.monthlyNetIncome,
      details: `${s.employeesHired} employee(s) hired`,
      status: s.businessStatus,
    });
  });

  trainee.apprenticeships.forEach(a => {
    events.push({
      id: `appr-${a.id}`,
      type: "PLACEMENT",
      title: `Apprentice: ${a.tradeRole}`,
      subtitle: `Host: ${a.hostOrganization}`,
      date: a.startDate,
      salary: a.stipendAmount,
      details: a.isCompleted ? "Completed" : "Active Apprenticeship",
    });
  });

  trainee.followUps.forEach(f => {
    events.push({
      id: `followup-${f.id}`,
      type: "FOLLOWUP",
      title: `${f.milestoneDays}-Day Career Check-in`,
      subtitle: f.isEmployed
        ? `Employed: ${f.jobTitle || "Current Role"}${f.companyName ? ` at ${f.companyName}` : ""}`
        : `Status: ${f.nonPlacementReason?.replace(/_/g, " ") || "Not Employed"}`,
      date: f.completedDate || f.createdAt,
      salary: f.currentSalary || undefined,
      details: [
        f.wageIncreasePercent && f.wageIncreasePercent > 0 ? `Wage growth: +${f.wageIncreasePercent}%` : null,
        f.promotionReceived ? "Received promotion" : null,
        f.trainingRelevance ? `Training relevance: ${f.trainingRelevance.replace(/_/g, " ")}` : null,
        f.feedback,
      ].filter(Boolean).join(" · ") || undefined,
    });
  });

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const yearsMap: Record<string, TimelineEvent[]> = {};
  events.forEach(event => {
    const year = new Date(event.date).getFullYear().toString();
    if (!yearsMap[year]) yearsMap[year] = [];
    yearsMap[year].push(event);
  });
  const years = Object.keys(yearsMap).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Career Timeline
        </h1>
        <p className="text-xs text-muted">
          Your complete longitudinal career journey — from first training enrollment to employment milestones.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Training Events", count: events.filter(e => e.type === "TRAINING").length, icon: BookOpen, color: "bg-blue-50 text-blue-700" },
          { label: "Certifications", count: events.filter(e => e.type === "CERTIFICATION").length, icon: Award, color: "bg-amber-50 text-amber-700" },
          { label: "Employment", count: events.filter(e => e.type === "EMPLOYMENT").length, icon: Briefcase, color: "bg-emerald-50 text-emerald-700" },
          { label: "Follow-ups", count: events.filter(e => e.type === "FOLLOWUP").length, icon: Clock, color: "bg-purple-50 text-purple-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 border border-current/10 ${s.color}`}>
            <s.icon className="w-5 h-5 mb-2 opacity-70" />
            <p className="font-display font-bold text-2xl">{s.count}</p>
            <p className="text-[11px] font-semibold opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {events.length === 0 ? (
        <EmptyState
          title="No Career Events Yet"
          description="Your career timeline will populate as you enroll in training, complete assessments, earn certifications, and record employment."
          actionText="Start with Training"
          actionHref="/trainee/training"
        />
      ) : (
        <div className="space-y-8">
          {years.map(year => (
            <div key={year}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-display font-bold text-sm text-charcoal-800 bg-white border border-border px-3 py-1 rounded-full">
                  {year}
                </span>
                <div className="flex-1 border-t border-border/60" />
              </div>
              <Timeline
                events={yearsMap[year]}
                emptyMessage=""
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
