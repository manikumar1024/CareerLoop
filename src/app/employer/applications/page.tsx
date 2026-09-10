import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { formatCurrency, formatDate } from "@/lib/utils";
import SkillBadge from "@/components/SkillBadge";
import { Users, Briefcase, ShieldCheck, CheckCircle2, XCircle, Clock, Star } from "lucide-react";

export const revalidate = 0;

export default async function EmployerApplicationsPage({
  searchParams,
}: {
  searchParams: { jobId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
    include: {
      jobs: {
        select: { id: true, title: true, status: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!employer) {
    return (
      <EmptyState
        title="Employer Profile Not Setup"
        description="Set up your company profile to manage applications."
        actionText="Setup Profile"
        actionHref="/employer/profile"
      />
    );
  }

  const jobIds = employer.jobs.map(j => j.id);
  const selectedJobId = searchParams.jobId || null;

  const applications = await prisma.application.findMany({
    where: {
      jobId: { in: jobIds },
      ...(selectedJobId ? { jobId: selectedJobId } : {}),
    },
    include: {
      job: true,
      trainee: {
        include: {
          user: true,
          skills: { include: { skill: true } },
          certifications: true,
          enrollments: { include: { program: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  async function updateApplicationStatusAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const applicationId = formData.get("applicationId") as string;
    const status = formData.get("status") as string;
    const notes = formData.get("notes") as string;

    const empProfile = await prisma.employerProfile.findUnique({ where: { userId: userSession.id } });
    if (!empProfile) return;

    await prisma.application.update({
      where: { id: applicationId },
      data: { status, notes: notes || null },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "EMPLOYER",
      action: "UPDATED_APPLICATION_STATUS",
      targetEntity: "Application",
      targetEntityId: applicationId,
      metadata: { status, notes },
    });

    revalidatePath("/employer/applications");
  }

  const statusGroups = {
    "APPLIED": applications.filter(a => a.status === "APPLIED"),
    "SHORTLISTED": applications.filter(a => a.status === "SHORTLISTED"),
    "INTERVIEW_SCHEDULED": applications.filter(a => a.status === "INTERVIEW_SCHEDULED"),
    "OFFER_MADE": applications.filter(a => a.status === "OFFER_MADE"),
    "ACCEPTED": applications.filter(a => a.status === "ACCEPTED"),
    "REJECTED": applications.filter(a => a.status === "REJECTED"),
  };

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Applications
          </h1>
          <p className="text-xs text-muted">
            Review and manage candidate applications across your open positions.
          </p>
        </div>

        {/* Job Filter */}
        <div className="flex flex-wrap gap-2">
          <a href="/employer/applications"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              !selectedJobId ? "bg-emerald-800 text-white border-emerald-800" : "bg-white text-charcoal-700 border-border"
            }`}>
            All ({applications.length})
          </a>
          {employer.jobs.slice(0, 5).map(job => (
            <a key={job.id}
              href={`/employer/applications?jobId=${job.id}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition truncate max-w-[150px] ${
                selectedJobId === job.id ? "bg-emerald-800 text-white border-emerald-800" : "bg-white text-charcoal-700 border-border"
              }`}>
              {job.title}
            </a>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Object.entries(statusGroups).map(([status, apps]) => (
          <div key={status} className="rounded-xl p-3 bg-white border border-border text-center">
            <p className="font-display font-bold text-xl text-charcoal-800">{apps.length}</p>
            <p className="text-[10px] text-muted font-semibold">{status.replace(/_/g, " ")}</p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No Applications Yet"
          description="Candidates will appear here once they apply to your job listings."
          actionText="View Jobs"
          actionHref="/employer/jobs"
        />
      ) : (
        <div className="space-y-4">
          {applications.map(app => {
            const trainee = app.trainee;
            const verifiedSkills = trainee.skills.filter(s => s.verifiedByAssessment || s.verifiedByEmployer);
            const certCount = trainee.certifications.filter(
              c => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED"
            ).length;

            return (
              <div key={app.id} className="bg-white rounded-3xl p-6 border border-border shadow-card">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">

                  {/* Candidate Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                        {trainee.user.name?.charAt(0)?.toUpperCase() || "T"}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-charcoal-800">
                          {trainee.user.name || "Candidate"}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span className="font-mono">{trainee.traineeId}</span>
                          <span>·</span>
                          <span>{trainee.district}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-[11px] text-muted">
                      <span>Applied to: <strong className="text-charcoal-800">{app.job.title}</strong></span>
                      <span>·</span>
                      <span>{formatDate(app.appliedAt)}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold">{verifiedSkills.length} verified skills</span>
                      {certCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-700 font-semibold">{certCount} verified cert{certCount !== 1 ? "s" : ""}</span>
                        </>
                      )}
                    </div>

                    {trainee.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {trainee.skills.slice(0, 6).map(ts => (
                          <SkillBadge
                            key={ts.id}
                            name={ts.skill.name}
                            category={ts.skill.category}
                            proficiency={ts.proficiencyLevel}
                            verifiedByAssessment={ts.verifiedByAssessment}
                            verifiedByEmployer={ts.verifiedByEmployer}
                          />
                        ))}
                        {trainee.skills.length > 6 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sage-50 text-muted border border-sage-200">
                            +{trainee.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="shrink-0 flex flex-col gap-2 min-w-[160px]">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border text-center ${
                      app.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                      app.status === "OFFER_MADE" ? "bg-amber-50 text-amber-800 border-amber-200" :
                      app.status === "SHORTLISTED" ? "bg-blue-50 text-blue-800 border-blue-200" :
                      app.status === "REJECTED" ? "bg-red-50 text-red-800 border-red-200" :
                      "bg-gray-50 text-gray-700 border-gray-200"
                    }`}>
                      {app.status.replace(/_/g, " ")}
                    </span>

                    {!["ACCEPTED", "REJECTED"].includes(app.status) && (
                      <div className="flex flex-col gap-1.5">
                        {app.status === "APPLIED" && (
                          <form action={updateApplicationStatusAction}>
                            <input type="hidden" name="applicationId" value={app.id} />
                            <input type="hidden" name="status" value="SHORTLISTED" />
                            <button type="submit"
                              className="w-full px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold">
                              Shortlist
                            </button>
                          </form>
                        )}
                        {app.status === "SHORTLISTED" && (
                          <form action={updateApplicationStatusAction}>
                            <input type="hidden" name="applicationId" value={app.id} />
                            <input type="hidden" name="status" value="OFFER_MADE" />
                            <button type="submit"
                              className="w-full px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold">
                              Make Offer
                            </button>
                          </form>
                        )}
                        <form action={updateApplicationStatusAction}>
                          <input type="hidden" name="applicationId" value={app.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <button type="submit"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-semibold">
                            Reject
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
