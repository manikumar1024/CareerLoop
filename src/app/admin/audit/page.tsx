import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, History, User, Database, Lock } from "lucide-react";

export const revalidate = 0;

export default async function AdminAuditPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const consentRecords = await prisma.consentRecord.findMany({
    include: { user: true },
    orderBy: { grantedAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          System Audit Logs & Consent Governance
        </h1>
        <p className="text-xs text-muted">
          Immutable event trails of administrative decisions, role authorizations, verification transitions, and data privacy consent.
        </p>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" />
            <h3 className="font-display font-bold text-base text-charcoal-800">
              System Activity Trail (Recent 50 Events)
            </h3>
          </div>
          <span className="text-xs text-muted font-mono">{logs.length} logged actions</span>
        </div>

        {logs.length === 0 ? (
          <EmptyState
            title="No Audit Records"
            description="System activity logs will appear here as users perform actions."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted uppercase font-bold text-[10px] tracking-wider">
                  <th className="pb-3 pr-4">Timestamp</th>
                  <th className="pb-3 px-4">Action</th>
                  <th className="pb-3 px-4">Actor</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Target Entity</th>
                  <th className="pb-3 pl-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-sage-50/50 transition">
                    <td className="py-3 pr-4 text-muted">
                      {formatDate(log.createdAt)} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-charcoal-800">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-sans text-charcoal-700">
                      {log.user?.email || "System"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-sage-50 text-emerald-800 border border-border">
                        {log.role || "SYSTEM"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {log.targetEntity} {log.targetEntityId ? `(${log.targetEntityId.slice(0, 8)}...)` : ""}
                    </td>
                    <td className="py-3 pl-4 text-muted">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Consent Records */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border/50">
          <ShieldCheck className="w-5 h-5 text-emerald-800" />
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Trainee Data Privacy Consent Records ({consentRecords.length})
          </h3>
        </div>

        {consentRecords.length === 0 ? (
          <p className="text-xs text-muted py-4">No consent updates logged yet.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {consentRecords.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-charcoal-800">{c.user.email}</p>
                  <p className="text-[11px] text-muted">{c.purpose}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Granted {formatDate(c.grantedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
