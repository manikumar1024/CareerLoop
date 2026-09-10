import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, Award, Users, TrendingUp, DollarSign, Layers } from "lucide-react";

export const revalidate = 0;

export default async function AdminCoursesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programs = await prisma.trainingProgram.findMany({
    include: {
      provider: true,
      enrollments: {
        include: {
          trainee: {
            include: {
              employmentRecords: { where: { isCurrent: true } },
              selfEmployments: true,
              apprenticeships: true,
            },
          },
        },
      },
      certifications: true,
    },
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Course & Curriculum Performance Intelligence
        </h1>
        <p className="text-xs text-muted">
          Compare training programs by completion rates, positive livelihood conversion, and wage ROI.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Training Programs Outcome ROI ({programs.length})
          </h3>
        </div>

        {programs.length === 0 ? (
          <EmptyState
            title="No Course Programs Registered"
            description="Training programs will appear here as providers create batches."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => {
              const totalEnrolled = prog.enrollments.length;
              const totalCertified = prog.certifications.length;
              const placed = prog.enrollments.filter(
                (e) =>
                  e.trainee.employmentRecords.length > 0 ||
                  e.trainee.selfEmployments.length > 0 ||
                  e.trainee.apprenticeships.length > 0
              );

              const placementRate = totalCertified > 0 ? Math.round((placed.length / totalCertified) * 100) : 0;
              
              const allSalaries = placed.flatMap((p) => [
                ...p.trainee.employmentRecords.map((e) => e.monthlySalary),
                ...p.trainee.selfEmployments.map((s) => s.monthlyNetIncome),
              ]);

              const avgSalary =
                allSalaries.length > 0
                  ? Math.round(allSalaries.reduce((a, b) => a + b, 0) / allSalaries.length)
                  : 0;

              return (
                <div
                  key={prog.id}
                  className="p-6 rounded-2xl bg-sage-50/50 border border-sage-200 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
                >
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                      {prog.code} · {prog.sector}
                    </span>
                    <h4 className="font-display font-bold text-base text-charcoal-800">
                      {prog.title}
                    </h4>
                    <p className="text-xs text-muted">
                      Provider: {prog.provider.institutionName} ({prog.provider.district})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-border">
                      <p className="text-[10px] text-muted uppercase font-bold">Placement Rate</p>
                      <p className="font-bold text-emerald-800 text-sm mt-0.5">{placementRate}%</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-border">
                      <p className="text-[10px] text-muted uppercase font-bold">Avg Wage</p>
                      <p className="font-bold text-charcoal-800 text-sm mt-0.5">{avgSalary > 0 ? formatCurrency(avgSalary) : "—"}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-muted flex items-center justify-between pt-1">
                    <span>{totalEnrolled} Enrolled</span>
                    <span>{totalCertified} Certified</span>
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
