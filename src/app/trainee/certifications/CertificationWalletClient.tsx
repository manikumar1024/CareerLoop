"use client";

import React, { useState } from "react";
import {
  Award,
  Upload,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  Trash2,
  Plus,
  X,
  Building2,
  Sparkles,
  Info,
  Calendar,
  Hash,
  Send
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProviderOption {
  id: string;
  institutionName: string;
  accreditationNumber: string | null;
  programs: {
    id: string;
    title: string;
    code: string;
  }[];
}

interface CertificationItem {
  id: string;
  certificateNumber: string;
  credentialUrl: string | null;
  issueDate: string | Date;
  expiryDate: string | Date | null;
  issuingAuthority: string;
  verificationStatus: string;
  verificationNotes: string | null;
  verifiedAt: string | Date | null;
  program: {
    id: string;
    title: string;
    code: string;
    provider?: {
      institutionName: string;
      accreditationNumber: string | null;
    } | null;
  };
}

interface CertificationWalletClientProps {
  initialCertifications: CertificationItem[];
  providers: ProviderOption[];
}

const VERIFICATION_BADGES: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  UPLOADED: {
    label: "Uploaded — Unverified",
    class: "bg-amber-50 text-amber-900 border-amber-200",
    icon: Clock,
  },
  PENDING_VERIFICATION: {
    label: "Pending Provider Verification",
    class: "bg-blue-50 text-blue-900 border-blue-200",
    icon: Clock,
  },
  PROVIDER_VERIFIED: {
    label: "Provider Verified",
    class: "bg-emerald-50 text-emerald-900 border-emerald-200",
    icon: ShieldCheck,
  },
  VERIFIED: {
    label: "Verified Credential",
    class: "bg-emerald-50 text-emerald-900 border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Verification Rejected",
    class: "bg-red-50 text-red-900 border-red-200",
    icon: XCircle,
  },
  EXPIRED: {
    label: "Expired",
    class: "bg-sage-100 text-charcoal-700 border-border",
    icon: AlertCircle,
  },
};

