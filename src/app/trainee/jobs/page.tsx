import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, MapPin, DollarSign, CheckCircle2, Clock, ArrowRight, Search } from "lucide-react";

export const revalidate = 0;

export default async function TraineeJobsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      careerTarget: true,
      skills: { include: { skill: true } },
      applications: { select: { jobId: true, status: true } },
    },
  });

  if (!trainee) return null;

  // Fetch open jobs, optionally filtered by career target industry
  const openJobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    include: {
      employer: true,
      skillRequirements: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const appliedJobIds = new Set(trainee.applications.map(a => a.jobId));
  const traineeSkillNames = new Set(trainee.skills.map(s => s.skill.name.toLowerCase()));

  // Calculate simple match score for each job
  const jobsWithMatch = openJobs.map(job => {
    const requiredSkills = job.skillRequirements.filter(sr => sr.required);
    const preferredSkills = job.skillRequirements.filter(sr => !sr.required);

    const matchedRequired = requiredSkills.filter(sr =>
      traineeSkillNames.has(sr.skill.name.toLowerCase())
    ).length;
    const matchedPreferred = preferredSkills.filter(sr =>
      traineeSkillNames.has(sr.skill.name.toLowerCase())
    ).length;

    const matchScore = requiredSkills.length > 0
      ? Math.round((matchedRequired / requiredSkills.length) * 100)
      : null;

    return { ...job, matchScore, matchedRequired, matchedPreferred, requiredSkills, preferredSkills };
  });

  // Sort by match score descending (jobs with scores first)
  jobsWithMatch.sort((a, b) => {
    if (a.matchScore === null && b.matchScore === null) return 0;
    if (a.matchScore === null) return 1;
    if (b.matchScore === null) return -1;
    return b.matchScore - a.matchScore;
  });

  async function applyAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const jobId = formData.get("jobId") as string;
    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: userSession.id } });
    if (!traineeProfile) return;

    // Check not already applied
    const existing = await prisma.application.findUnique({
      where: { traineeId_jobId: { traineeId: traineeProfile.id, jobId } },
    });
    if (existing) return;

    await prisma.application.create({
      data: {
        traineeId: traineeProfile.id,
        jobId,
        status: "APPLIED",
      },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "TRAINEE",
      action: "APPLIED_TO_JOB",
      targetEntity: "Application",
      metadata: { jobId },
    });

    revalidatePath("/trainee/jobs");
    revalidatePath("/trainee/applications");
  }

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Job Opportunities
          </h1>
          <p className="text-xs text-muted">
            Open positions from registered employers. Match scores are calculated from your verified skills vs. job requirements.
          </p>
        </div>
        <a href="/trainee/applications"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 text-white text-xs font-semibold">
          My Applications ({trainee.applications.length})
        </a>
      </div>

      {/* Career Target Context */}
      {trainee.careerTarget && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-700" />
            <span className="text-emerald-900">
              Target role: <strong>{trainee.careerTarget.targetRole}</strong>
              {trainee.careerTarget.preferredLocations && ` · ${trainee.careerTarget.preferredLocations}`}
              {trainee.careerTarget.targetSalaryMin && ` · ${formatCurrency(trainee.careerTarget.targetSalaryMin)}+/mo`}
            </span>
          </div>
          <a href="/trainee/career-target" className="text-emerald-800 font-semibold hover:underline">
            Edit Target →
          </a>
        </div>
      )}

      {!trainee.careerTarget && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
          <span className="text-amber-900">Set a career target to get personalized job matching.</span>
          <a href="/trainee/career-target" className="text-amber-800 font-semibold hover:underline">
            Set Target →
          </a>
        </div>
      )}

      {/* Jobs List */}
      {openJobs.length === 0 ? (
        <EmptyState
          title="No Jobs Available"
          description="No open positions are currently listed. Check back later or ask your training provider to connect with employers."
          actionText="View Training Programs"
          actionHref="/trainee/training"
        />
      ) : (
        <div className="space-y-4">
          {jobsWithMatch.map(job => {
            const alreadyApplied = appliedJobIds.has(job.id);

            return (
              <div key={job.id} className="bg-white rounded-3xl p-6 border border-border shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                        {job.employer.companyName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-charcoal-800">{job.title}</h3>
                        <p className="text-xs text-muted">{job.employer.companyName} · {job.employer.industry}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.locationDistrict}
                      </span>
                      {(job.salaryMin || job.salaryMax) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.salaryMin ? formatCurrency(job.salaryMin) : "—"}
                          {job.salaryMax ? `–${formatCurrency(job.salaryMax)}` : ""}/mo
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sage-50 border border-sage-200">
                        {job.employmentType.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-muted">
                        {job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Skill Requirements */}
                    {job.skillRequirements.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {job.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {job.requiredSkills.map(sr => {
                              const hasSkill = traineeSkillNames.has(sr.skill.name.toLowerCase());
                              return (
                                <span key={sr.id} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                                  hasSkill ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}>
                                  {hasSkill ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 text-center">○</span>}
                                  {sr.skill.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Match Score + Apply */}
                  <div className="shrink-0 flex flex-col items-end gap-3">
                    {job.matchScore !== null && (
                      <div className={`text-center p-2.5 rounded-xl border ${
                        job.matchScore >= 70 ? "bg-emerald-50 border-emerald-200" :
                        job.matchScore >= 40 ? "bg-amber-50 border-amber-200" :
                        "bg-red-50 border-red-200"
                      }`}>
                        <p className={`font-display font-bold text-xl ${
                          job.matchScore >= 70 ? "text-emerald-700" :
                          job.matchScore >= 40 ? "text-amber-700" : "text-red-700"
                        }`}>{job.matchScore}%</p>
                        <p className="text-[10px] text-muted">Skill Match</p>
                      </div>
                    )}

                    {alreadyApplied ? (
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Applied
                      </div>
                    ) : (
                      <form action={applyAction}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button type="submit"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition">
                          Apply Now
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Description preview */}
                {job.description && (
                  <p className="text-xs text-muted mt-3 pt-3 border-t border-border/40 line-clamp-2">
                    {job.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2 text-[10px] text-muted">
                  <span>Posted {formatDate(job.createdAt)}</span>
                  {job.deadline && <span>Deadline: {formatDate(job.deadline)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
