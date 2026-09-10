import React from "react";
import Link from "next/link";

import Footer from "@/components/Footer";
import MetricCard from "@/components/MetricCard";
import { getLongitudinalOverview } from "@/lib/analytics";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Landmark, 
  Layers, 
  Award, 
  BarChart3, 
  Briefcase,
  Clock,
  Zap,
  Play
} from "lucide-react";

export const revalidate = 0; // Fresh real-time data from database

export default async function HomePage() {
  const metrics = await getLongitudinalOverview();

  const lifecycleStages = [
    { num: "01", name: "Train", desc: "NSDC / accredited curriculum delivery" },
    { num: "02", name: "Certify", desc: "Digital verifiable skill credentials" },
    { num: "03", name: "Place", desc: "Employer matching & apprenticeship" },
    { num: "04", name: "Employ", desc: "Formal & self-employment tracking" },
    { num: "05", name: "Retain", desc: "30, 90, 180 & 365-day check-ins" },
    { num: "06", name: "Progress", desc: "Wage increments & role promotions" },
    { num: "07", name: "Analyze", desc: "AI skill gap & risk diagnosis" },
    { num: "08", name: "Improve", desc: "Evidence-backed policy interventions" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      
      {/* Soft Ambient Light Dome (Amra Visual Reference) */}
      <div className="amra-ambient-top" />
      <div className="amra-ambient-dome" />

      {/* Navbar removed from landing page for cleaner hero experience */}

      <main className="flex-1 z-10">
        
        {/* =========================================================================
            HERO SECTION — Editorial Typography & Ambient Halo Glow
        ========================================================================= */}
        <section className="pt-12 sm:pt-20 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center relative">
          
          {/* Mission Capsule */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill shadow-soft text-xs font-semibold tracking-wider text-charcoal-700 uppercase mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>AI-Powered Outcome Intelligence Platform</span>
          </div>

          {/* Large Hero Headline (Amra-inspired Heavy Responsive Typography) */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-charcoal-800 tracking-tight leading-[1.08] max-w-5xl mx-auto mb-6">
            Make every <br className="hidden sm:inline" />
            <span className="text-emerald-700">skill count.</span>
          </h1>

          {/* Subtitle Statement */}
          <p className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            CareerLoop AI connects skills, training, employment, and long-term livelihood outcomes into one measurable, actionable intelligence journey.
          </p>

          {/* Dual Primary Call-to-Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signin"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm tracking-wide shadow-elevated hover:shadow-glow transition-all flex items-center justify-center gap-2 group"
            >
              <span>Access Role Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full glass-pill hover:bg-white text-charcoal-800 font-semibold text-sm tracking-wide border border-border shadow-soft transition-all flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>How It Works</span>
            </Link>
          </div>

          {/* Floating Conceptual Outcome Capsule (Inspired by Bottom-Right Amra Floating Widget) */}
          <div className="max-w-4xl mx-auto glass-card rounded-3xl p-6 sm:p-8 shadow-card border border-border text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold">
                  CL
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-charcoal-800">
                    Longitudinal Outcome Tracker
                  </h3>
                  <p className="text-xs text-muted">
                    Continuous follow-up tracking across 30d, 90d, 180d & 365d milestones
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                <span>Employer Verified Outcomes</span>
              </div>
            </div>

            {/* Metric Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Trainees Tracked</p>
                <p className="font-display font-bold text-xl sm:text-2xl text-charcoal-800 mt-1">
                  {metrics.hasData ? metrics.totalTrainees : "—"}
                </p>
                <p className="text-[10px] text-muted">Active database records</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Employment Rate</p>
                <p className="font-display font-bold text-xl sm:text-2xl text-emerald-700 mt-1">
                  {metrics.hasData ? `${metrics.overallEmploymentRate}%` : "—"}
                </p>
                <p className="text-[10px] text-muted">Verified & self-reported</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">6-Month Retention</p>
                <p className="font-display font-bold text-xl sm:text-2xl text-charcoal-800 mt-1">
                  {metrics.hasData ? `${metrics.retention180Days}%` : "—"}
                </p>
                <p className="text-[10px] text-muted">180-day milestone survival</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Avg Monthly Wage</p>
                <p className="font-display font-bold text-xl sm:text-2xl text-charcoal-800 mt-1">
                  {metrics.hasData ? formatCurrency(metrics.avgCurrentSalary) : "—"}
                </p>
                <p className="text-[10px] text-muted">+{metrics.avgWageGrowthPercent}% progression</p>
              </div>
            </div>

            {!metrics.hasData && (
              <div className="mt-4 p-3 rounded-xl bg-sage-50 border border-sage-200 text-xs text-muted flex items-center justify-between">
                <span>Currently in clean database mode. Run seed script for sample test cohorts.</span>
                <span className="font-mono text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded border border-border">npm run db:seed</span>
              </div>
            )}
          </div>

        </section>

        {/* =========================================================================
            LIFECYCLE PIPELINE — The 8 Longitudinal Milestones
        ========================================================================= */}
        <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-charcoal-800 tracking-tight mb-3">
              Beyond the Certification Deadline
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Traditional training portals stop tracking at certification. CareerLoop AI answers what happens afterward to secure sustainable livelihoods.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {lifecycleStages.map((stage, idx) => (
              <div
                key={stage.num}
                className="bg-white rounded-2xl p-4 border border-border shadow-xs hover:border-emerald-300 transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {stage.num}
                  </span>
                  <h4 className="font-display font-bold text-sm text-charcoal-800 mt-2">
                    {stage.name}
                  </h4>
                  <p className="text-[11px] text-muted mt-1 leading-snug">
                    {stage.desc}
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <ArrowRight className="w-3 h-3 text-muted group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            CORE QUESTIONS SOLVED — WHAT, WHY, WHAT LIKELY, WHAT TO DO
        ========================================================================= */}
        <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Question 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal-800">
                What Happened?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Tracks real post-training outcomes: formal employment, verified self-employment, apprenticeships, wage increments, and multi-year career retention.
              </p>
            </div>

            {/* Question 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal-800">
                Why Did It Happen?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Pinpoints root-cause drivers of non-placement and attrition: practical curriculum divergence, district vacancy deficits, or wage expectation mismatches.
              </p>
            </div>

            {/* Question 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal-800">
                What is Likely to Happen?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Explainable AI employability risk modeling highlights vulnerable cohorts early, enabling counselors to intervene before drop-outs occur.
              </p>
            </div>

            {/* Question 4 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal-800">
                What Should Be Done?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Translates analytics into actionable policy directives, modular curriculum upgrades, and targeted district employer engagement drives.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================================
            ROLE HUBS — Trainee, Employer, Provider, Government
        ========================================================================= */}
        <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-charcoal-800 tracking-tight mb-3">
              Unified Civic-Tech Ecosystem
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Built for all key participants in the national skilling and livelihood economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Trainee Card */}
            <div className="bg-white rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-charcoal-800 mb-2">
                  Trainee Portal
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-4">
                  Digital career profile (CLP-XXXX), verifiable credentials, longitudinal career timeline, 30-365d follow-ups, and AI skill gap roadmap.
                </p>
              </div>
              <Link
                href="/login/student"
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 pt-3 border-t border-border/50"
              >
                <span>Access Student Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Employer Card */}
            <div className="bg-white rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-charcoal-800 mb-2">
                  Employer Portal
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-4">
                  Two-tier verification queue for employee hiring claims, skill utilization scoring, and retention analytics.
                </p>
              </div>
              <Link
                href="/login/employer"
                className="text-xs font-semibold text-purple-800 hover:text-purple-900 flex items-center gap-1.5 pt-3 border-t border-border/50"
              >
                <span>Access Employer Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Provider Card */}
            <div className="bg-white rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-charcoal-800 mb-2">
                  Training Provider Portal
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-4">
                  Program cohort management, assessment logging, completion-to-placement tracking, and longitudinal wage growth insights.
                </p>
              </div>
              <Link
                href="/login/provider"
                className="text-xs font-semibold text-blue-800 hover:text-blue-900 flex items-center gap-1.5 pt-3 border-t border-border/50"
              >
                <span>Access Provider Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Government Admin Card */}
            <div className="bg-white rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-charcoal-800 mb-2">
                  Government Intelligence
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-4">
                  Macro KPIs, district outcome heatmaps, course ROI comparisons, non-placement root causes, and exportable policy reports.
                </p>
              </div>
              <Link
                href="/login/government"
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 pt-3 border-t border-border/50"
              >
                <span>Access Government Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </section>

        {/* =========================================================================
            FINAL CALLOUT — Core Differentiator
        ========================================================================= */}
        <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
          <div className="bg-charcoal-800 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-elevated">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Outcome Intelligence Difference</span>
              </div>

              <h2 className="font-display font-bold text-2xl sm:text-4xl tracking-tight leading-tight">
                &ldquo;Don&apos;t just count how many people were trained. <br />
                <span className="text-emerald-400">Measure what happened to them afterward.</span>&rdquo;
              </h2>

              <p className="text-xs sm:text-sm text-sage-200 leading-relaxed">
                CareerLoop AI turns training records into long-term livelihood intelligence. Explore our interactive architecture or register your role to test.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/architecture"
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  Explore System Architecture
                </Link>
                <Link
                  href="/signin"
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                >
                  Sign In to Portal
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
