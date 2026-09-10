import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  BrainCircuit, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  TrendingUp,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "How It Works — CareerLoop AI",
  description: "Learn how CareerLoop AI continuously tracks post-training livelihoods, employment retention, wage growth, and skill gaps across 30, 90, 180, and 365-day milestones.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      title: "Enrollment & Digital Identity (CLP-XXXX)",
      description: "When a trainee enrolls in any accredited vocational or skilling program, CareerLoop AI assigns an immutable, platform-level Unique Trainee ID. This ensures the trainee's journey is permanently tracked even if they change phone numbers, relocate, or shift employers.",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-800 border-blue-200",
    },
    {
      step: "02",
      title: "Assessment & Verifiable Digital Credentials",
      description: "Upon course completion, practical standardized assessment scores and competencies are recorded. Digitally signed certifications are issued with QR-verifiable authenticity.",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      step: "03",
      title: "Placement & Two-Tier Employment Verification",
      description: "When a trainee secures formal employment, apprenticeship, or launches a self-employment enterprise, the record is flagged as 'Self-Reported'. Partner employers can verify the hire, job title, and salary in their portal, transitioning the record to 'Employer-Verified'.",
      icon: Briefcase,
      color: "bg-purple-50 text-purple-800 border-purple-200",
    },
    {
      step: "04",
      title: "Automated Longitudinal Follow-Up Engine",
      description: "At 30, 90, 180, and 365-day milestones, automated follow-up prompts ask trainees if they are still employed, whether they received promotions or wage hikes, and whether their daily work utilizes the skills taught during training.",
      icon: Clock,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      step: "05",
      title: "Explainable AI Skill Gap & Risk Intelligence",
      description: "For trainees seeking upskilling or facing unemployment, the AI engine diagnoses specific missing competencies against target industry role taxonomies, producing tailored 3-phase learning roadmaps.",
      icon: BrainCircuit,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      step: "06",
      title: "Government Policy & District Impact Synthesis",
      description: "Aggregated, real-time longitudinal data flows into executive government intelligence dashboards, highlighting district-level drop-offs, course ROI, and non-placement drivers to trigger targeted interventions.",
      icon: BarChart3,
      color: "bg-charcoal-800 text-white border-charcoal-900",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="amra-ambient-top" />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 w-full z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wider uppercase">
            <span>Methodology & Lifecycle</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-charcoal-800 tracking-tight leading-tight">
            How CareerLoop AI <span className="text-emerald-700">tracks real impact</span> over time.
          </h1>

          <p className="text-sm sm:text-base text-muted leading-relaxed">
            A step-by-step breakdown of how data is captured, verified, and synthesized into actionable livelihood intelligence.
          </p>
        </div>

        {/* Step-by-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-white rounded-3xl p-7 border border-border shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      STEP {s.step}
                    </span>
                    <div className={`p-2 rounded-xl border ${s.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-base text-charcoal-800 mb-2">
                    {s.title}
                  </h3>

                  <p className="text-xs text-muted leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-border shadow-card mb-16">
          <h2 className="font-display font-bold text-2xl text-charcoal-800 text-center mb-8">
            Traditional Skilling vs. CareerLoop AI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-red-50/40 border border-red-200/60 space-y-3">
              <h4 className="font-bold text-sm text-red-900 uppercase tracking-wider">Traditional Status Quo</h4>
              <ul className="space-y-2 text-xs text-red-800/90 list-disc pl-5">
                <li>Tracking ceases the moment the candidate receives their certificate.</li>
                <li>Zero visibility into whether graduates are employed 6 or 12 months later.</li>
                <li>No verification of whether skills acquired are actually used at work.</li>
                <li>Self-employment is unrecorded and treated as non-placement.</li>
                <li>Drop-outs and wage stagnation remain a policy black box.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <h4 className="font-bold text-sm text-emerald-900 uppercase tracking-wider">CareerLoop AI Outcome Intelligence</h4>
              <ul className="space-y-2 text-xs text-emerald-900 list-disc pl-5">
                <li>Continuous 30, 90, 180, and 365-day milestone tracking.</li>
                <li>Dual-tier employer verification for audit-ready placement records.</li>
                <li>Captures salary growth curves, promotions, and skill relevance (1-5).</li>
                <li>First-class tracking for self-employment and micro-enterprises.</li>
                <li>Explainable AI policy interventions to upgrade lagging training centers.</li>
              </ul>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
