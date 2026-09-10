import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { revalidatePath } from "next/cache";
import { BookOpen, Plus, Users, GraduationCap, Clock, Award } from "lucide-react";
import { logAuditAction } from "@/lib/audit";

export const revalidate = 0;

export default async function ProviderProgramsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await prisma.trainingProviderProfile.findUnique({
    where: { userId: user.id },
    include: {
      programs: {
        include: {
          enrollments: { include: { trainee: { include: { user: true } }, assessments: true } },
          certifications: true,
        },
      },
    },
  });

  if (!provider) return null;

  async function createProgramAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const title = formData.get("title") as string;
    const code = formData.get("code") as string;
    const sector = formData.get("sector") as string;
    const description = formData.get("description") as string;
    const durationWeeks = parseInt(formData.get("durationWeeks") as string) || 12;
    const minHours = parseInt(formData.get("minHours") as string) || 360;

    const provProfile = await prisma.trainingProviderProfile.findUnique({ where: { userId: userSession.id } });
    if (!provProfile) return;

    await prisma.trainingProgram.create({
      data: {
        providerId: provProfile.id,
        title,
        code: code.trim().toUpperCase(),
        sector,
        description,
        durationWeeks,
        minHours,
      },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "TRAINING_PROVIDER",
      action: "CREATED_TRAINING_PROGRAM",
      targetEntity: "TrainingProgram",
      metadata: { code, title, sector },
    });

    revalidatePath("/provider/programs");
    revalidatePath("/provider");
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Programs, Curricula & Batches
        </h1>
        <p className="text-xs text-muted">
          Manage accredited vocational programs, track student rosters, and log practical assessment completions.
        </p>
      </div>

      {/* Grid: Existing Programs + Create New Program Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Existing Programs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Active Training Batches ({provider.programs.length})
              </h3>
            </div>

            {provider.programs.length === 0 ? (
              <EmptyState
                title="No Programs Created"
                description="Use the form to create your institution's first course batch."
              />
            ) : (
              <div className="space-y-4">
                {provider.programs.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-sage-50/50 border border-sage-200 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {p.code}
                        </span>
                        <h4 className="font-display font-bold text-base text-charcoal-800 mt-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-muted">{p.sector}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.enrollments.length} Enrolled
                      </span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted pt-2 border-t border-border/40">
                      <span>Duration: {p.durationWeeks} weeks</span>
                      <span>·</span>
                      <span>Min {p.minHours} hours</span>
                      <span>·</span>
                      <span className="text-emerald-800 font-semibold">{p.certifications.length} Certified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Program Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Plus className="w-4 h-4 text-emerald-700" />
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Create New Program
            </h3>
          </div>

          <form action={createProgramAction} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Program / Course Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Solar PV Technician Certificate"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Standard Program Code</label>
              <input
                type="text"
                name="code"
                required
                placeholder="e.g. PRG-SOLAR-2026"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white uppercase font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Sector / Industry Domain</label>
              <input
                type="text"
                name="sector"
                required
                placeholder="e.g. Green Energy, Information Technology, Healthcare"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Duration (Weeks)</label>
                <input
                  type="number"
                  name="durationWeeks"
                  defaultValue={12}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Min Practical Hours</label>
                <input
                  type="number"
                  name="minHours"
                  defaultValue={360}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Curriculum & Scope Description</label>
              <textarea
                name="description"
                rows={3}
                required
                placeholder="Core topics, lab modules, and practical competencies covered..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
            >
              Publish Program Batch
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
