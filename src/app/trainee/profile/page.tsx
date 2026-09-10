import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { revalidatePath } from "next/cache";
import { formatCurrency, formatDate } from "@/lib/utils";
import { User, MapPin, GraduationCap, DollarSign, Shield, Phone, Mail, Award, CheckCircle2 } from "lucide-react";
import { logAuditAction } from "@/lib/audit";

export const revalidate = 0;

export default async function TraineeProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      skills: { include: { skill: true } },
      certifications: { include: { program: true } },
    },
  });

  if (!trainee) {
    return (
      <EmptyState
        title="Profile Not Initialized"
        description="Please initialize your profile to view and manage your digital identity."
        actionText="Setup Profile"
        actionHref="/onboarding"
      />
    );
  }

  async function updateProfileAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const district = formData.get("district") as string;
    const educationLevel = formData.get("educationLevel") as string;
    const phone = formData.get("phone") as string;
    const bio = formData.get("bio") as string;
    const targetRole = formData.get("targetRole") as string;
    const targetSalaryMin = parseInt(formData.get("targetSalaryMin") as string) || null;
    const targetSalaryMax = parseInt(formData.get("targetSalaryMax") as string) || null;
    const currentStatus = formData.get("currentStatus") as string;

    const updated = await prisma.traineeProfile.update({
      where: { userId: userSession.id },
      data: {
        district,
        educationLevel,
        phone,
        bio,
        targetRole,
        targetSalaryMin,
        targetSalaryMax,
        currentStatus,
      },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "TRAINEE",
      action: "UPDATED_PROFILE",
      targetEntity: "TraineeProfile",
      targetEntityId: updated.id,
    });

    revalidatePath("/trainee/profile");
    revalidatePath("/trainee");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            {trainee.traineeId}
          </span>
          <StatusBadge status={trainee.currentStatus} />
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Digital Trainee Profile
        </h1>
        <p className="text-xs text-muted">
          Your lifelong verifiable skilling and livelihood identity across programs, employers, and districts.
        </p>
      </div>

      {/* Identity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-display font-bold text-xl">
              {user.name?.charAt(0) || "T"}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-800">
                {user.name}
              </h3>
              <p className="text-xs text-muted flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> {user.email}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200 text-left sm:text-right text-xs">
            <p className="text-[10px] uppercase font-bold text-muted">Unique Trainee Identifier</p>
            <p className="font-mono font-bold text-emerald-800 text-sm">{trainee.traineeId}</p>
            <p className="text-[10px] text-muted">Permanent identity anchor</p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form action={updateProfileAction} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Home District
              </label>
              <input
                type="text"
                name="district"
                defaultValue={trainee.district || ""}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Phone Number (Encrypted)
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={trainee.phone || ""}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Highest Education Level
              </label>
              <input
                type="text"
                name="educationLevel"
                defaultValue={trainee.educationLevel || "Diploma / Higher Secondary"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Current Employment Status
              </label>
              <select
                name="currentStatus"
                defaultValue={trainee.currentStatus}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="TRAINING">In Training</option>
                <option value="CERTIFIED">Certified (Seeking Placement)</option>
                <option value="EMPLOYED">Formally Employed</option>
                <option value="SELF_EMPLOYED">Self-Employed / Entrepreneur</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
                <option value="UNEMPLOYED">Unemployed (Seeking Support)</option>
                <option value="FURTHER_STUDIES">Pursuing Further Studies</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Target Job Role
              </label>
              <input
                type="text"
                name="targetRole"
                defaultValue={trainee.targetRole || ""}
                placeholder="e.g. Full Stack Developer, Solar Technician"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Target Salary (Min ₹/mo)
                </label>
                <input
                  type="number"
                  name="targetSalaryMin"
                  defaultValue={trainee.targetSalaryMin || 20000}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Target Salary (Max ₹/mo)
                </label>
                <input
                  type="number"
                  name="targetSalaryMax"
                  defaultValue={trainee.targetSalaryMax || 35000}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Professional Summary / Career Interests
            </label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={trainee.bio || ""}
              placeholder="Brief description of your practical strengths and career goals..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
