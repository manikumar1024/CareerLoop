import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, Building2, Award, Users, CheckCircle2, TrendingUp } from "lucide-react";

export const revalidate = 0;

export default async function ProviderOutcomesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await prisma.trainingProviderProfile.findUnique({
    where: { userId: user.id },
    include: {
      programs: {
        include: {
          enrollments: {
            include: {
              trainee: {
                include: {
                  user: true,
                  employmentRecords: { where: { isCurrent: true } },
                  selfEmployments: { where: { businessStatus: "ACTIVE" } },
                  apprenticeships: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!provider) return null;

  const allEnrollments = provider.programs.flatMap((p) => p.enrollments);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Graduate Placement & Outcome Tracking
        </h1>
        <p className="text-xs text-muted">
          Track post-certification livelihoods of your graduates: formal employment, self-employment, and apprenticeships.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Graduate Cohort Outcome Roster ({allEnrollments.length})
          </h3>
        </div>

        {allEnrollments.length === 0 ? (
          <EmptyState
            title="No Enrolled Candidates"
            description="Trainees enrolled in your programs will automatically appear in this outcome roster."
          />
        ) : (
          <div className="divide-y divide-border/60">
            {allEnrollments.map((enr) => {
              const trainee = enr.trainee;
              const emp = trainee.employmentRecords[0];
              const selfBiz = trainee.selfEmployments[0];
              const appr = trainee.apprenticeships[0];

              return (
                <div key={enr.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-800 text-sm">
                        {trainee.user.name}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {trainee.traineeId}
                      </span>
                      <StatusBadge status={trainee.currentStatus} />
                    </div>

                    {emp ? (
                      <p className="text-charcoal-700">
                        Employed as <strong>{emp.jobTitle}</strong> at <strong>{emp.companyName}</strong> ({formatCurrency(emp.monthlySalary)}/mo)
                      </p>
                    ) : selfBiz ? (
                      <p className="text-purple-800">
                        Self-Employed: <strong>{selfBiz.businessName}</strong> ({formatCurrency(selfBiz.monthlyNetIncome)}/mo)
                      </p>
                    ) : appr ? (
                      <p className="text-blue-800">
                        Apprentice: <strong>{appr.tradeRole}</strong> at <strong>{appr.hostOrganization}</strong>
                      </p>
                    ) : (
                      <p className="text-muted">Currently seeking placement / upskilling</p>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-muted">
                      Attendance: {enr.attendancePercentage}% · Grade: {enr.grade || "A"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
