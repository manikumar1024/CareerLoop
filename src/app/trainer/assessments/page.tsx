import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Award, CheckCircle2, XCircle, PlusCircle, Star } from "lucide-react";

export const revalidate = 0;

export default async function TrainerAssessmentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: user.id },
    include: {
      batches: {
        include: {
          enrollments: {
            include: {
              trainee: { include: { user: true } },
              assessments: true,
            },
          },
        },
      },
    },
  });

  if (!trainer) return null;

  const allEnrollments = trainer.batches.flatMap((b) => b.enrollments);
  const assessments = allEnrollments.flatMap((e) =>
    e.assessments.map((a) => ({ ...a, traineeName: e.trainee.user.name, traineeId: e.trainee.traineeId }))
  );

  async function handleRecordAssessment(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession || userSession.role !== "TRAINER") return;

    const enrollmentId = formData.get("enrollmentId") as string;
    const title = formData.get("title") as string;
    const scoreStr = formData.get("score") as string;
    const maxScoreStr = formData.get("maxScore") as string;
    const feedback = formData.get("feedback") as string;

    const score = parseFloat(scoreStr) || 0;
    const maxScore = parseFloat(maxScoreStr) || 100;
    const passed = (score / maxScore) >= 0.6;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enrollment) return;

    await prisma.assessment.create({
      data: {
        enrollmentId: enrollment.id,
        traineeId: enrollment.traineeId,
        title: title || "Practical Vocational Assessment",
        maxScore,
        scoreObtained: score,
        passed,
        feedback,
      },
    });

    revalidatePath("/trainer/assessments");
    revalidatePath("/trainer");
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Practical Assessment Records
        </h1>
        <p className="text-xs text-muted">
          Record and audit standardized practical evaluations, competency scores, and instructor feedback.
        </p>
      </div>

      {/* Record New Assessment Form */}
      {allEnrollments.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-800 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>Record Practical Evaluation</span>
          </h3>

          <form action={handleRecordAssessment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Student</label>
              <select
                name="enrollmentId"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-700"
              >
                {allEnrollments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.trainee.user.name} ({e.trainee.traineeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Assessment Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Mid-Term Coding Lab"
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Score Obtained</label>
              <input
                type="number"
                name="score"
                required
                min="0"
                max="100"
                step="0.5"
                placeholder="e.g. 85"
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex flex-col justify-end">
              <input type="hidden" name="maxScore" value="100" />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
              >
                Submit Grade
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Assessment Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-800">
          Recorded Evaluations ({assessments.length})
        </h3>

        {assessments.length === 0 ? (
          <EmptyState
            title="No Assessments Recorded"
            description="You have not recorded any practical evaluations for your assigned cohorts yet."
          />
        ) : (
          <div className="space-y-3">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl bg-sage-50/50 border border-sage-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-sm text-charcoal-800">{a.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      a.passed 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}>
                      {a.passed ? "PASSED" : "NEEDS RETAKE"}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Candidate: <strong>{a.traineeName}</strong> ({a.traineeId}) · Evaluated on {formatDate(a.assessmentDate)}
                  </p>
                  {a.feedback && (
                    <p className="text-[11px] text-charcoal-700 italic mt-1">
                      Instructor Feedback: &ldquo;{a.feedback}&rdquo;
                    </p>
                  )}
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <span className="font-display font-black text-xl text-charcoal-800">
                    {a.scoreObtained}
                  </span>
                  <span className="text-xs text-muted"> / {a.maxScore}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
