import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { ShieldCheck, Lock, Eye, CheckCircle2, History, Info } from "lucide-react";
import { logAuditAction } from "@/lib/audit";

export const revalidate = 0;

export default async function TraineeSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      consentRecords: true,
      auditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!dbUser) return null;

  async function updateConsentAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const consentGiven = formData.get("consentGiven") === "true";

    await prisma.user.update({
      where: { id: userSession.id },
      data: {
        consentGiven,
        consentTimestamp: new Date(),
      },
    });

    await prisma.consentRecord.create({
      data: {
        userId: userSession.id,
        purpose: "Longitudinal Outcome Tracking & Employer Verification",
        dataFieldsGranted: "Employment status, Salary bracket, Skill ratings, Milestone surveys",
        grantedAt: new Date(),
      },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "TRAINEE",
      action: "UPDATED_CONSENT_SETTINGS",
      targetEntity: "User",
      targetEntityId: userSession.id,
      metadata: { consentGiven },
    });

    revalidatePath("/trainee/settings");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Privacy, Consent & Data Settings
        </h1>
        <p className="text-xs text-muted">
          Control your data visibility preferences, review active consent authorizations, and inspect your security audit log.
        </p>
      </div>

      {/* Consent Management Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Longitudinal Tracking Consent
              </h3>
              <p className="text-xs text-muted">
                Last acknowledged on {formatDate(dbUser.consentTimestamp)}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              dbUser.consentGiven
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {dbUser.consentGiven ? "Active Consent" : "Consent Revoked"}
          </span>
        </div>

        <form action={updateConsentAction} className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-2">
            <p className="font-semibold text-charcoal-800">Data Sharing Permissions:</p>
            <ul className="space-y-1.5 text-muted list-disc pl-5">
              <li>Allow partner employers to view and verify your employment submissions.</li>
              <li>Allow training providers to track aggregated cohort retention metrics (anonymized).</li>
              <li>Allow District Skill Committees to compute regional employment outcome indicators.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="font-semibold text-charcoal-700">
              Grant Longitudinal Tracking Authorization
            </label>
            <select
              name="consentGiven"
              defaultValue={dbUser.consentGiven ? "true" : "false"}
              className="px-3 py-1.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="true">Authorized (Recommended)</option>
              <option value="false">Revoke Consent</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
            >
              Save Consent Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border/50">
          <History className="w-4 h-4 text-emerald-800" />
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Security & Audit Activity Trail
          </h3>
        </div>

        {dbUser.auditLogs.length === 0 ? (
          <p className="text-xs text-muted py-4">No logged activity yet.</p>
        ) : (
          <div className="space-y-2.5 text-xs">
            {dbUser.auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-sage-50/50 border border-sage-200/70 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-charcoal-800 font-mono">
                    {log.action}
                  </span>
                  <span className="text-muted text-[11px] ml-2">
                    Target: {log.targetEntity}
                  </span>
                </div>
                <span className="text-muted text-[10px] font-mono">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
