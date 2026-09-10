import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Calendar,
  Layers
} from "lucide-react";

export const revalidate = 0;

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: user.id },
    include: {
      provider: true,
      batches: {
        include: {
          program: true,
          enrollments: {
            include: {
              trainee: { include: { user: true, skills: { include: { skill: true } } } },
              assessments: true,
            },
          },
        },
      },
    },
  });

  if (!trainer) {
    return (
      <EmptyState
        title="Trainer Profile Not Configured"
        description="Your user account has the Trainer role, but an authorized Training Provider has not yet assigned a Trainer Profile to your credentials."
      />
    );
  }

  const allEnrollments = trainer.batches.flatMap((b) => b.enrollments);
  const totalLearners = allEnrollments.length;
  const activeBatches = trainer.batches.filter((b) => b.status === "ACTIVE");
  const totalAssessments = allEnrollments.flatMap((e) => e.assessments).length;
  
  const completedLearners = allEnrollments.filter((e) => e.status === "COMPLETED").length;
  const completionRate = totalLearners > 0 ? Math.round((completedLearners / totalLearners) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {trainer.provider.institutionName}
            </span>
            <span className="text-xs text-muted font-medium">· {trainer.specialization || "Instructor"}</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Welcome, {trainer.name}
          </h1>
          <p className="text-xs text-muted">
            Track your cohort syllabus progress, attendance logging, and student practical assessment grading.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/trainer/learners"
            className="px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Learners Roster</span>
          </Link>
          <Link
            href="/trainer/assessments"
            className="px-4 py-2 rounded-full border border-border hover:bg-sage-50 text-charcoal-800 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>Record Grades</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Active Batches</p>
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-charcoal-800">{activeBatches.length}</p>
          <p className="text-[11px] text-muted mt-1">{trainer.batches.length} total cohorts assigned</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Assigned Learners</p>
            <Users className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-charcoal-800">{totalLearners}</p>
          <p className="text-[11px] text-muted mt-1">Under active instruction</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Assessments Scored</p>
            <Award className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-charcoal-800">{totalAssessments}</p>
          <p className="text-[11px] text-muted mt-1">Practical evaluation submissions</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Completion Rate</p>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-emerald-700">{completionRate}%</p>
          <p className="text-[11px] text-muted mt-1">{completedLearners} certified graduates</p>
        </div>
      </div>

      {/* Assigned Batches Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div>
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Assigned Cohorts & Batches ({trainer.batches.length})
            </h3>
            <p className="text-xs text-muted">Curriculum programs assigned by {trainer.provider.institutionName}</p>
          </div>
          <Link href="/trainer/batches" className="text-xs font-semibold text-emerald-800 hover:underline">
            Manage Batches →
          </Link>
        </div>

        {trainer.batches.length === 0 ? (
          <EmptyState
            title="No Batches Assigned Yet"
            description="Your training provider has not yet assigned any active student batches to your trainer account."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainer.batches.map((batch) => (
              <div
                key={batch.id}
                className="p-5 rounded-2xl bg-sage-50/50 border border-sage-200 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {batch.batchCode}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white text-charcoal-700 border border-border">
                      {batch.status}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-charcoal-800">
                    {batch.name}
                  </h4>
                  <p className="text-xs text-muted">
                    {batch.program.title} · {batch.program.sector}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-charcoal-700 border-t border-border/40">
                    <span>Enrolled: <strong>{batch.enrollments.length} / {batch.maxCapacity}</strong></span>
                    <span>Duration: <strong>{batch.program.durationWeeks} weeks</strong></span>
                  </div>
                </div>

                <Link
                  href={`/trainer/learners?batchId=${batch.id}`}
                  className="w-full py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>View Student Roster</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
