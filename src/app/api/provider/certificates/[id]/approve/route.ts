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
    const { comments } = body;

    const certificate = await prisma.certificate.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        reviewerId: user.id,
        reviewedAt: new Date(),
        reviewerComments: comments || "Verified and authenticated by Training Provider.",
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    // If matching external certification exists, update it too
    if (certificate.certificateExternalId) {
      await prisma.certification.updateMany({
        where: { certificateNumber: certificate.certificateExternalId },
        data: {
          verificationStatus: "PROVIDER_VERIFIED",
          verifiedAt: new Date(),
          verificationNotes: comments || "Verified and authenticated by Training Provider.",
        },
      }).catch((e) => console.error("Certification status sync error:", e));
    }

    await logAuditAction({
      userId: user.id,
      role: user.role,
      action: "VERIFIED_CERTIFICATE",
      targetEntity: "Certificate",
      targetEntityId: certificate.id,
      metadata: {
        studentId: certificate.studentId,
        certificateName: certificate.certificateName,
        status: "APPROVED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Certificate verified and approved successfully.",
      data: certificate,
    });
  } catch (error: any) {
    console.error("Error approving certificate:", error);
    return NextResponse.json(
      { error: "Failed to approve certificate", message: error.message },
      { status: 500 }
    );
  }
}
