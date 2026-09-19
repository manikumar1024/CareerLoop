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
    const notes = reason || comments || "Please re-upload a clearer image or valid credential document.";

    const certificate = await prisma.certificate.update({
      where: { id: params.id },
      data: {
        status: "RESUBMIT",
        reviewerId: user.id,
        reviewedAt: new Date(),
        reviewerComments: notes.trim(),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    await logAuditAction({
      userId: user.id,
      role: user.role,
      action: "REQUESTED_CERTIFICATE_RESUBMISSION",
      targetEntity: "Certificate",
      targetEntityId: certificate.id,
      metadata: {
        studentId: certificate.studentId,
        certificateName: certificate.certificateName,
        notes: notes.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resubmission requested from student.",
      data: certificate,
    });
  } catch (error: any) {
    console.error("Error requesting resubmission:", error);
    return NextResponse.json(
      { error: "Failed to update certificate status", message: error.message },
      { status: 500 }
    );
  }
}
