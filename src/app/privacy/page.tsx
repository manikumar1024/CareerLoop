import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck } from "lucide-react";

export const metadata = {
  title: "Privacy, Trust & Consent — CareerLoop AI",
  description: "Consent-led by design: Discover our civic-tech data privacy framework, consent architecture, role-based visibility controls, and audit logs.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="amra-ambient-top" />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-12 w-full z-10 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Consent-Led by Design</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-charcoal-800 tracking-tight leading-tight">
            Privacy, Trust & <span className="text-emerald-700">Data Governance</span>
          </h1>

          <p className="text-sm sm:text-base text-muted leading-relaxed">
            CareerLoop AI is built on the principle of purposeful data minimization and explicit, revocable trainee consent for long-term outcome evaluation.
          </p>
        </div>

        {/* 4 Pillars of Data Protection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Explicit Informed Consent
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Trainees explicitly grant permission before follow-up contact or employer verification begins. Consent records are timestamped with IP and user-agent metadata in immutable audit logs.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Role-Based Data Visibility
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Employers only see records for candidates who applied to or work at their organization. Training providers only see aggregated outcomes for their enrolled cohorts.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-800">
              District-Level Anonymization
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Government intelligence views operate on anonymized, cohort-aggregated data. Individual identifiable data is restricted to verified verification workflows.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Government Admin Approval Gate
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Administrative access is not self-serve. New government accounts require cryptographic registration verification codes before macro outcome intelligence is unlocked.
            </p>
          </div>

        </div>

        {/* Detailed Data Charter */}
        <div className="bg-white rounded-3xl p-8 border border-border shadow-card space-y-6">
          <h2 className="font-display font-bold text-xl text-charcoal-800">
            Civic-Tech Data Charter
          </h2>

          <div className="space-y-4 text-xs text-charcoal-700 leading-relaxed">
            <p>
              <strong>1. Purpose Limitation:</strong> Data collected via CareerLoop AI (including employment status, starting salaries, and skill proficiencies) is exclusively used to measure training efficacy, improve skilling curricula, and identify geographical skill friction points.
            </p>
            <p>
              <strong>2. No Commercial Monetization:</strong> Trainee records are never sold, rented, or shared with third-party advertisers or commercial data brokers.
            </p>
            <p>
              <strong>3. Immutable Audit Trails:</strong> Every critical administrative action, verification status transition, and consent update creates an encrypted entry in the platform&apos;s system audit log table.
            </p>
            <p>
              <strong>4. Right to Revoke:</strong> Trainees can manage their consent settings and choose what details are visible to employers at any time in their profile settings.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
