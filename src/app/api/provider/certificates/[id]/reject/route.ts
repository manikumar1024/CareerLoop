import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "TRAINING_PROVIDER" && user.role !== "GOVERNMENT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reason, comments } = body;
    const finalComments = reason || comments;

    if (!finalComments || finalComments.trim().length === 0) {
      return NextResponse.json(
        { error: "A rejection reason must be provided" },
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
    });

    return NextResponse.json({
      success: true,
      message: "Certificate rejected",
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
