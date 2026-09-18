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

    const body = await req.json().catch(() => ({}));
    const { reason, comments } = body;

    const certificate = await prisma.certificate.update({
      where: { id: params.id },
      data: {
        status: "RESUBMIT",
        reviewerId: user.id,
        reviewedAt: new Date(),
        reviewerComments: reason || comments || "Please re-upload a clearer image or document.",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resubmission requested",
      data: certificate,
    });
  } catch (error: any) {
    console.error("Error requesting resubmission:", error);
    return NextResponse.json(
      { error: "Failed to update certificate", message: error.message },
      { status: 500 }
    );
  }
}
