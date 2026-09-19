import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Award,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";

export const revalidate = 0;

export default async function TraineeCertificatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const certificates = await prisma.certificate.findMany({
    where: { studentId: user.id },
    include: {
      reviewer: {
        select: { name: true, email: true },
      },
    },
    orderBy: { uploadedAt: "desc" },
  });

  const verifiedCount = certificates.filter(
    (c) => c.status === "APPROVED" || c.status === "VERIFIED"
  ).length;
  const pendingCount = certificates.filter((c) => c.status === "PENDING").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" /> Credential Portfolio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            My Verified Certifications
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Upload and manage your external credentials, course diplomas, and verified industry badges.
          </p>
        </div>

        <Link
          href="/trainee/certificates/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold text-sm shadow-md hover:shadow-amber-900/20 hover:scale-[1.02] transition"
        >
          <Upload className="w-4 h-4" /> Upload Certificate
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-400 font-medium">Total Uploaded</p>
          <p className="text-2xl font-bold text-stone-800 mt-1">{certificates.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{verifiedCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </p>
          <p className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-400 font-medium">Profile Trust Tier</p>
          <p className="text-2xl font-bold text-stone-800 mt-1">
            {verifiedCount > 0 ? "Tier 1 Verified" : "Unverified"}
          </p>
        </div>
      </div>

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <Award className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold font-serif text-stone-900">
              No certifications uploaded yet
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              Upload certificates from Coursera, AWS, Google, or training programs to stand out to employers with verified badges.
            </p>
          </div>
          <Link
            href="/trainee/certificates/upload"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition"
          >
            <Plus className="w-4 h-4" /> Add First Certificate
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            let statusBadge = (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5" /> Under Review
              </span>
            );

            if (cert.status === "APPROVED" || cert.status === "VERIFIED") {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              );
            } else if (cert.status === "REJECTED") {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                  <XCircle className="w-3.5 h-3.5" /> Rejected
                </span>
              );
            } else if (cert.status === "RESUBMIT") {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Re-upload Needed
                </span>
              );
            }

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    {statusBadge}
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base leading-snug">
                      {cert.certificateName}
                    </h3>
                    <p className="text-xs font-medium text-stone-500 flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-stone-400" />
                      {cert.issuingOrganization}
                    </p>
                  </div>

                  {cert.description && (
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {cert.description}
                    </p>
                  )}

                  {cert.reviewerComments && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
                      <span className="font-bold block">Provider Feedback:</span>
                      <p>{cert.reviewerComments}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {cert.issueDate
                      ? new Date(cert.issueDate).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })
                      : "No date"}
                  </span>

                  <div className="flex items-center gap-2">
                    {cert.fileUrl && (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 transition"
                      >
                        <FileText className="w-3.5 h-3.5" /> Document
                      </a>
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
