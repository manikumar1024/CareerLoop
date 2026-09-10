import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";

export const revalidate = 0;

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-800 border-blue-200",
  SHORTLISTED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  INTERVIEW_SCHEDULED: "bg-purple-50 text-purple-800 border-purple-200",
  OFFER_MADE: "bg-amber-50 text-amber-900 border-amber-200",
  ACCEPTED: "bg-emerald-50 text-emerald-900 border-emerald-200",
  REJECTED: "bg-red-50 text-red-800 border-red-200",
  WITHDRAWN: "bg-gray-50 text-gray-700 border-gray-200",
};

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      applications: {
        include: {
          job: {
            include: {
              employer: true,
              skillRequirements: { include: { skill: true } },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  if (!trainee) return null;

  const activeApps = trainee.applications.filter(
    a => !["REJECTED", "WITHDRAWN"].includes(a.status)
  );
  const closedApps = trainee.applications.filter(
    a => ["REJECTED", "WITHDRAWN"].includes(a.status)
  );

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            My Applications
          </h1>
          <p className="text-xs text-muted">
            Track your job application journey from submission to offer.
          </p>
        </div>
        <a href="/trainee/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 text-white text-xs font-semibold">
          Find More Jobs
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Applied", count: trainee.applications.filter(a => a.status === "APPLIED").length, color: "bg-blue-50 text-blue-800" },
          { label: "Shortlisted", count: trainee.applications.filter(a => a.status === "SHORTLISTED").length, color: "bg-emerald-50 text-emerald-800" },
          { label: "Interview", count: trainee.applications.filter(a => a.status === "INTERVIEW_SCHEDULED").length, color: "bg-purple-50 text-purple-800" },
          { label: "Offer", count: trainee.applications.filter(a => a.status === "OFFER_MADE" || a.status === "ACCEPTED").length, color: "bg-amber-50 text-amber-800" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-3 text-center ${s.color} border border-current/20`}>
            <p className="font-display font-bold text-2xl">{s.count}</p>
            <p className="text-[11px] font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {trainee.applications.length === 0 ? (
        <EmptyState
          title="No Applications Yet"
          description="Browse open positions and apply to jobs that match your skills."
          actionText="Find Jobs"
          actionHref="/trainee/jobs"
        />
      ) : (
        <>
          {/* Active Applications */}
          {activeApps.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Active Applications ({activeApps.length})
              </h3>
              {activeApps.map(app => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          )}

          {/* Closed Applications */}
          {closedApps.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-charcoal-800 text-muted">
                Closed / Past ({closedApps.length})
              </h3>
              {closedApps.map(app => (
                <ApplicationCard key={app.id} application={app} muted />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ApplicationCard({ application, muted = false }: { application: any; muted?: boolean }) {
  const job = application.job;
  const colorClass = STATUS_COLORS[application.status] || STATUS_COLORS.APPLIED;

  return (
    <div className={`bg-white rounded-3xl p-6 border border-border shadow-card ${muted ? "opacity-70" : ""}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              {job.employer.companyName.charAt(0)}
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-charcoal-800">{job.title}</h4>
              <p className="text-xs text-muted">{job.employer.companyName}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {job.locationDistrict}
            </span>
            {(job.salaryMin || job.salaryMax) && (
              <span>
                {job.salaryMin ? formatCurrency(job.salaryMin) : ""}
                {job.salaryMax ? `–${formatCurrency(job.salaryMax)}` : ""}/mo
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Applied {formatDate(application.appliedAt)}
            </span>
          </div>

          {application.notes && (
            <p className="text-xs text-muted italic">{application.notes}</p>
          )}
        </div>

        <div className="shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${colorClass}`}>
            {application.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </div>
  );
}
