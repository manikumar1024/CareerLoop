"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  ChevronLeft,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Calendar,
  Globe,
  Tag,
} from "lucide-react";

export default function UploadCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    issuingOrg: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    skills: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size cannot exceed 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append("file", selectedFile);

      const res = await fetch("/api/upload/certificate", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (data.success && data.fileUrl) {
        setFileUrl(data.fileUrl);
      } else {
        setError(data.error || "Failed to upload document");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.issuingOrg) {
      setError("Please fill in the Certificate Title and Issuing Organization");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fileUrl,
          fileName: file?.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/trainee/certificates");
      } else {
        setError(data.error || "Failed to submit certificate");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/trainee/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Certifications
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Submit Certificate for Verification
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Fill in the credential details and upload a PDF or image copy. A verified training provider will review and authenticate it.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Certificate / Course Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Certified Solutions Architect, Google UX Design Professional Certificate"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-3.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
            />
          </div>

          {/* Issuing Org */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Issuing Organization / Institute *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amazon Web Services, Coursera, NSDC, IIT Madras"
              value={formData.issuingOrg}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, issuingOrg: e.target.value }))
              }
              className="w-full p-3.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
            />
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, issueDate: e.target.value }))
                }
                className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
                }
                className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              />
            </div>
          </div>

          {/* Credential ID & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Credential ID / License Number
              </label>
              <input
                type="text"
                placeholder="e.g. AWS-892147391"
                value={formData.credentialId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    credentialId: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Verification / Badge URL
              </label>
              <input
                type="url"
                placeholder="https://credly.com/badges/..."
                value={formData.credentialUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    credentialUrl: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              />
            </div>
          </div>

          {/* Associated Skills */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Associated Skills (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Cloud Computing, Docker, Kubernetes, Python"
              value={formData.skills}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, skills: e.target.value }))
              }
              className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
            />
          </div>

          {/* File Upload Zone */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Certificate Document (PDF / JPG / PNG up to 10MB)
            </label>
            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-amber-700 transition cursor-pointer relative bg-stone-50/50">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100/60 text-amber-800 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                {file ? (
                  <p className="text-xs font-semibold text-stone-800">
                    {file.name} ({(file.size / 1024).toFixed(0)} KB)
                  </p>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-stone-700">
                      Click to upload or drag & drop certificate
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      PDF, PNG, JPG (max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isUploading && (
              <p className="text-xs text-amber-700 flex items-center gap-1.5 mt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading file...
              </p>
            )}
            {fileUrl && !isUploading && (
              <p className="text-xs text-emerald-700 flex items-center gap-1.5 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Document uploaded successfully
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold text-sm shadow-md hover:shadow-amber-900/20 disabled:opacity-40 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit for Verification <Award className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
