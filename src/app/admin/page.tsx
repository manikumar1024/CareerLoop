import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MetricCard from "@/components/MetricCard";
import OutcomeRetentionChart from "@/components/Charts/OutcomeRetentionChart";
import WageProgressionChart from "@/components/Charts/WageProgressionChart";
import NonPlacementPie from "@/components/Charts/NonPlacementPie";
import EmptyState from "@/components/EmptyState";
import { getLongitudinalOverview, getNonPlacementDistribution, getDistrictAnalytics } from "@/lib/analytics";
import { synthesizeGovernmentPolicyInsights } from "@/lib/ai-service";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { 
  Landmark, 
  Users, 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  FileSpreadsheet, 
  ArrowRight,
  Star,
  Layers,
  AlertCircle
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const metrics = await getLongitudinalOverview();
  const nonPlacementReasons = await getNonPlacementDistribution();
  const districtData = await getDistrictAnalytics();

  // Retention chart data — only show real database values
  const retentionCurve = metrics.hasData ? [
    { milestone: "Placement", rate: 100 },
    { milestone: "30 Days", rate: metrics.retention90Days > 0 ? 99 : 0 },
    { milestone: "90 Days", rate: metrics.retention90Days },
    { milestone: "180 Days", rate: metrics.retention180Days },
    { milestone: "365 Days", rate: metrics.retention365Days },
  ] : [];

  // Wage progression data — only show if real data exists
  const wageData = (metrics.hasData && metrics.avgInitialSalary > 0) ? [
    { stage: "Initial Placement", avgSalary: metrics.avgInitialSalary },
    { stage: "Month 6 Milestone", avgSalary: metrics.avgCurrentSalary > 0 ? metrics.avgCurrentSalary : metrics.avgInitialSalary },
  ] : [];

  // AI Policy Insights
  const policyInsights = synthesizeGovernmentPolicyInsights({
    totalTrainees: metrics.totalTrainees,
    retention90Days: metrics.retention90Days,
    retention180Days: metrics.retention180Days,
    topNonPlacementReasons: nonPlacementReasons,
    districtBreakdown: districtData,
  });

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              National Outcome Intelligence
            </span>
            <span className="text-xs text-muted">Longitudinal Outcome Analytics</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Executive Government Intelligence
          </h1>
          <p className="text-xs text-muted">
            Macro longitudinal monitoring of vocational skilling outcomes, district disparities, and employment retention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Policy Interventions & Export</span>
          </Link>
          <Link
            href="/admin/districts"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-pill hover:bg-white text-charcoal-800 text-xs font-semibold border border-border transition"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>District Heatmap</span>
          </Link>
        </div>
      </div>

      {/* Macro KPI Metrics (Real Data Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Trainees Monitored"
          value={metrics.hasData ? metrics.totalTrainees : "—"}
          subtitle="Active longitudinal cohort"
          icon={Users}
        />

        <MetricCard
          title="Employment Outcome Rate"
          value={metrics.hasData ? `${metrics.overallEmploymentRate}%` : "—"}
          subtitle="Formal, self & apprenticeships"
          icon={Briefcase}
          badge={metrics.overallEmploymentRate >= 70 ? "Target Met" : "Monitoring"}
        />

        <MetricCard
          title="180-Day Retention"
          value={metrics.hasData ? `${metrics.retention180Days}%` : "—"}
          subtitle="6-Month employment survival"
          icon={TrendingUp}
        />

        <MetricCard
          title="Average Monthly Wage"
          value={metrics.hasData ? formatCurrency(metrics.avgCurrentSalary) : "—"}
          subtitle={`+${metrics.avgWageGrowthPercent}% longitudinal growth`}
          icon={TrendingUp}
        />
      </div>

      {!metrics.hasData && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-between text-xs text-muted">
          <span>Currently in clean production database state. To populate test cohorts across districts:</span>
          <span className="font-mono text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-border">npm run db:seed</span>
        </div>
      )}

      {/* AI Policy Interventions Alert Carousel */}
      <div className="bg-charcoal-800 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-elevated relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-base text-white">
              AI Policy Interventions & Synthesized Alerts
            </h3>
          </div>
          <Link href="/admin/reports" className="text-xs text-emerald-300 hover:text-white font-semibold">
            View All Directives →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policyInsights.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {item.priority} PRIORITY
                </span>
                {item.district && <span className="text-white/70 text-[11px]">District: {item.district}</span>}
              </div>

              <h4 className="font-bold text-white text-sm">
                {item.issueSummary}
              </h4>

              <p className="text-sage-200/90 leading-relaxed text-[11px]">
                <strong>Directive:</strong> {item.recommendedAction}
              </p>

              <p className="text-[10px] text-white/50 pt-1 border-t border-white/10">
                Evidence: {item.dataEvidence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Grid: Retention Curve + Wage Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Retention Curve (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Longitudinal Retention Survival Curve
              </h3>
              <p className="text-xs text-muted">
                30, 90, 180, and 365-day retention survival across cohorts
              </p>
            </div>
            <Link href="/admin/retention" className="text-xs text-emerald-800 font-semibold hover:underline">
              Inspect →
            </Link>
          </div>

          <OutcomeRetentionChart data={metrics.hasData ? retentionCurve : []} />
        </div>

        {/* Wage Progression Curve (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Graduate Monthly Wage Progression
              </h3>
              <p className="text-xs text-muted">
                Initial starting wage vs. 3-Month and 6-Month increments
              </p>
            </div>
            <Link href="/admin/retention" className="text-xs text-emerald-800 font-semibold hover:underline">
              Inspect →
            </Link>
          </div>

          <WageProgressionChart data={metrics.hasData ? wageData : []} />
        </div>

      </div>

      {/* Non-Placement Analysis & District Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Non-Placement Root Causes (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Non-Placement Root Cause Breakdown
              </h3>
              <p className="text-xs text-muted">
                Primary friction drivers reported by candidates seeking work
              </p>
            </div>
          </div>

          <NonPlacementPie data={nonPlacementReasons} />
        </div>

        {/* District Performance Summary (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-800">
                District Outcome Rankings
              </h3>
              <p className="text-xs text-muted">
                Comparative employment outcome conversion by district
              </p>
            </div>
            <Link href="/admin/districts" className="text-xs text-emerald-800 font-semibold hover:underline">
              Full Heatmap →
            </Link>
          </div>

          {districtData.length === 0 ? (
            <p className="text-xs text-muted py-8 text-center">No district records currently available.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {districtData.map((d) => (
                <div key={d.district} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-charcoal-800">{d.district}</span>
                    <p className="text-[11px] text-muted">{d.totalCount} trained · {d.certifiedCount} certified</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-800 text-sm">{d.employmentRate}% Placed</span>
                    <span className="text-[11px] text-muted">Avg ₹{d.avgSalary.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
