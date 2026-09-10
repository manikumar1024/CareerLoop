"use client";

import React, { useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  Server, 
  Database, 
  BrainCircuit, 
  BarChart3, 
  Building2, 
  Landmark, 
  Sparkles,
  ArrowDown,
  Info,
  CheckCircle2,
  Lock,
  Layers
} from "lucide-react";

interface NodeDetail {
  id: string;
  title: string;
  category: string;
  icon: any;
  purpose: string;
  dataHandled: string[];
  connections: string[];
  securityPrivacy: string;
}

const ARCHITECTURE_NODES: Record<string, NodeDetail> = {
  roles: {
    id: "roles",
    title: "Multi-Stakeholder Portals",
    category: "User Layer",
    icon: Users,
    purpose: "Dedicated, role-tailored interfaces for Trainees, Employers, Training Providers, and Government Administrators.",
    dataHandled: ["User credentials", "Role state", "Profile information", "Interaction events"],
    connections: ["Routes to Authentication Layer via OAuth / Credentials", "Renders specialized role dashboards"],
    securityPrivacy: "Session-based role guards; unauthorized users are redirected immediately.",
  },
  auth: {
    id: "auth",
    title: "Authentication & RBAC Gate",
    category: "Identity Layer",
    icon: ShieldCheck,
    purpose: "Provides Google OAuth 2.0 and NextAuth JWT sessions with strict Role-Based Access Control and Admin approval verification.",
    dataHandled: ["OAuth tokens", "Signed JWT cookies", "Admin authorization codes", "Consent timestamps"],
    connections: ["Authenticates users from Frontend", "Passes validated user session to API layer"],
    securityPrivacy: "Stateless signed JWTs, CSRF protection, and explicit admin approval code verification.",
  },
  api: {
    id: "api",
    title: "API & Backend Server Actions",
    category: "Application Layer",
    icon: Server,
    purpose: "Processes outcome submissions, verification workflows, follow-up milestone engines, and analytical aggregations.",
    dataHandled: ["Employment records", "Assessment scores", "Follow-up survey responses", "Verification status transitions"],
    connections: ["Receives requests from Frontend", "Interacts with Prisma ORM & Database", "Triggers AI & Analytics Engines"],
    securityPrivacy: "Server-side session validation on all protected endpoints; input validation schemas.",
  },
  db: {
    id: "db",
    title: "Relational Outcome Database (Prisma / SQL)",
    category: "Data Layer",
    icon: Database,
    purpose: "Normalized relational schema storing longitudinal tracking data from enrollment to 365-day retention.",
    dataHandled: ["Trainees (CLP-XXXX)", "Enrollments", "Certifications", "Employment records", "Audit logs"],
    connections: ["Managed via Prisma ORM", "Serves queries to Analytics and AI layers"],
    securityPrivacy: "No client-side DB access, parameterized queries prevent SQL injection, encrypted password hashes.",
  },
  ai: {
    id: "ai",
    title: "Explainable AI Outcome Intelligence Engine",
    category: "AI & Intelligence Layer",
    icon: BrainCircuit,
    purpose: "Computes explainable skill gaps, multi-factor employability risk scores, and learning roadmaps (powered by Gemini API & deterministic rules).",
    dataHandled: ["Trainee skill proficiencies", "Industry role taxonomy requirements", "Attendance & assessment scores"],
    connections: ["Evaluates trainee records from Database", "Outputs structured recommendations to Trainees and Government Admin"],
    securityPrivacy: "AI output is validated before display; zero personally identifiable information leaked to public models.",
  },
  analytics: {
    id: "analytics",
    title: "Longitudinal Analytics Engine",
    category: "Analytics Layer",
    icon: BarChart3,
    purpose: "Calculates real-time 30/90/180/365-day retention curves, wage progression curves, and district performance heatmaps with zero dummy data.",
    dataHandled: ["Aggregated survival rates", "Salary progression delta", "Skill relevance scores (1-5)", "Non-placement root causes"],
    connections: ["Queries Database directly", "Feeds Government Admin Intelligence visualizations"],
    securityPrivacy: "Data is anonymized and aggregated at district and cohort levels.",
  },
  gov: {
    id: "gov",
    title: "Government Admin Intelligence",
    category: "Policy & Executive Layer",
    icon: Landmark,
    purpose: "Executive portal providing macro KPI dashboards, district comparison matrices, course ROI rankings, and policy recommendations.",
    dataHandled: ["District heatmaps", "Provider scorecards", "Course outcome conversion ratios", "Audit trails"],
    connections: ["Receives synthesized intelligence from AI and Analytics layers", "Exports PDF and CSV reports"],
    securityPrivacy: "Restricted to authorized Government Admin accounts with multi-layered credential checking.",
  },
  policy: {
    id: "policy",
    title: "Actionable Policy Interventions",
    category: "Impact & Action Layer",
    icon: Sparkles,
    purpose: "Converts longitudinal intelligence into prioritized, evidence-backed policy interventions for District Skill Committees.",
    dataHandled: ["Priority action items", "Evidence citations", "Curriculum upgrade directives", "Incentive allocations"],
    connections: ["Generated from real analytical drop-off triggers", "Empowers policymakers to improve skilling programs"],
    securityPrivacy: "Full auditability of generated recommendations and evidence citations.",
  },
};

