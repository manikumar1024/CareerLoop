import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "TRAINING_PROVIDER" && user.role !== "GOVERNMENT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized: Training Provider or Admin access required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { reason, comments } = body;
    const finalComments = reason || comments;

    if (!finalComments || finalComments.trim().length === 0) {
      return NextResponse.json(
        { error: "A rejection reason must be provided to help the student understand why authentication failed." },
        { status: 400 }
      );
    }

    const certificate = await prisma.certificate.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        reviewerId: user.id,
        reviewedAt: new Date(),
        reviewerComments: finalComments.trim(),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (certificate.certificateExternalId) {
      await prisma.certification.updateMany({
        where: { certificateNumber: certificate.certificateExternalId },
        data: {
          verificationStatus: "REJECTED",
          verifiedAt: new Date(),
          verificationNotes: finalComments.trim(),
        },
      }).catch((e) => console.error("Certification rejection sync error:", e));
    }

    await logAuditAction({
      userId: user.id,
      role: user.role,
      action: "REJECTED_CERTIFICATE",
      targetEntity: "Certificate",
      targetEntityId: certificate.id,
      metadata: {
        studentId: certificate.studentId,
        certificateName: certificate.certificateName,
        reason: finalComments.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Certificate rejected.",
      data: certificate,
    });
  } catch (error: any) {
    console.error("Error rejecting certificate:", error);
    return NextResponse.json(
      { error: "Failed to reject certificate", message: error.message },
      { status: 500 }
    );
  }
}
