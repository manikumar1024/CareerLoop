import React from "react";
import Link from "next/link";
import { Shield, Sparkles, Database, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-sage-50/50 mt-auto py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Col 1: Platform Overview */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-xs">
              CL
            </span>
            <span className="font-display font-bold text-lg text-charcoal-800">
              careerloop<span className="text-emerald-700">.ai</span>
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            AI-Powered Longitudinal Skill-to-Livelihood Outcome Intelligence Platform. Turning training records into measurable livelihood impact.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Consent-led & Privacy by Design</span>
          </div>
        </div>

        {/* Col 2: Portals */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">Portals</h4>
          <ul className="space-y-1.5 text-xs text-muted">
            <li><Link href="/trainee" className="hover:text-emerald-800 transition">Trainee Career Portal</Link></li>
            <li><Link href="/employer" className="hover:text-emerald-800 transition">Employer Verification Portal</Link></li>
            <li><Link href="/provider" className="hover:text-emerald-800 transition">Training Provider Portal</Link></li>
            <li><Link href="/admin" className="hover:text-emerald-800 transition">Government Outcome Intelligence</Link></li>
          </ul>
        </div>

        {/* Col 3: Architecture & Technology */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">Intelligence</h4>
          <ul className="space-y-1.5 text-xs text-muted">
            <li><Link href="/architecture" className="hover:text-emerald-800 transition">Interactive Architecture</Link></li>
            <li><Link href="/how-it-works" className="hover:text-emerald-800 transition">Longitudinal Tracking Engine</Link></li>
            <li><Link href="/privacy" className="hover:text-emerald-800 transition">Data Consent & Trust Policy</Link></li>
            <li><Link href="/signin" className="hover:text-emerald-800 transition">Unified Role Authentication</Link></li>
          </ul>
        </div>

        {/* Col 4: Mission & Civic Tech Purpose */}
        <div className="space-y-2 bg-white/80 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Our Mission</span>
          </div>
          <p className="text-[11px] text-muted leading-normal">
            &ldquo;Solving the critical challenge of tracking employment outcomes, skill gaps, and the real impact of skilling initiatives.&rdquo;
          </p>
          <div className="text-[10px] text-emerald-800 font-mono pt-1">
            Status: Active Outcome Engine
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
        <p>© {new Date().getFullYear()} CareerLoop AI. Designed for National Skill Outcome Intelligence.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-emerald-800 transition">Privacy & Audit</Link>
          <Link href="/architecture" className="hover:text-emerald-800 transition">Architecture Flow</Link>
          <Link href="/how-it-works" className="hover:text-emerald-800 transition">Methodology</Link>
        </div>
      </div>
    </footer>
  );
}
