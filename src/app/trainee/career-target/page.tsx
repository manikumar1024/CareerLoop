import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { Target, Briefcase, MapPin, DollarSign, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { INDUSTRY_ROLE_TAXONOMY } from "@/lib/ai-service";
import { formatCurrency } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

export const revalidate = 0;

export default async function CareerTargetPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: { careerTarget: true, skills: { include: { skill: true } } },
  });

  if (!trainee) {
    return (
      <EmptyState
        title="Profile Not Found"
        description="Complete your onboarding to set a career target."
        actionText="Setup Profile"
        actionHref="/onboarding"
      />
    );
  }

  const target = trainee.careerTarget;
  const availableRoles = Object.keys(INDUSTRY_ROLE_TAXONOMY);

  async function saveTargetAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: userSession.id } });
    if (!traineeProfile) return;

    const targetRole = formData.get("targetRole") as string;
    const industry = formData.get("industry") as string;
    const preferredLocations = formData.get("preferredLocations") as string;
    const targetSalaryMin = parseInt(formData.get("targetSalaryMin") as string) || null;
    const targetSalaryMax = parseInt(formData.get("targetSalaryMax") as string) || null;
    const employmentType = formData.get("employmentType") as string;
    const experienceLevel = formData.get("experienceLevel") as string;
    const notes = formData.get("notes") as string;

    const existing = await prisma.careerTarget.findUnique({ where: { traineeId: traineeProfile.id } });

    if (existing) {
      await prisma.careerTarget.update({
        where: { traineeId: traineeProfile.id },
        data: {
          targetRole,
          industry: industry || null,
          preferredLocations: preferredLocations || null,
          targetSalaryMin,
          targetSalaryMax,
          employmentType: employmentType || "FULL_TIME",
          experienceLevel: experienceLevel || "ENTRY",
          notes: notes || null,
        },
      });
    } else {
      await prisma.careerTarget.create({
        data: {
          traineeId: traineeProfile.id,
          targetRole,
          industry: industry || null,
          preferredLocations: preferredLocations || null,
          targetSalaryMin,
          targetSalaryMax,
          employmentType: employmentType || "FULL_TIME",
          experienceLevel: experienceLevel || "ENTRY",
          notes: notes || null,
        },
      });
    }

    await logAuditAction({
      userId: userSession.id,
      role: "TRAINEE",
      action: "UPDATED_CAREER_TARGET",
      targetEntity: "CareerTarget",
    });

    revalidatePath("/trainee/career-target");
    revalidatePath("/trainee");
  }

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>Career Direction</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Career Target
        </h1>
        <p className="text-xs text-muted">
          Define where you want to go. Your career target powers skill gap analysis, job matching, and your learning roadmap.
        </p>
      </div>

      {/* Current Target Display */}
      {target && (
        <div className="bg-emerald-800 text-white rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Active Career Target</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">{target.targetRole}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/20 text-sm">
            {target.industry && (
              <div>
                <p className="text-emerald-300 text-[10px] uppercase font-bold">Industry</p>
                <p className="font-semibold text-white">{target.industry}</p>
              </div>
            )}
            {target.targetSalaryMin && (
              <div>
                <p className="text-emerald-300 text-[10px] uppercase font-bold">Target Salary</p>
                <p className="font-semibold text-white">
                  {formatCurrency(target.targetSalaryMin)}–{formatCurrency(target.targetSalaryMax || 0)}/mo
                </p>
              </div>
            )}
            {target.preferredLocations && (
              <div>
                <p className="text-emerald-300 text-[10px] uppercase font-bold">Locations</p>
                <p className="font-semibold text-white">{target.preferredLocations}</p>
              </div>
            )}
            <div>
              <p className="text-emerald-300 text-[10px] uppercase font-bold">Experience Level</p>
              <p className="font-semibold text-white">{target.experienceLevel || "ENTRY"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20">
            <a href="/trainee/recommendations"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition">
              <Sparkles className="w-3.5 h-3.5" />
              View Skill Gap Analysis
            </a>
            <a href="/trainee/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition">
              <Briefcase className="w-3.5 h-3.5" />
              Find Matching Jobs
            </a>
          </div>
        </div>
      )}

      {/* Role Selector Grid */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-800">Select or Update Career Target</h3>
        <p className="text-xs text-muted">
          Choose from standard industry roles with defined skill taxonomies, or enter a custom role below.
        </p>

        <div className="flex flex-wrap gap-2">
          {availableRoles.map(role => (
            <div key={role} className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-default ${
              target?.targetRole === role
                ? "bg-emerald-800 text-white border-emerald-800"
                : "bg-white text-charcoal-700 border-border hover:border-emerald-300"
            }`}>
              {role}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-800">
          {target ? "Update Career Target" : "Set Career Target"}
        </h3>

        <form action={saveTargetAction} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Target Role *</label>
              <input type="text" name="targetRole" required
                defaultValue={target?.targetRole || ""}
                placeholder="e.g. Full Stack Web Developer, Data Analyst"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
              <p className="text-[10px] text-muted mt-1">Use a standard role above or type a custom role</p>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Industry</label>
              <input type="text" name="industry"
                defaultValue={target?.industry || ""}
                placeholder="e.g. Technology, Healthcare, Manufacturing"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Preferred Locations</label>
              <input type="text" name="preferredLocations"
                defaultValue={target?.preferredLocations || ""}
                placeholder="e.g. Pune, Mumbai, Remote"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Employment Type</label>
              <select name="employmentType" defaultValue={target?.employmentType || "FULL_TIME"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Target Salary Min (₹/mo)</label>
              <input type="number" name="targetSalaryMin"
                defaultValue={target?.targetSalaryMin || ""}
                placeholder="e.g. 25000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Target Salary Max (₹/mo)</label>
              <input type="number" name="targetSalaryMax"
                defaultValue={target?.targetSalaryMax || ""}
                placeholder="e.g. 40000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Experience Level</label>
              <select name="experienceLevel" defaultValue={target?.experienceLevel || "ENTRY"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20">
                <option value="ENTRY">Entry Level (0–2 years)</option>
                <option value="MID">Mid Level (2–5 years)</option>
                <option value="SENIOR">Senior Level (5+ years)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">Notes / Additional Context</label>
            <textarea name="notes" rows={2}
              defaultValue={target?.notes || ""}
              placeholder="Any additional context about your career goals..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
          </div>

          <div className="flex justify-end pt-2 border-t border-border/50">
            <button type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm">
              <Target className="w-3.5 h-3.5" />
              {target ? "Update Career Target" : "Set Career Target"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
