import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { BookOpen, Users, Calendar, Clock, Layers } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function TrainerBatchesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: user.id },
    include: {
      provider: true,
      batches: {
        include: {
          program: { include: { courses: true } },
          enrollments: { include: { trainee: { include: { user: true } } } },
        },
      },
    },
  });

  if (!trainer) return null;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Assigned Training Batches
        </h1>
        <p className="text-xs text-muted">
          All cohorts and program schedules assigned to your trainer profile by {trainer.provider.institutionName}.
        </p>
      </div>

      {trainer.batches.length === 0 ? (
        <EmptyState
          title="No Assigned Batches"
          description="You currently have no active or scheduled batches assigned to your roster."
        />
      ) : (
        <div className="space-y-4">
          {trainer.batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {batch.batchCode}
                    </span>
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-sage-50 text-charcoal-700">
                      {batch.status}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-charcoal-800">
                    {batch.name}
                  </h3>
                  <p className="text-xs text-muted">
                    {batch.program.title} · Sector: <strong>{batch.program.sector}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted block">Enrolled Candidates</span>
                  <span className="font-display font-bold text-lg text-charcoal-800">
                    {batch.enrollments.length} / {batch.maxCapacity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-charcoal-700">
                <div>
                  <span className="text-muted block text-[11px]">Start Date</span>
                  <strong>{formatDate(batch.startDate)}</strong>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">Duration</span>
                  <strong>{batch.program.durationWeeks} Weeks ({batch.program.minHours} hrs)</strong>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">Curriculum Modules</span>
                  <strong>{batch.program.courses.length} modules</strong>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">Institution</span>
                  <strong>{trainer.provider.institutionName}</strong>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Link
                  href={`/trainer/learners?batchId=${batch.id}`}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition"
                >
                  View Learners Roster
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
