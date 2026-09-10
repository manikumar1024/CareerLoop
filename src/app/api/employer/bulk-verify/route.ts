// src/app/api/employer/bulk-verify/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

interface BulkVerificationItem {
  recordId?: string;
  traineeId?: string;
  action: "APPROVE" | "REJECT";
  notes?: string;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized: Employer access required." }, { status: 401 });
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!employer) {
      return NextResponse.json({ error: "Employer profile not found." }, { status: 404 });
    }

    const body = await req.json();
    const items: BulkVerificationItem[] = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "No verification items provided in payload." }, { status: 400 });
    }

    let processedCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    const errors: Array<{ identifier: string; reason: string }> = [];

    for (const item of items) {
      try {
        let record = null;
        if (item.recordId) {
          record = await prisma.employmentRecord.findUnique({
            where: { id: item.recordId },
            include: { trainee: true },
          });
        } else if (item.traineeId) {
          record = await prisma.employmentRecord.findFirst({
            where: {
              trainee: { traineeId: item.traineeId.trim().toUpperCase() },
              OR: [
                { employerId: employer.id },
                { companyName: { contains: employer.companyName } },
              ],
            },
            include: { trainee: true },
          });
        }

        if (!record) {
          errors.push({
            identifier: item.recordId || item.traineeId || "unknown",
            reason: "Record not found under your organization.",
          });
          continue;
        }

        const isApprove = item.action === "APPROVE";
        await prisma.employmentRecord.update({
          where: { id: record.id },
          data: {
            employerId: employer.id,
            verificationStatus: isApprove ? "EMPLOYER_VERIFIED" : "REJECTED",
            verificationNotes: item.notes || (isApprove ? "Batch verified by HR via bulk portal." : "Batch rejected."),
            verifiedAt: new Date(),
          },
        });

        await logAuditAction({
          userId: user.id,
          role: "EMPLOYER",
          action: isApprove ? "BULK_APPROVED_VERIFICATION" : "BULK_REJECTED_VERIFICATION",
          targetEntity: "EmploymentRecord",
          targetEntityId: record.id,
          metadata: { batchSize: items.length },
        });

        processedCount++;
        if (isApprove) approvedCount++;
        else rejectedCount++;
      } catch (err: any) {
        errors.push({
          identifier: item.recordId || item.traineeId || "error",
          reason: err.message || "Failed to process item.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount,
      approvedCount,
      rejectedCount,
      failedCount: errors.length,
      errors,
    });
  } catch (error: any) {
    console.error("Bulk verification error:", error);
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 });
  }
}
