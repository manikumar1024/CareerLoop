import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MetricCard from "@/components/MetricCard";
import OutcomeRetentionChart from "@/components/Charts/OutcomeRetentionChart";
import WageProgressionChart from "@/components/Charts/WageProgressionChart";
import { getLongitudinalOverview } from "@/lib/analytics";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { PieChart, TrendingUp, Clock, Users, ArrowUpRight, DollarSign } from "lucide-react";

export const revalidate = 0;

export default async function AdminRetentionPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const metrics = await getLongitudinalOverview();

  const retentionCurve = [
    { milestone: "30-Day Milestone", rate: metrics.retention90Days },
    { milestone: "90-Day Milestone", rate: metrics.retention90Days },
    { milestone: "180-Day Milestone", rate: metrics.retention180Days },
    { milestone: "365-Day Milestone", rate: metrics.retention365Days },
  ].filter((d) => d.rate != null && d.rate > 0);

  const wageData = metrics.avgInitialSalary > 0 ? [
    { stage: "Initial Salary", avgSalary: metrics.avgInitialSalary },
    { stage: "Current Avg Salary", avgSalary: metrics.avgCurrentSalary },
  ] : [];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Longitudinal Retention & Wage Progression
        </h1>
        <p className="text-xs text-muted">
          Multi-year career trajectory intelligence measuring job stability, attrition curves, and progressive income gains.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="90-Day Retention"
          value={metrics.hasData ? `${metrics.retention90Days}%` : "—"}
          subtitle="3-Month post-hire stability"
          icon={Clock}
        />

        <MetricCard
          title="180-Day Retention"
          value={metrics.hasData ? `${metrics.retention180Days}%` : "—"}
          subtitle="6-Month career survival"
          icon={TrendingUp}
        />

        <MetricCard
          title="Avg Initial Wage"
          value={metrics.hasData ? formatCurrency(metrics.avgInitialSalary) : "—"}
          subtitle="Placement starting base"
          icon={DollarSign}
        />

        <MetricCard
          title="Avg Current Wage"
          value={metrics.hasData ? formatCurrency(metrics.avgCurrentSalary) : "—"}
          subtitle={`+${metrics.avgWageGrowthPercent}% progression`}
          icon={ArrowUpRight}
          badge={`+${metrics.avgWageGrowthPercent}%`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Cohort Retention Survival Curve
          </h3>
          <OutcomeRetentionChart data={metrics.hasData ? retentionCurve : []} />
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Longitudinal Monthly Wage Increments
          </h3>
          <WageProgressionChart data={metrics.hasData ? wageData : []} />
        </div>
      </div>
    </div>
  );
}
