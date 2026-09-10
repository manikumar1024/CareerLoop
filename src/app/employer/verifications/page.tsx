import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { CheckSquare, ShieldCheck, CheckCircle2, XCircle, Star, Building2, User } from "lucide-react";
import { logAuditAction } from "@/lib/audit";

export const revalidate = 0;

export default async function EmployerVerificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer) return null;

  const employments = await prisma.employmentRecord.findMany({
    where: {
      OR: [
        { employerId: employer.id },
        { companyName: { contains: employer.companyName } },
      ],
    },
    include: {
      trainee: { include: { user: true, skills: { include: { skill: true } }, certifications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  async function handleVerification(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const recordId = formData.get("recordId") as string;
    const action = formData.get("action") as string;
    const notes = formData.get("notes") as string;

    const empProfile = await prisma.employerProfile.findUnique({ where: { userId: userSession.id } });
    if (!empProfile) return;

    await prisma.employmentRecord.update({
      where: { id: recordId },
      data: {
        employerId: empProfile.id,
        verificationStatus: action === "APPROVE" ? "EMPLOYER_VERIFIED" : "REJECTED",
        verificationNotes: notes || (action === "APPROVE" ? "Verified by HR." : "Rejected."),
        verifiedAt: new Date(),
      },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "EMPLOYER",
      action: action === "APPROVE" ? "APPROVED_VERIFICATION" : "REJECTED_VERIFICATION",
      targetEntity: "EmploymentRecord",
      targetEntityId: recordId,
    });

    revalidatePath("/employer/verifications");
    revalidatePath("/employer");
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Employment Verification Workflow
        </h1>
        <p className="text-xs text-muted">
          Review and audit self-reported trainee placement claims. Confirmed records transition into the national outcome intelligence database.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            All Submission Records ({employments.length})
          </h3>
          <span className="text-xs text-muted">
            {employments.filter((e) => e.verificationStatus === "EMPLOYER_VERIFIED").length} Verified · {employments.filter((e) => e.verificationStatus !== "EMPLOYER_VERIFIED").length} Pending
          </span>
        </div>

        {employments.length === 0 ? (
          <EmptyState
            title="No Verification Records"
            description="No trainees have reported employment under your company name yet."
          />
        ) : (
          <div className="space-y-4">
            {employments.map((record) => (
              <div
                key={record.id}
                className="p-5 rounded-2xl bg-sage-50/50 border border-sage-200 flex flex-col lg:flex-row justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-charcoal-800">
                      {record.trainee.user.name}
                    </h4>
                    <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {record.trainee.traineeId}
                    </span>
                    <StatusBadge status={record.verificationStatus} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-charcoal-700">
                    <p>Reported Role: <strong>{record.jobTitle}</strong></p>
                    <p>Reported Salary: <strong>{formatCurrency(record.monthlySalary)} / mo</strong></p>
                    <p>Joining Date: <strong>{formatDate(record.startDate)}</strong></p>
                    <p>Type: <strong>{record.employmentType.replace(/_/g, " ")}</strong></p>
                    <p>Skill Relevance Rating: <strong>{record.skillRelevanceScore} / 5</strong></p>
                    <p>Certifications: <strong>{record.trainee.certifications.length} verified credential(s)</strong></p>
                  </div>

                  {record.verificationNotes && (
                    <p className="text-[11px] text-muted italic bg-white p-2 rounded-lg border border-border">
                      Notes: {record.verificationNotes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-border/50 pt-3 lg:pt-0 lg:pl-4">
                  {record.verificationStatus !== "EMPLOYER_VERIFIED" ? (
                    <>
                      <form action={handleVerification}>
                        <input type="hidden" name="recordId" value={record.id} />
                        <input type="hidden" name="action" value="APPROVE" />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs tracking-wide transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Verify</span>
                        </button>
                      </form>

                      <form action={handleVerification}>
                        <input type="hidden" name="recordId" value={record.id} />
                        <input type="hidden" name="action" value="REJECT" />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 font-semibold text-xs border border-red-200 transition flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Record</span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Verified on {formatDate(record.verifiedAt)}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
