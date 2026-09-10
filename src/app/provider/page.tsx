import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Award, 
  Briefcase, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Building2 
} from "lucide-react";

export const revalidate = 0;

export default async function ProviderDashboardPage() {
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
                  employmentRecords: { where: { isCurrent: true } },
                  selfEmployments: true,
                  apprenticeships: true,
                  certifications: true,
                },
              },
            },
          },
          certifications: true,
        },
      },
    },
  });

  if (!provider) {
    return (
      <EmptyState
        title="Training Provider Profile Not Initialized"
        description="Please initialize your institution details to access cohort management."
        actionText="Setup Institution"
        actionHref="/onboarding"
      />
    );
  }

  const allEnrollments = provider.programs.flatMap((p) => p.enrollments);
  const totalEnrolled = allEnrollments.length;
  const totalCertified = provider.programs.reduce((acc, p) => acc + p.certifications.length, 0);

  const placedTrainees = allEnrollments.filter(
    (e) =>
      e.trainee.employmentRecords.length > 0 ||
      e.trainee.selfEmployments.length > 0 ||
      e.trainee.apprenticeships.length > 0
  );

  const placementRate = totalCertified > 0 ? Math.round((placedTrainees.length / totalCertified) * 1000) / 10 : 0;

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Accreditation: {provider.accreditationNumber || "NSDC Accredited"}
            </span>
            <span className="text-xs text-muted">District: {provider.district}</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            {provider.institutionName}
          </h1>
          <p className="text-xs text-muted">
            Training Provider Outcome & Batch Management Workspace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/provider/programs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Programs & Batches</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Programs"
          value={provider.programs.length}
          subtitle="Accredited courses"
          icon={BookOpen}
        />

        <MetricCard
          title="Total Trainees Enrolled"
          value={totalEnrolled}
          subtitle="Across all active batches"
          icon={Users}
        />

        <MetricCard
          title="Certified Graduates"
          value={totalCertified}
          subtitle="Digital verifiable credentials"
          icon={GraduationCap}
        />

        <MetricCard
          title="Placement / Livelihood Rate"
          value={totalCertified > 0 ? `${placementRate}%` : "—"}
          subtitle="Verified positive outcomes"
          icon={Briefcase}
          badge={placementRate >= 70 ? "High Efficacy" : "Target: 70%"}
        />
      </div>

      {/* Programs List Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div>
            <h3 className="font-display font-bold text-lg text-charcoal-800">
              Accredited Program Cohorts & Outcomes
            </h3>
            <p className="text-xs text-muted">
              Outcome performance metrics broken down by curriculum title and sector
            </p>
          </div>
          <Link href="/provider/programs" className="text-xs font-semibold text-emerald-800 hover:underline">
            View Details →
          </Link>
        </div>

        {provider.programs.length === 0 ? (
          <EmptyState
            title="No Programs Configured"
            description="Create your first training program or curriculum module to begin enrolling candidates."
            actionText="Create Program Batch"
            actionHref="/provider/programs"
          />
        ) : (
          <div className="space-y-4">
            {provider.programs.map((program) => {
              const enrolledCount = program.enrollments.length;
              const certCount = program.certifications.length;
              const placedInProg = program.enrollments.filter(
                (e) =>
                  e.trainee.employmentRecords.length > 0 ||
                  e.trainee.selfEmployments.length > 0 ||
                  e.trainee.apprenticeships.length > 0
              ).length;
              const pRate = certCount > 0 ? Math.round((placedInProg / certCount) * 100) : 0;

              return (
                <div
                  key={program.id}
                  className="p-5 rounded-2xl bg-sage-50/50 border border-sage-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {program.code}
                      </span>
                      <h4 className="font-display font-bold text-base text-charcoal-800">
                        {program.title}
                      </h4>
                    </div>

                    <p className="text-xs text-muted">
                      Sector: <strong>{program.sector}</strong> · Duration: {program.durationWeeks} weeks ({program.minHours} hours)
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-charcoal-800 shrink-0">
                    <div className="text-center">
                      <p className="font-bold text-sm">{enrolledCount}</p>
                      <p className="text-[10px] text-muted">Enrolled</p>
                    </div>

                    <div className="text-center">
                      <p className="font-bold text-sm text-emerald-800">{certCount}</p>
                      <p className="text-[10px] text-muted">Certified</p>
                    </div>

                    <div className="text-center">
                      <p className="font-bold text-sm text-emerald-800">{pRate}%</p>
                      <p className="text-[10px] text-muted">Placed</p>
                    </div>
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