export default function ArchitectureFlow() {
  const [selectedNode, setSelectedNode] = useState<NodeDetail>(ARCHITECTURE_NODES.roles);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Visual Interactive Architecture Diagram (Left 7 cols) */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-800" />
            <h3 className="font-display font-bold text-lg text-charcoal-800">
              Interactive System Flow
            </h3>
          </div>
          <span className="text-[11px] text-muted font-medium bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
            Click any component to inspect
          </span>
        </div>

        <div className="flex flex-col items-center space-y-4">
          
          {/* Level 1: Stakeholder Roles */}
          <div className="w-full">
            <button
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.roles)}
              className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                selectedNode.id === "roles"
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-sage-50/70 hover:bg-sage-100/70 border-sage-200 text-charcoal-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selectedNode.id === "roles" ? "bg-white/10" : "bg-white text-emerald-800"}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Stakeholders</p>
                  <h4 className="font-semibold text-sm">Trainee · Employer · Training Provider · Government</h4>
                </div>
              </div>
              <Info className="w-4 h-4 opacity-70" />
            </button>
          </div>

          <ArrowDown className="w-4 h-4 text-emerald-700/60 animate-bounce" />

          {/* Level 2: Authentication */}
          <div className="w-full max-w-md">
            <button
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.auth)}
              className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
                selectedNode.id === "auth"
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white hover:bg-sage-50 border-border text-charcoal-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selectedNode.id === "auth" ? "bg-white/10" : "bg-emerald-50 text-emerald-800"}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Identity & Security</p>
                  <h4 className="font-semibold text-sm">Authentication (Google OAuth + RBAC)</h4>
                </div>
              </div>
              <Info className="w-4 h-4 opacity-70" />
            </button>
          </div>

          <ArrowDown className="w-4 h-4 text-emerald-700/60" />

          {/* Level 3: API Layer */}
          <div className="w-full max-w-lg">
            <button
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.api)}
              className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
                selectedNode.id === "api"
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white hover:bg-sage-50 border-border text-charcoal-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selectedNode.id === "api" ? "bg-white/10" : "bg-emerald-50 text-emerald-800"}`}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Application Tier</p>
                  <h4 className="font-semibold text-sm">API / Server Actions & Follow-up Engine</h4>
                </div>
              </div>
              <Info className="w-4 h-4 opacity-70" />
            </button>
          </div>

          <ArrowDown className="w-4 h-4 text-emerald-700/60" />

          {/* Level 4: Core Engine Triad (Database, AI Engine, Analytics) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.db)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                selectedNode.id === "db"
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white hover:bg-sage-50 border-border text-charcoal-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Storage</span>
              </div>
              <h4 className="font-semibold text-xs sm:text-sm">Relational DB (Prisma)</h4>
            </button>

            <button
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.ai)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                selectedNode.id === "ai"
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white hover:bg-sage-50 border-border text-charcoal-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Intelligence</span>
              </div>
              <h4 className="font-semibold text-xs sm:text-sm">AI Engine (Skill Gap & Risk)</h4>
            </button>

            <button
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.analytics)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                selectedNode.id === "analytics"
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white hover:bg-sage-50 border-border text-charcoal-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Longitudinal</span>
              </div>
              <h4 className="font-semibold text-xs sm:text-sm">Analytics Engine</h4>
            </button>
          </div>

          <ArrowDown className="w-4 h-4 text-emerald-700/60" />

          {/* Level 5: Government Intelligence */}
          <div className="w-full max-w-lg">
            <button
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.gov)}
              className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
                selectedNode.id === "gov"
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white hover:bg-sage-50 border-border text-charcoal-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selectedNode.id === "gov" ? "bg-white/10" : "bg-emerald-50 text-emerald-800"}`}>
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Government Tier</p>
                  <h4 className="font-semibold text-sm">District · Course · Provider Intelligence</h4>
                </div>
              </div>
              <Info className="w-4 h-4 opacity-70" />
            </button>
          </div>

          <ArrowDown className="w-4 h-4 text-emerald-700/60" />

          {/* Level 6: Actionable Policy Insights */}
          <div className="w-full">
            <button
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.policy)}
              className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                selectedNode.id === "policy"
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-charcoal-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selectedNode.id === "policy" ? "bg-white/10" : "bg-white text-emerald-800"}`}>
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Impact</p>
                  <h4 className="font-semibold text-sm">Actionable Policy Interventions & Curriculum Directives</h4>
                </div>
              </div>
              <Info className="w-4 h-4 opacity-70" />
            </button>
          </div>

        </div>
      </div>

      {/* Component Inspector Panel (Right 5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card sticky top-24">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
            <selectedNode.icon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
              {selectedNode.category}
            </span>
            <h3 className="font-display font-bold text-xl text-charcoal-800">
              {selectedNode.title}
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
          {selectedNode.purpose}
        </p>

        <div className="space-y-4 text-xs">
          
          {/* Data Handled */}
          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-charcoal-800">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>Data Processed & Transferred:</span>
            </div>
            <ul className="space-y-1 text-muted pl-5 list-disc">
              {selectedNode.dataHandled.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          {/* Connections */}
          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-charcoal-800">
              <Server className="w-3.5 h-3.5 text-emerald-700" />
              <span>System Interconnections:</span>
            </div>
            <ul className="space-y-1 text-muted pl-5 list-disc">
              {selectedNode.connections.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Security & Privacy */}
          <div className="p-4 rounded-2xl bg-white border border-border space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 font-semibold text-charcoal-800">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Security & Consent Enforcement:</span>
            </div>
            <p className="text-muted leading-relaxed">
              {selectedNode.securityPrivacy}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