export default function CertificationWalletClient({
  initialCertifications,
  providers,
}: CertificationWalletClientProps) {
  const [certifications, setCertifications] = useState<CertificationItem[]>(initialCertifications);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState(providers[0]?.id || "EXTERNAL");
  const [issuingAuthority, setIssuingAuthority] = useState("National Skill Development Corporation (NSDC)");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [submitForVerification, setSubmitForVerification] = useState(true);

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateCertNumber = () => {
    const random = Math.floor(100000 + Math.random() * 900000);
    setCertificateNumber(`CERT-2026-${random}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      // Pre-fill title if empty
      if (!title) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Please enter the Certificate or Program Title.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("title", title.trim());
      formData.append("providerId", selectedProviderId);
      formData.append("issuingAuthority", issuingAuthority.trim());
      formData.append("certificateNumber", certificateNumber.trim() || `CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`);
      formData.append("issueDate", issueDate);
      if (expiryDate) formData.append("expiryDate", expiryDate);
      formData.append("submitForVerification", submitForVerification ? "true" : "false");

      const res = await fetch("/api/trainee/certifications", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload certificate");
      }

      // Add to local state immediately
      setCertifications([data.certification, ...certifications]);
      setShowUploadModal(false);

      // Reset form
      setFile(null);
      setTitle("");
      setCertificateNumber("");
      setExpiryDate("");
      showToast("Certificate uploaded and added to your wallet!");
    } catch (err: any) {
      setFormError(err.message || "An error occurred during upload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForVerification = async (certId: string) => {
    try {
      setActionLoadingId(certId);
      const res = await fetch(`/api/trainee/certifications/${certId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SUBMIT_FOR_VERIFICATION" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit for verification");

      setCertifications(certifications.map(c => (c.id === certId ? data.certification : c)));
      showToast("Certificate submitted for training provider verification!");
    } catch (err: any) {
      showToast(err.message || "Error submitting for verification.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (certId: string) => {
    if (!confirm("Are you sure you want to delete this certificate from your wallet?")) {
      return;
    }

    try {
      setActionLoadingId(certId);
      const res = await fetch(`/api/trainee/certifications/${certId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete certificate");
      }

      setCertifications(certifications.filter(c => c.id !== certId));
      showToast("Certificate removed from wallet.");
    } catch (err: any) {
      showToast(err.message || "Error deleting certificate.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const verified = certifications.filter(
    c => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED"
  );
  const pending = certifications.filter(
    c => c.verificationStatus === "UPLOADED" || c.verificationStatus === "PENDING_VERIFICATION"
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900 text-white text-xs px-4 py-3 rounded-2xl shadow-elevated flex items-center gap-2 border border-border/20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-200">
            <Award className="w-3.5 h-3.5" />
            <span>Digital Credential Wallet</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Certification Wallet
          </h1>
          <p className="text-xs text-muted max-w-xl">
            Upload, verify, and showcase your formal credentials. Uploaded certificates are cryptographically linked to your verified student profile.
          </p>
        </div>

        <button
          onClick={() => {
            setShowUploadModal(true);
            setFormError(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold tracking-wide shadow-elevated hover:shadow-glow transition-all shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Certificate</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-border shadow-xs text-center">
          <p className="font-display font-bold text-3xl text-emerald-800">{verified.length}</p>
          <p className="text-xs text-muted font-medium mt-1">Verified Credentials</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-border shadow-xs text-center">
          <p className="font-display font-bold text-3xl text-amber-700">{pending.length}</p>
          <p className="text-xs text-muted font-medium mt-1">Pending Verification</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-border shadow-xs text-center">
          <p className="font-display font-bold text-3xl text-charcoal-800">{certifications.length}</p>
          <p className="text-xs text-muted font-medium mt-1">Total in Wallet</p>
        </div>
      </div>

      {/* How Verification Works Banner */}
      <div className="bg-sage-50 rounded-3xl p-5 border border-border flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-white border border-border flex items-center justify-center text-emerald-800 shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1 text-charcoal-700">
          <p className="font-bold text-charcoal-800">Longitudinal Verification Pipeline</p>
          <p className="text-muted leading-relaxed">
            Certificates progress sequentially: <strong>UPLOADED</strong> → <strong>PENDING_VERIFICATION</strong> → <strong>PROVIDER_VERIFIED</strong> → <strong>VERIFIED</strong>.
            Verified credentials increase your employer visibility and skill match score.
          </p>
        </div>
      </div>

      {/* Certificates List */}
      {certifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-dashed border-border text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center text-emerald-800 mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-display font-bold text-lg text-charcoal-800">
              No Certifications Uploaded Yet
            </h3>
            <p className="text-xs text-muted">
              Add your diplomas, course completions, NSDC certificates, or technical accreditations to build your verified credential wallet.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Certificate</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-charcoal-800">
              Your Certificates ({certifications.length})
            </h2>
            <span className="text-xs text-muted">Sorted by most recently added</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {certifications.map(cert => {
              const badge = VERIFICATION_BADGES[cert.verificationStatus] || VERIFICATION_BADGES.UPLOADED;
              const BadgeIcon = badge.icon;
              const providerName = cert.program.provider?.institutionName || "External / Independent Authority";

              return (
                <div
                  key={cert.id}
                  className="bg-white rounded-3xl p-6 border border-border shadow-card hover:shadow-elevated transition-all space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Title and Provider Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-sage-50 border border-sage-200 text-emerald-800 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-base text-charcoal-800">
                          {cert.program.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span className="inline-flex items-center gap-1 font-medium text-charcoal-700">
                            <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                            <span>{providerName}</span>
                          </span>
                          <span>•</span>
                          <span>Issued by: <strong className="text-charcoal-800">{cert.issuingAuthority}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.class}`}>
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-sage-50/70 rounded-2xl border border-border/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                        Certificate ID
                      </span>
                      <span className="font-mono font-bold text-charcoal-800 break-all">
                        {cert.certificateNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                        Issue Date
                      </span>
                      <span className="font-semibold text-charcoal-800">
                        {formatDate(cert.issueDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                        Expiry Date
                      </span>
                      <span className="font-semibold text-charcoal-800">
                        {cert.expiryDate ? formatDate(cert.expiryDate) : "Lifetime Validity"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                        Verification Note
                      </span>
                      <span className="text-muted truncate block">
                        {cert.verificationNotes || "Standard credential"}
                      </span>
                    </div>
                  </div>

                  {/* Step Pipeline Tracker */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted mb-2">
                      <span className={cert.verificationStatus !== "REJECTED" ? "text-emerald-800" : ""}>
                        1. Document Uploaded
                      </span>
                      <span className={cert.verificationStatus === "PENDING_VERIFICATION" || cert.verificationStatus === "PROVIDER_VERIFIED" || cert.verificationStatus === "VERIFIED" ? "text-emerald-800 font-bold" : ""}>
                        2. Provider Review
                      </span>
                      <span className={cert.verificationStatus === "VERIFIED" ? "text-emerald-800 font-bold" : ""}>
                        3. Fully Verified
                      </span>
                    </div>
                    <div className="w-full bg-sage-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-800 h-full transition-all duration-300"
                        style={{
                          width:
                            cert.verificationStatus === "VERIFIED"
                              ? "100%"
                              : cert.verificationStatus === "PROVIDER_VERIFIED"
                              ? "70%"
                              : cert.verificationStatus === "PENDING_VERIFICATION"
                              ? "40%"
                              : "15%",
                        }}
                      />
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      {cert.credentialUrl ? (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sage-100 hover:bg-sage-200 text-charcoal-800 font-semibold text-xs transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-800" />
                          <span>View Certificate File</span>
                          <ExternalLink className="w-3 h-3 text-muted ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted italic">No attached file</span>
                      )}

                      {cert.verificationStatus === "UPLOADED" && (
                        <button
                          onClick={() => handleSubmitForVerification(cert.id)}
                          disabled={actionLoadingId === cert.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{actionLoadingId === cert.id ? "Submitting..." : "Submit for Verification"}</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(cert.id)}
                      disabled={actionLoadingId === cert.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-red-700 hover:bg-red-50 text-xs font-semibold transition disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Certificate Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-border shadow-elevated space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center text-emerald-800">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-lg text-charcoal-800">
                    Upload Certificate
                  </h2>
                  <p className="text-xs text-muted">Add credential to your verified wallet</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-full bg-sage-50 hover:bg-sage-100 flex items-center justify-center text-charcoal-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1.5 uppercase tracking-wider">
                  Certificate Document (PDF, PNG, JPG, WEBP)
                </label>
                <div className="relative border-2 border-dashed border-sage-200 hover:border-emerald-700 bg-sage-50/50 rounded-2xl p-6 text-center transition cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center text-emerald-800 mx-auto shadow-xs group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    {file ? (
                      <div>
                        <p className="font-bold text-xs text-charcoal-800">{file.name}</p>
                        <p className="text-[11px] text-muted">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-xs text-charcoal-800">
                          Drop certificate file here, or <span className="text-emerald-800 underline">browse</span>
                        </p>
                        <p className="text-[11px] text-muted">Supports PDF, PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Certificate Title */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  Certificate / Program Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Full Stack Web Development Certificate"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-xs text-charcoal-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              {/* Training Provider Dropdown */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  Associated Training Provider
                </label>
                <select
                  value={selectedProviderId}
                  onChange={e => setSelectedProviderId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-xs text-charcoal-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                >
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.institutionName} ({p.accreditationNumber})
                    </option>
                  ))}
                  <option value="EXTERNAL">Other / External Issuing Organization</option>
                </select>
              </div>

              {/* Issuing Authority & Certificate Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={issuingAuthority}
                    onChange={e => setIssuingAuthority(e.target.value)}
                    placeholder="e.g. NSDC, NASSCOM, Microsoft"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-xs text-charcoal-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-charcoal-800">
                      Certificate ID Number
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCertNumber}
                      className="text-[10px] text-emerald-800 hover:underline font-semibold"
                    >
                      Generate ID
                    </button>
                  </div>
                  <input
                    type="text"
                    value={certificateNumber}
                    onChange={e => setCertificateNumber(e.target.value)}
                    placeholder="e.g. CERT-2026-849201"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white font-mono text-xs text-charcoal-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-xs text-charcoal-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-xs text-charcoal-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
              </div>

              {/* Verification Submission Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-sage-50 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={submitForVerification}
                  onChange={e => setSubmitForVerification(e.target.checked)}
                  className="mt-0.5 rounded border-border text-emerald-800 focus:ring-emerald-700"
                />
                <div className="text-xs text-charcoal-800">
                  <span className="font-bold">Submit for Training Provider Verification immediately</span>
                  <p className="text-[11px] text-muted">
                    Your certificate will enter the institutional verification queue for official sign-off.
                  </p>
                </div>
              </label>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full border border-border hover:bg-sage-50 text-charcoal-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-elevated transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Save Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
