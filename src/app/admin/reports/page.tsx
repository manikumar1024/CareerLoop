import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { getLongitudinalOverview, getDistrictAnalytics, getNonPlacementDistribution } from "@/lib/analytics";
import { synthesizeGovernmentPolicyInsights } from "@/lib/ai-service";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Printer
} from "lucide-react";

export const revalidate = 0;

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const metrics = await getLongitudinalOverview();
  const districtData = await getDistrictAnalytics();
  const nonPlacementReasons = await getNonPlacementDistribution();

  // Generated AI policy insights
  const aiGeneratedInsights = synthesizeGovernmentPolicyInsights({
    totalTrainees: metrics.totalTrainees,
    retention90Days: metrics.retention90Days,
    retention180Days: metrics.retention180Days,
    topNonPlacementReasons: nonPlacementReasons,
    districtBreakdown: districtData,
  });

  // Stored policy recommendations from DB
  const storedPolicies = await prisma.policyRecommendation.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function createPolicyDirectiveAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const district = formData.get("district") as string;
    const sector = formData.get("sector") as string;
    const priority = formData.get("priority") as string;
    const issueSummary = formData.get("issueSummary") as string;
    const recommendedAction = formData.get("recommendedAction") as string;
    const dataEvidence = formData.get("dataEvidence") as string;

    await prisma.policyRecommendation.create({
      data: {
        district: district || null,
        sector: sector || null,
        priority: priority || "HIGH",
        issueSummary,
        recommendedAction,
        dataEvidence,
        status: "OPEN",
      },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "GOVERNMENT_ADMIN",
      action: "CREATED_POLICY_DIRECTIVE",
      targetEntity: "PolicyRecommendation",
      metadata: { district, priority, issueSummary },
    });

    revalidatePath("/admin/reports");
    revalidatePath("/admin");
  }

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Policy Interventions & Report Generation
          </h1>
          <p className="text-xs text-muted">
            Synthesized AI policy recommendations, District Skill Committee directives, and exportable audit reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/reports/export?format=csv"
            download="careerloop_outcome_report.csv"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Dataset</span>
          </a>
        </div>
      </div>

      {/* AI-Synthesized Actionable Insights Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-800" />
          <h3 className="font-display font-bold text-lg text-charcoal-800">
            Real-Time AI Policy Directives & Evidence Citations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiGeneratedInsights.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      item.priority === "HIGH"
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {item.priority} PRIORITY
                  </span>
                  {item.district && (
                    <span className="text-muted font-medium text-[11px]">
                      District: {item.district}
                    </span>
                  )}
                </div>

                <h4 className="font-display font-bold text-sm text-charcoal-800">
                  {item.issueSummary}
                </h4>

                <p className="text-charcoal-700 leading-relaxed bg-sage-50/50 p-3 rounded-xl border border-sage-200">
                  <strong>Recommended Action:</strong> {item.recommendedAction}
                </p>
              </div>

              <p className="text-[10px] text-muted pt-2 border-t border-border/50">
                <strong>Empirical Evidence:</strong> {item.dataEvidence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stored Policy Directives and Manual Directive Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Policy Directives Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Departmental Directives Roster ({storedPolicies.length})
            </h3>
          </div>

          {storedPolicies.length === 0 ? (
            <p className="text-xs text-muted py-6 text-center">
              No manual directives recorded. Use the form to record official administrative interventions.
            </p>
          ) : (
            <div className="space-y-3">
              {storedPolicies.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-sage-50/50 border border-sage-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal-800">{p.issueSummary}</span>
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-muted">{p.recommendedAction}</p>
                  <p className="text-[10px] text-muted font-mono">{formatDate(p.createdAt)} · {p.district || "All Districts"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Manual Policy Directive Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Plus className="w-4 h-4 text-emerald-700" />
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Issue Policy Directive
            </h3>
          </div>

          <form action={createPolicyDirectiveAction} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Target District (Optional)</label>
              <input
                type="text"
                name="district"
                placeholder="e.g. Varanasi, Pune, Jaipur"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Sector Domain</label>
              <input
                type="text"
                name="sector"
                placeholder="e.g. Manufacturing, IT, Green Energy"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Priority Level</label>
              <select name="priority" defaultValue="HIGH" className="w-full px-3 py-2 rounded-xl border border-border bg-white">
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Issue / Friction Summary</label>
              <input
                type="text"
                name="issueSummary"
                required
                placeholder="e.g. Post-placement 90-day attrition in CNC domain"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Mandated Action</label>
              <textarea
                name="recommendedAction"
                rows={2}
                required
                placeholder="e.g. Mandate 4-axis simulator lab upgrades..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Data Evidence Citation</label>
              <textarea
                name="dataEvidence"
                rows={2}
                required
                placeholder="e.g. 28% non-placement rate in Month 3 check-ins..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
            >
              Publish Policy Directive
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
