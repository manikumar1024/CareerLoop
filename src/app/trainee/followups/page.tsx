import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { revalidatePath } from "next/cache";
import { formatCurrency, formatDate } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { Clock, CheckCircle2, AlertCircle, TrendingUp, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default async function TraineeFollowupsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      followUps: { orderBy: { milestoneDays: "asc" } },
      employmentRecords: { where: { isCurrent: true } },
    },
  });

  if (!trainee) return null;

  // Initialize milestone records if none exist for this trainee
  const milestones = [30, 90, 180, 365];
  for (const m of milestones) {
    const existing = trainee.followUps.find((f) => f.milestoneDays === m);
    if (!existing) {
      await prisma.followUp.create({
        data: {
          traineeId: trainee.id,
          milestoneDays: m,
          scheduledDate: new Date(Date.now() + m * 24 * 60 * 60 * 1000),
          isCompleted: false,
        },
      });
    }
  }

  // Refetch fresh followups
  const freshFollowups = await prisma.followUp.findMany({
    where: { traineeId: trainee.id },
    orderBy: { milestoneDays: "asc" },
  });

  const latestEmployment = trainee.employmentRecords[0];

  async function submitFollowUpAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const followUpId = formData.get("followUpId") as string;
    const isEmployed = formData.get("isEmployed") === "true";
    const companyName = formData.get("companyName") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const currentSalary = parseInt(formData.get("currentSalary") as string) || null;
    const sameEmployerAsPlacement = formData.get("sameEmployerAsPlacement") === "true";
    const skillRelevanceScore = parseInt(formData.get("skillRelevanceScore") as string) || 4;
    const promotionReceived = formData.get("promotionReceived") === "true";
    const wageIncreasePercent = parseFloat(formData.get("wageIncreasePercent") as string) || 0.0;
    const nonPlacementReason = formData.get("nonPlacementReason") as string;
    const nonPlacementNotes = formData.get("nonPlacementNotes") as string;
    const feedback = formData.get("feedback") as string;

    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: userSession.id },
    });
    if (!traineeProfile) return;

    await prisma.followUp.update({
      where: { id: followUpId },
      data: {
        isCompleted: true,
        completedDate: new Date(),
        isEmployed,
        companyName: isEmployed ? companyName : null,
        jobTitle: isEmployed ? jobTitle : null,
        currentSalary: isEmployed ? currentSalary : null,
        sameEmployerAsPlacement: isEmployed ? sameEmployerAsPlacement : null,
        skillRelevanceScore: isEmployed ? skillRelevanceScore : null,
        promotionReceived: isEmployed ? promotionReceived : false,
        wageIncreasePercent: isEmployed ? wageIncreasePercent : 0.0,
        nonPlacementReason: !isEmployed ? nonPlacementReason : null,
        nonPlacementNotes: !isEmployed ? nonPlacementNotes : null,
        feedback,
      },
    });

    if (!isEmployed && nonPlacementReason) {
      await prisma.nonPlacementRecord.create({
        data: {
          traineeId: traineeProfile.id,
          primaryReason: nonPlacementReason,
          details: nonPlacementNotes,
        },
      });

      await prisma.traineeProfile.update({
        where: { id: traineeProfile.id },
        data: { currentStatus: "UNEMPLOYED" },
      });
    } else if (isEmployed) {
      await prisma.traineeProfile.update({
        where: { id: traineeProfile.id },
        data: { currentStatus: "EMPLOYED" },
      });
    }

    await logAuditAction({
      userId: userSession.id,
      role: "TRAINEE",
      action: "SUBMITTED_MILESTONE_FOLLOWUP",
      targetEntity: "FollowUp",
      targetEntityId: followUpId,
      metadata: { isEmployed, currentSalary, wageIncreasePercent },
    });

    revalidatePath("/trainee/followups");
    revalidatePath("/trainee");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Automated Outcome Follow-Up Engine
        </h1>
        <p className="text-xs text-muted">
          Periodic milestone check-ins (30, 90, 180, and 365 days) tracking retention, salary progression, and skill utilization.
        </p>
      </div>

      {/* Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {freshFollowups.map((f) => (
          <div
            key={f.id}
            className={`rounded-3xl p-6 sm:p-7 border transition-all ${
              f.isCompleted
                ? "bg-white border-emerald-200 shadow-card"
                : "bg-white border-amber-300 shadow-card ring-2 ring-amber-400/10"
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    f.isCompleted ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-charcoal-800">
                    {f.milestoneDays}-Day Milestone
                  </h3>
                  <p className="text-[11px] text-muted">
                    {f.isCompleted ? `Completed on ${formatDate(f.completedDate)}` : `Status: Response Needed`}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  f.isCompleted
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-900 border-amber-300 animate-pulse"
                }`}
              >
                {f.isCompleted ? "Completed" : "Action Due"}
              </span>
            </div>

            {/* If completed: Display Summary */}
            {f.isCompleted ? (
              <div className="pt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Livelihood Status:</span>
                  <span className="font-bold text-charcoal-800">
                    {f.isEmployed ? "Employed / Working" : "Not Employed"}
                  </span>
                </div>

                {f.isEmployed && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Organization / Role:</span>
                      <span className="font-semibold text-charcoal-800">
                        {f.companyName || "Current Employer"} · {f.jobTitle || "Specialist"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted">Current Monthly Salary:</span>
                      <span className="font-bold text-emerald-800">
                        {formatCurrency(f.currentSalary)}
                      </span>
                    </div>

                    {f.wageIncreasePercent && f.wageIncreasePercent > 0 ? (
                      <div className="flex items-center justify-between text-emerald-700 font-semibold">
                        <span>Wage Increment:</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{f.wageIncreasePercent}% Growth
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between">
                      <span className="text-muted">Skill Relevance:</span>
                      <span className="font-semibold text-charcoal-800">
                        {f.skillRelevanceScore || 5} / 5 Stars
                      </span>
                    </div>
                  </>
                )}

                {!f.isEmployed && f.nonPlacementReason && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <p className="font-semibold">Reason: {f.nonPlacementReason.replace(/_/g, " ")}</p>
                    {f.nonPlacementNotes && <p className="text-[11px] mt-1">{f.nonPlacementNotes}</p>}
                  </div>
                )}

                {f.feedback && (
                  <p className="text-muted italic pt-2 border-t border-border/40">
                    &ldquo;{f.feedback}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              /* If pending: Survey Form */
              <form action={submitFollowUpAction} className="pt-4 space-y-4 text-xs">
                <input type="hidden" name="followUpId" value={f.id} />

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Are you currently employed, self-employed, or in an apprenticeship?
                  </label>
                  <select
                    name="isEmployed"
                    required
                    defaultValue="true"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  >
                    <option value="true">Yes, I am currently employed / self-employed</option>
                    <option value="false">No, I am currently seeking employment / studying</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">
                      Current Company
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      defaultValue={latestEmployment?.companyName || ""}
                      placeholder="e.g. Apex Info"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">
                      Current Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      defaultValue={latestEmployment?.jobTitle || ""}
                      placeholder="e.g. Associate Dev"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <div>
                     <label className="block font-semibold text-charcoal-700 mb-1">
                       Current Monthly Salary (₹)
                     </label>
                     <input
                       type="number"
                       name="currentSalary"
                       defaultValue={latestEmployment?.monthlySalary || ""}
                       placeholder="Enter current monthly salary"
                       className="w-full px-3 py-2 rounded-xl border border-border bg-white font-medium"
                     />
                   </div>
                   <div>
                     <label className="block font-semibold text-charcoal-700 mb-1">
                       Wage Increase % (if any)
                     </label>
                     <input
                       type="number"
                       step="0.1"
                       name="wageIncreasePercent"
                       defaultValue=""
                       placeholder="e.g. 12.5"
                       className="w-full px-3 py-2 rounded-xl border border-border bg-white"
                     />
                   </div>
                 </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Are you using the skills from your training? (1-5)
                  </label>
                  <select
                    name="skillRelevanceScore"
                    defaultValue="5"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white"
                  >
                    <option value="5">5 - Using training skills daily</option>
                    <option value="4">4 - Highly aligned with training</option>
                    <option value="3">3 - Moderately aligned</option>
                    <option value="2">2 - Low relevance</option>
                    <option value="1">1 - Different field</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    If currently seeking work, primary reason:
                  </label>
                  <select
                    name="nonPlacementReason"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white"
                  >
                    <option value="">-- Select reason (if unemployed) --</option>
                    <option value="SKILL_GAP">Need practical / advanced technical upskilling</option>
                    <option value="LACK_OF_LOCAL_JOBS">Lack of vacancies in my home district</option>
                    <option value="SALARY_MISMATCH">Salary offered was below living wage benchmark</option>
                    <option value="COMMUNICATION_SKILLS">Workplace communication & soft skills</option>
                    <option value="LOCATION_MOBILITY">Unable to relocate</option>
                    <option value="FURTHER_EDUCATION">Enrolled in higher education</option>
                    <option value="PERSONAL_REASON">Personal / family commitments</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Feedback & Career Updates
                  </label>
                  <textarea
                    name="feedback"
                    rows={2}
                    placeholder="Any promotions, certifications cleared, or workplace challenges..."
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
                >
                  Submit {f.milestoneDays}-Day Follow-Up Response
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
