import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ArrowRight,
} from "lucide-react";

export const revalidate = 0;

export default async function ProviderCertificatesQueuePage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TRAINING_PROVIDER" && user.role !== "GOVERNMENT_ADMIN")) {
    redirect("/signin");
  }

  const [pendingCerts, allCerts] = await Promise.all([
    prisma.certificate.findMany({
      where: { status: "PENDING" },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.certificate.findMany({
      include: {
        student: { select: { id: true, name: true, email: true } },
        reviewer: { select: { name: true } },
      },
      orderBy: { uploadedAt: "desc" },
      take: 50,
    }),
  ]);

  const verifiedCount = allCerts.filter((c) => c.status === "APPROVED" || c.status === "VERIFIED").length;
  const rejectedCount = allCerts.filter((c) => c.status === "REJECTED").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" /> Provider Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Certificate Verification Queue
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Review, validate, and authenticate submitted certificates from trainees across programs.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </p>
          <p className="text-2xl font-bold text-amber-800 mt-1">{pendingCerts.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved Badges
          </p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{verifiedCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </p>
          <p className="text-2xl font-bold text-red-800 mt-1">{rejectedCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-400 font-medium">Total Processed</p>
          <p className="text-2xl font-bold text-stone-800 mt-1">{allCerts.length}</p>
        </div>
      </div>

      {/* Pending Reviews Section */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" /> Pending Submissions ({pendingCerts.length})
          </h2>
          <span className="text-xs text-stone-400 font-medium">Action Required</span>
        </div>

        {pendingCerts.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-stone-800 text-base">Verification Queue Clear</h3>
            <p className="text-xs text-stone-400 mt-1">All trainee certificates have been reviewed.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {pendingCerts.map((cert) => (
              <div
                key={cert.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition -mx-6 px-6"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{cert.certificateName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Issuing Org: <span className="font-medium text-stone-700">{cert.issuingOrganization}</span> • Trainee: <span className="font-medium text-stone-700">{cert.student.name || cert.student.email}</span>
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Submitted on {new Date(cert.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 p-2 rounded-lg bg-stone-100 transition"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Doc
                    </a>
                  )}
                  <Link
                    href={`/provider/certificates/${cert.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white shadow-sm transition"
                  >
                    Review & Verify <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Recent Submissions Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="text-lg font-bold font-serif text-stone-900 border-b border-stone-100 pb-4">
          All Verification History ({allCerts.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Trainee</th>
                <th className="py-3 px-4">Certificate</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {allCerts.map((cert) => {
                let badge = (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    PENDING
                  </span>
                );
                if (cert.status === "APPROVED") {
                  badge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      APPROVED
                    </span>
                  );
                } else if (cert.status === "REJECTED") {
                  badge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                      REJECTED
                    </span>
                  );
                }

                return (
                  <tr key={cert.id} className="hover:bg-stone-50/50 transition">
                    <td className="py-3.5 px-4 font-medium text-stone-800">
                      {cert.student.name || cert.student.email}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      {cert.certificateName}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {cert.issuingOrganization}
                    </td>
                    <td className="py-3.5 px-4">{badge}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/provider/certificates/${cert.id}`}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
