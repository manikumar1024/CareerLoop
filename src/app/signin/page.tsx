"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Landmark, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight,
  Shield
} from "lucide-react";

export default function SignInDirectoryPage() {
  const portals = [
    {
      id: "student",
      title: "Student & Trainee Portal",
      desc: "Access digital credentials, personalized learning roadmap, and career readiness diagnostics.",
      href: "/login/student",
      icon: GraduationCap,
      badge: "Learner Access",
      accent: "hover:border-emerald-600",
    },
    {
      id: "trainer",
      title: "Vocational Trainer Portal",
      desc: "Manage assigned cohorts, student rosters, attendance tracking, and assessment grading.",
      href: "/login/trainer",
      icon: BookOpen,
      badge: "Instructor Access",
      accent: "hover:border-teal-600",
    },
    {
      id: "provider",
      title: "Training Provider Portal",
      desc: "Manage vocational programs, certified trainers, batch schedules, and placement outcomes.",
      href: "/login/provider",
      icon: Building2,
      badge: "Institution Access",
      accent: "hover:border-blue-600",
    },
    {
      id: "employer",
      title: "Employer Hiring Portal",
      desc: "Verify trainee placements, post vacancies, assess candidate skill fit, and monitor retention.",
      href: "/login/employer",
      icon: ShieldCheck,
      badge: "Corporate HR Access",
      accent: "hover:border-purple-600",
    },
    {
      id: "government",
      title: "Government Administration",
      desc: "Longitudinal outcome oversight, district heatmaps, course ROI, and policy directives.",
      href: "/login/government",
      icon: Landmark,
      badge: "Civic Authority",
      accent: "hover:border-amber-600",
    },
    {
      id: "admin",
      title: "System Administrator Console",
      desc: "Platform governance, institutional onboarding, user moderation, and immutable audit logs.",
      href: "/login/admin",
      icon: ShieldAlert,
      badge: "Root Administration",
      accent: "hover:border-rose-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-border/60">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-sm">
            CL
          </span>
          <span className="font-display font-bold text-xl text-charcoal-800">
            careerloop<span className="text-emerald-700 font-extrabold">.ai</span>
          </span>
        </Link>
        <span className="text-xs text-muted">Role-Based Access Control (RBAC)</span>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 sm:py-16 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 text-charcoal-800 text-[11px] font-semibold border border-sage-200">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dedicated Authentication Gateways</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-charcoal-800 tracking-tight">
            Select Your Authorized Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            CareerLoop AI enforces isolated role boundaries. Choose your organization role to sign in to your dedicated workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                href={p.href}
                className={`bg-white rounded-3xl p-6 border border-border shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between group ${p.accent}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-sage-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-charcoal-800 group-hover:text-emerald-800 transition">
                    {p.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
