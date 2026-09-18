"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  ChevronLeft,
  XCircle,
  FileText,
  ExternalLink,
  Building2,
  User,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function ProviderCertificateInspectPage() {
  const params = useParams();
  const router = useRouter();
  const certificateId = params.id as string;

  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchCert();
  }, [certificateId]);

  const fetchCert = async () => {
    try {
      const res = await fetch(`/api/certificates/${certificateId}`);
      const data = await res.json();
      if (data.success) {
        setCert(data.data);
      }
    } catch (err) {
      console.error("Error fetching certificate:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/provider/certificates/${certificateId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/provider/certificates");
      }
    } catch (err) {
      console.error("Error approving certificate:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/provider/certificates/${certificateId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/provider/certificates");
      }
    } catch (err) {
      console.error("Error rejecting certificate:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestResubmit = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/provider/certificates/${certificateId}/request-resubmission`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: rejectionReason || "Document illegible or missing metadata.",
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        router.push("/provider/certificates");
      }
    } catch (err) {
      console.error("Error requesting resubmission:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-800" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold font-serif text-stone-900">Certificate not found</h2>
        <Link
          href="/provider/certificates"
          className="text-amber-800 font-semibold hover:underline text-sm"
        >
          Return to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/provider/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Queue
        </Link>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            cert.status === "APPROVED"
              ? "bg-emerald-100 text-emerald-800"
              : cert.status === "REJECTED"
              ? "bg-red-100 text-red-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {cert.status}
        </span>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {cert.certificateName}
          </h1>
          <p className="text-stone-500 text-sm mt-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-stone-400" /> {cert.issuingOrganization}
          </p>
        </div>

        {/* Trainee Info Box */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Submitted by Trainee</p>
            <p className="font-semibold text-stone-900 text-sm">
              {cert.student?.name || "Trainee"} ({cert.student?.email})
            </p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-stone-200 space-y-1">
            <span className="text-stone-400 font-medium">Issue Date</span>
            <p className="font-semibold text-stone-800 text-sm">
              {cert.issueDate
                ? new Date(cert.issueDate).toLocaleDateString()
                : "Not provided"}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 space-y-1">
            <span className="text-stone-400 font-medium">Credential ID</span>
            <p className="font-semibold text-stone-800 text-sm">
              {cert.certificateExternalId || "N/A"}
            </p>
          </div>

          {cert.description && (
            <div className="p-4 rounded-xl border border-stone-200 space-y-1 sm:col-span-2">
              <span className="text-stone-400 font-medium">Description</span>
              <p className="font-semibold text-stone-800 text-sm">{cert.description}</p>
            </div>
          )}
        </div>

        {/* Document Preview */}
        {cert.fileUrl && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-800" /> Attached Document
            </h3>
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-100 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <FileText className="w-12 h-12 text-stone-400" />
              <p className="text-xs font-semibold text-stone-700">
                {cert.fileName || "Certificate File"}
              </p>
              <a
                href={cert.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition"
              >
                Open Full Document <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        {cert.status === "PENDING" && (
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={() => setRejectModalOpen(true)}
              disabled={actionLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition"
            >
              <XCircle className="w-4 h-4" /> Reject or Request Fix
            </button>

            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-md transition"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Approve & Issue Verified Badge
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold font-serif text-stone-900">
              Reject or Request Resubmission
            </h3>
            <p className="text-xs text-stone-500">
              Provide specific feedback to help the trainee understand why their certificate cannot be authenticated.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. The document is blurry / Credential ID does not match the public registry."
              className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestResubmit}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-100 text-orange-800 hover:bg-orange-200"
              >
                Request Re-upload
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-700 text-white hover:bg-red-800"
              >
                Reject Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
