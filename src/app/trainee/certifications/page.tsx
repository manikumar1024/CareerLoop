import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { Award, ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle, Info } from "lucide-react";

export const revalidate = 0;

const VERIFICATION_COLORS: Record<string, string> = {
  UPLOADED: "bg-amber-50 text-amber-900 border-amber-200",
  PENDING_VERIFICATION: "bg-blue-50 text-blue-900 border-blue-200",
  PROVIDER_VERIFIED: "bg-emerald-50 text-emerald-900 border-emerald-200",
  VERIFIED: "bg-emerald-50 text-emerald-900 border-emerald-200",
  REJECTED: "bg-red-50 text-red-900 border-red-200",
  EXPIRED: "bg-gray-50 text-gray-700 border-gray-200",
};

const VERIFICATION_ICONS: Record<string, React.ElementType> = {
  UPLOADED: Clock,
  PENDING_VERIFICATION: Clock,
  PROVIDER_VERIFIED: ShieldCheck,
  VERIFIED: CheckCircle2,
  REJECTED: XCircle,
  EXPIRED: AlertCircle,
};

const VERIFICATION_DESCRIPTIONS: Record<string, string> = {
  UPLOADED: "Certificate uploaded but not yet verified by the issuing authority.",
  PENDING_VERIFICATION: "Verification request submitted. Awaiting response from issuing authority.",
  PROVIDER_VERIFIED: "Verified by the training provider. Awaiting platform-level verification.",
  VERIFIED: "Fully verified by CareerLoop and the issuing authority.",
  REJECTED: "Verification failed or certificate found invalid.",
  EXPIRED: "Certificate has expired.",
};

export default async function CertificationWalletPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      certifications: {
        include: { program: true },
        orderBy: { issueDate: "desc" },
      },
    },
  });

  if (!trainee) return null;

  const verified = trainee.certifications.filter(
    c => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED"
  );
  const pending = trainee.certifications.filter(
    c => c.verificationStatus === "UPLOADED" || c.verificationStatus === "PENDING_VERIFICATION"
  );
  const rejected = trainee.certifications.filter(c => c.verificationStatus === "REJECTED");

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>Credential Wallet</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Certification Wallet
        </h1>
        <p className="text-xs text-muted">
          Your digital credential portfolio. Verification status reflects the current state of each certificate — newly uploaded certificates are never automatically verified.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-border shadow-xs text-center">
          <p className="font-display font-bold text-2xl text-emerald-700">{verified.length}</p>
          <p className="text-[11px] text-muted">Verified</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border shadow-xs text-center">
          <p className="font-display font-bold text-2xl text-amber-700">{pending.length}</p>
          <p className="text-[11px] text-muted">Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border shadow-xs text-center">
          <p className="font-display font-bold text-2xl text-charcoal-800">{trainee.certifications.length}</p>
          <p className="text-[11px] text-muted">Total</p>
        </div>
      </div>

      {/* Verification Status Explanation */}
      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900">
          <p className="font-semibold mb-1">How Verification Works</p>
          <p className="text-[11px] leading-relaxed">
            Certificates go through a multi-step verification process: <strong>UPLOADED</strong> → <strong>PENDING_VERIFICATION</strong> → <strong>PROVIDER_VERIFIED</strong> → <strong>VERIFIED</strong>.
            Each step requires explicit action by the responsible party. A certificate is never automatically marked as verified.
          </p>
        </div>
      </div>

      {/* Certificates List */}
      {trainee.certifications.length === 0 ? (
        <EmptyState
          title="No Certifications Yet"
          description="Your certifications from training programs will appear here once recorded."
          actionText="View Training"
          actionHref="/trainee/training"
        />
      ) : (
        <div className="space-y-4">
          {trainee.certifications.map(cert => {
            const StatusIcon = VERIFICATION_ICONS[cert.verificationStatus] || Clock;
            const colorClass = VERIFICATION_COLORS[cert.verificationStatus] || VERIFICATION_COLORS.UPLOADED;
            const description = VERIFICATION_DESCRIPTIONS[cert.verificationStatus] || "";

            return (
              <div
                key={cert.id}
                className="bg-white rounded-3xl p-6 border border-border shadow-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-charcoal-800">
                          {cert.program.title}
                        </h3>
                        <p className="text-xs text-muted">{cert.issuingAuthority}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs pt-2">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted">Certificate Number</p>
                        <p className="font-mono font-semibold text-charcoal-800">{cert.certificateNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted">Issue Date</p>
                        <p className="font-semibold text-charcoal-800">{formatDate(cert.issueDate)}</p>
                      </div>
                      {cert.expiryDate && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted">Expiry Date</p>
                          <p className="font-semibold text-charcoal-800">{formatDate(cert.expiryDate)}</p>
                        </div>
                      )}
                      {cert.verifiedAt && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted">Verified On</p>
                          <p className="font-semibold text-charcoal-800">{formatDate(cert.verifiedAt)}</p>
                        </div>
                      )}
                    </div>

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline"
                      >
                        View Credential →
                      </a>
                    )}
                  </div>

                  {/* Verification Status Badge */}
                  <div className="shrink-0 space-y-2 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${colorClass}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{cert.verificationStatus.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-[10px] text-muted max-w-[180px] text-right leading-relaxed">
                      {description}
                    </p>
                    {cert.verificationNotes && (
                      <p className="text-[10px] text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200 max-w-[180px]">
                        Note: {cert.verificationNotes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
