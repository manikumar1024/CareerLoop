import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import SkillBadge from "@/components/SkillBadge";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Users, GraduationCap, Award, MapPin, CheckCircle2 } from "lucide-react";

export const revalidate = 0;

export default async function TrainerLearnersPage({
  searchParams,
}: {
  searchParams?: { batchId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: user.id },
    include: {
      batches: true,
    },
  });

  if (!trainer) return null;

  const batchIds = searchParams?.batchId 
    ? [searchParams.batchId] 
    : trainer.batches.map((b) => b.id);

  const enrollments = await prisma.enrollment.findMany({
    where: {
      batchId: { in: batchIds },
    },
    include: {
      program: true,
      batch: true,
      assessments: true,
      trainee: {
        include: {
          user: true,
          skills: { include: { skill: true } },
          certifications: true,
        },
      },
    },
    orderBy: { enrollmentDate: "desc" },
  });

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Assigned Learners Roster
          </h1>
          <p className="text-xs text-muted">
            Track student attendance percentages, competency mastery, and assessment evaluation statuses.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          {enrollments.length} Active Learners
        </div>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          title="No Learners Found"
          description="There are currently no students enrolled in your assigned cohorts."
        />
      ) : (
        <div className="space-y-4">
          {enrollments.map((record) => {
            const trainee = record.trainee;
            return (
              <div
                key={record.id}
                className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base text-charcoal-800">
                        {trainee.user.name}
                      </h3>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {trainee.traineeId}
                      </span>
                      <StatusBadge status={record.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                        {record.program.title}
                      </span>
                      {record.batch && (
                        <span className="font-mono bg-sage-50 px-2 py-0.5 rounded border border-sage-200 text-charcoal-700">
                          {record.batch.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {trainee.district}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-charcoal-700 sm:text-right shrink-0">
                    <div>
                      <span className="text-[10px] text-muted block">Attendance</span>
                      <strong className="text-emerald-700">
                        {record.attendancePercentage !== null ? `${record.attendancePercentage}%` : "Pending"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted block">Grade</span>
                      <strong>{record.grade || "In Progress"}</strong>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {trainee.skills.length > 0 && (
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1.5">
                      Competencies ({trainee.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {trainee.skills.slice(0, 6).map((ts) => (
                        <SkillBadge
                          key={ts.id}
                          name={ts.skill.name}
                          category={ts.skill.category}
                          proficiency={ts.proficiencyLevel}
                          verifiedByAssessment={ts.verifiedByAssessment}
                          verifiedByEmployer={ts.verifiedByEmployer}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
