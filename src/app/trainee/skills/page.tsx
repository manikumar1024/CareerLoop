import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import SkillBadge from "@/components/SkillBadge";
import { revalidatePath } from "next/cache";
import { Award, Plus, CheckCircle2, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

export const revalidate = 0;

export default async function TraineeSkillsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!trainee) return null;

  // Available skills in the master taxonomy
  const allMasterSkills = await prisma.skill.findMany({
    orderBy: { name: "asc" },
  });

  async function addSkillAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const skillId = formData.get("skillId") as string;
    const customSkillName = formData.get("customSkillName") as string;
    const proficiencyLevel = formData.get("proficiencyLevel") as string;

    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: userSession.id },
    });
    if (!traineeProfile) return;

    let targetSkillId = skillId;

    // If custom skill entered
    if (!targetSkillId && customSkillName) {
      let existingSkill = await prisma.skill.findUnique({ where: { name: customSkillName.trim() } });
      if (!existingSkill) {
        existingSkill = await prisma.skill.create({
          data: {
            name: customSkillName.trim(),
            category: "Technical",
            description: "Self-added trainee competency",
          },
        });
      }
      targetSkillId = existingSkill.id;
    }

    if (targetSkillId) {
      await prisma.traineeSkill.upsert({
        where: {
          traineeId_skillId: {
            traineeId: traineeProfile.id,
            skillId: targetSkillId,
          },
        },
        update: {
          proficiencyLevel,
        },
        create: {
          traineeId: traineeProfile.id,
          skillId: targetSkillId,
          proficiencyLevel,
          verifiedByAssessment: false,
        },
      });
    }

    revalidatePath("/trainee/skills");
    revalidatePath("/trainee");
  }

  async function deleteSkillAction(formData: FormData) {
    "use server";
    const traineeSkillId = formData.get("traineeSkillId") as string;
    await prisma.traineeSkill.delete({ where: { id: traineeSkillId } });
    revalidatePath("/trainee/skills");
    revalidatePath("/trainee");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {trainee.skills.length} Skills Mapped
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            My Skill Profile & Verification
          </h1>
          <p className="text-xs text-muted">
            Manage your demonstrated technical competencies, soft skills, and standardized assessment ratings.
          </p>
        </div>
      </div>

      {/* Grid: Existing Skills + Add Skill Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Existing Skills List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Active Skill Portfolio
            </h3>
            <span className="text-[11px] text-muted">
              {trainee.skills.filter((s) => s.verifiedByAssessment || s.verifiedByEmployer).length} Verified
            </span>
          </div>

          {trainee.skills.length === 0 ? (
            <EmptyState
              title="No Skills Added"
              description="Add the skills you learned during your training program or prior work."
            />
          ) : (
            <div className="space-y-3">
              {trainee.skills.map((ts) => (
                <div
                  key={ts.id}
                  className="p-3.5 rounded-2xl bg-sage-50/70 border border-sage-200 flex items-center justify-between hover:border-emerald-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-charcoal-800">
                        {ts.skill.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-border font-medium">
                        {ts.proficiencyLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted">
                      <span>{ts.skill.category}</span>
                      {ts.verifiedByAssessment && (
                        <span className="text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Assessed
                        </span>
                      )}
                      {ts.verifiedByEmployer && (
                        <span className="text-emerald-700 flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3 h-3" /> Employer Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <form action={deleteSkillAction}>
                    <input type="hidden" name="traineeSkillId" value={ts.id} />
                    <button
                      type="submit"
                      title="Remove skill"
                      className="p-1.5 rounded-lg text-muted hover:text-red-700 hover:bg-white transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Skill Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Plus className="w-4 h-4 text-emerald-700" />
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Add New Competency
            </h3>
          </div>

          <form action={addSkillAction} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Select from Standard Taxonomy
              </label>
              <select
                name="skillId"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">-- Choose from Standard Skills --</option>
                {allMasterSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Or Type Custom Skill Name
              </label>
              <input
                type="text"
                name="customSkillName"
                placeholder="e.g. Docker, Next.js, 3D CAD"
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Demonstrated Proficiency Level
              </label>
              <select
                name="proficiencyLevel"
                defaultValue="INTERMEDIATE"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="BEGINNER">Beginner (Foundational)</option>
                <option value="INTERMEDIATE">Intermediate (Applied)</option>
                <option value="ADVANCED">Advanced (Production Ready)</option>
                <option value="EXPERT">Expert (Specialist)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
            >
              Add Skill to Profile
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
