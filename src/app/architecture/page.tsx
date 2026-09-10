import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArchitectureFlow from "@/components/ArchitectureFlow";
import { Layers, ShieldCheck, Database, BrainCircuit, Terminal } from "lucide-react";

export const metadata = {
  title: "System Architecture — CareerLoop AI",
  description: "Interactive technical architecture diagram explaining how CareerLoop AI connects trainees, employers, training providers, AI engines, and government policy intelligence.",
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Ambient lighting */}
      <div className="amra-ambient-top" />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 w-full z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>Technical Architecture Visualizer</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-charcoal-800 tracking-tight leading-tight">
            How CareerLoop AI <span className="text-emerald-700">connects</span> the skilling lifecycle.
          </h1>

          <p className="text-sm sm:text-base text-muted leading-relaxed">
            A comprehensive, longitudinal civic-tech outcome platform. Click through the interactive system flow below to explore how multi-stakeholder inputs translate into verifiable policy intelligence.
          </p>
        </div>

        {/* Interactive Diagram Component */}
        <ArchitectureFlow />

        {/* Technical Specifications Summary */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Normalized Schema
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              PostgreSQL & SQLite compatible relational schema with strict foreign keys tracking trainees by platform-level unique identifier (CLP-XXXX) through multiple follow-up milestones.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Explainable AI Layer
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Gemini Generative AI API integrated alongside deterministic mathematical fallback engines to ensure 100% transparent, explainable recommendations without black-box bias.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Dual-Tier Verification
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Distinguishes self-reported trainee outcome surveys from employer-verified employment records, giving government administrators high-fidelity, audit-ready data.
            </p>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
