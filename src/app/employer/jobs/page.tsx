import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, Plus, MapPin, DollarSign, Users, CheckCircle2, XCircle } from "lucide-react";

export const revalidate = 0;

export default async function EmployerJobsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
    include: {
      jobs: {
        include: {
          skillRequirements: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!employer) {
    return (
      <EmptyState
        title="Employer Profile Not Setup"
        description="Set up your company profile to post jobs."
        actionText="Setup Profile"
        actionHref="/employer/profile"
      />
    );
  }

  const allSkills = await prisma.skill.findMany({ orderBy: { name: "asc" } });

  async function createJobAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const empProfile = await prisma.employerProfile.findUnique({ where: { userId: userSession.id } });
    if (!empProfile) return;

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const locationDistrict = formData.get("locationDistrict") as string;
    const salaryMin = parseInt(formData.get("salaryMin") as string) || null;
    const salaryMax = parseInt(formData.get("salaryMax") as string) || null;
    const employmentType = formData.get("employmentType") as string;
    const experienceLevel = formData.get("experienceLevel") as string;
    const educationRequired = formData.get("educationRequired") as string;
    const deadlineStr = formData.get("deadline") as string;
    const skillIds = formData.getAll("skillIds") as string[];

    if (!title || !description || !locationDistrict) return;

    const job = await prisma.job.create({
      data: {
        employerId: empProfile.id,
        title,
        description,
        industry: empProfile.industry,
        locationDistrict,
        salaryMin,
        salaryMax,
        employmentType: employmentType || "FULL_TIME",
        experienceLevel: experienceLevel || "ENTRY",
        educationRequired: educationRequired || null,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
        status: "OPEN",
      },
    });

    // Add skill requirements
    if (skillIds.length > 0) {
      for (const skillId of skillIds) {
        await prisma.jobSkillRequirement.upsert({
          where: { jobId_skillId: { jobId: job.id, skillId } },
          update: {},
          create: {
            jobId: job.id,
            skillId,
            required: true,
            minLevel: "INTERMEDIATE",
          },
        });
      }
    }

    await logAuditAction({
      userId: userSession.id,
      role: "EMPLOYER",
      action: "CREATED_JOB",
      targetEntity: "Job",
      targetEntityId: job.id,
    });

    revalidatePath("/employer/jobs");
  }

  async function updateJobStatusAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const jobId = formData.get("jobId") as string;
    const status = formData.get("status") as string;

    const empProfile = await prisma.employerProfile.findUnique({ where: { userId: userSession.id } });
    if (!empProfile) return;

    await prisma.job.update({
      where: { id: jobId, employerId: empProfile.id },
      data: { status },
    });

    revalidatePath("/employer/jobs");
  }

  const openJobs = employer.jobs.filter(j => j.status === "OPEN");
  const closedJobs = employer.jobs.filter(j => j.status !== "OPEN");

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Job Listings
          </h1>
          <p className="text-xs text-muted">
            Manage your open positions. Jobs are matched against verified candidate skill profiles.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {openJobs.length} Open
          </span>
          <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
            {closedJobs.length} Closed
          </span>
        </div>
      </div>

      {/* Post New Job Form */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border/50">
          <Plus className="w-5 h-5 text-emerald-700" />
          <h3 className="font-display font-bold text-base text-charcoal-800">Post a New Job</h3>
        </div>

        <form action={createJobAction} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-charcoal-700 mb-1">Job Title *</label>
              <input type="text" name="title" required placeholder="e.g. Junior Software Engineer, Solar Technician"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Location District *</label>
              <input type="text" name="locationDistrict" required placeholder="e.g. Pune"
                defaultValue={employer.district}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Employment Type</label>
              <select name="employmentType" defaultValue="FULL_TIME"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Salary Min (₹/mo)</label>
              <input type="number" name="salaryMin" placeholder="e.g. 20000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Salary Max (₹/mo)</label>
              <input type="number" name="salaryMax" placeholder="e.g. 35000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Experience Level</label>
              <select name="experienceLevel" defaultValue="ENTRY"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20">
                <option value="ENTRY">Entry Level (0–2 years)</option>
                <option value="MID">Mid Level (2–5 years)</option>
                <option value="SENIOR">Senior Level (5+ years)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Application Deadline</label>
              <input type="date" name="deadline"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-charcoal-700 mb-1">Required Skills</label>
              <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border bg-sage-50/40">
                {allSkills.map(skill => (
                  <label key={skill.id} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" name="skillIds" value={skill.id}
                      className="rounded border-border text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-[11px] text-charcoal-700">{skill.name}</span>
                  </label>
                ))}
                {allSkills.length === 0 && (
                  <p className="text-xs text-muted">No skills in the taxonomy yet. Add skills via the admin panel.</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-charcoal-700 mb-1">Job Description *</label>
              <textarea name="description" required rows={4}
                placeholder="Describe the role, responsibilities, and what the ideal candidate looks like..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border/50">
            <button type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm">
              <Briefcase className="w-3.5 h-3.5" />
              Post Job
            </button>
          </div>
        </form>
      </div>

      {/* Active Jobs */}
      {employer.jobs.length === 0 ? (
        <EmptyState
          title="No Jobs Posted Yet"
          description="Post your first job to start receiving applications from verified candidates."
        />
      ) : (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Your Jobs ({employer.jobs.length})
          </h3>
          {employer.jobs.map(job => (
            <div key={job.id} className="bg-white rounded-3xl p-6 border border-border shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-charcoal-800">{job.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      job.status === "OPEN" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                      job.status === "FILLED" ? "bg-blue-50 text-blue-800 border-blue-200" :
                      "bg-gray-50 text-gray-700 border-gray-200"
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.locationDistrict}
                    </span>
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.salaryMin ? formatCurrency(job.salaryMin) : ""}
                        {job.salaryMax ? `–${formatCurrency(job.salaryMax)}` : ""}/mo
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {job._count.applications} application{job._count.applications !== 1 ? "s" : ""}
                    </span>
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>

                  {job.skillRequirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.skillRequirements.map(sr => (
                        <span key={sr.id} className="text-[10px] px-2 py-0.5 rounded bg-sage-50 text-charcoal-700 border border-sage-200">
                          {sr.skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  {job.status === "OPEN" && (
                    <form action={updateJobStatusAction}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <input type="hidden" name="status" value="CLOSED" />
                      <button type="submit"
                        className="px-3 py-1.5 rounded-xl bg-white border border-border text-xs font-semibold text-muted hover:border-red-300 hover:text-red-700 transition">
                        Close Job
                      </button>
                    </form>
                  )}
                  {job.status === "CLOSED" && (
                    <form action={updateJobStatusAction}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <input type="hidden" name="status" value="OPEN" />
                      <button type="submit"
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition">
                        Reopen
                      </button>
                    </form>
                  )}
                  <a href={`/employer/applications?jobId=${job.id}`}
                    className="px-3 py-1.5 rounded-xl bg-sage-50 border border-sage-200 text-xs font-semibold text-charcoal-700 hover:border-emerald-300 transition text-center">
                    View Applications
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
