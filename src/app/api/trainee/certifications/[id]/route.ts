import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
    });

    if (!trainee) {
      return NextResponse.json({ error: "Trainee profile not found" }, { status: 404 });
    }

    const cert = await prisma.certification.findUnique({
      where: { id: params.id },
    });

    if (!cert || cert.traineeId !== trainee.id) {
      return NextResponse.json({ error: "Certificate not found or unauthorized" }, { status: 404 });
    }

    // Try removing local file if exists
    if (cert.credentialUrl && cert.credentialUrl.startsWith("/uploads/certificates/")) {
      try {
        const filePath = path.join(process.cwd(), "public", cert.credentialUrl);
        await fs.unlink(filePath);
      } catch (e) {
        // File may already be removed or not found
      }
    }

    await prisma.certification.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error: any) {
    console.error("DELETE /api/trainee/certifications/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete certificate" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
    });

    if (!trainee) {
      return NextResponse.json({ error: "Trainee profile not found" }, { status: 404 });
    }

    const cert = await prisma.certification.findUnique({
      where: { id: params.id },
    });

    if (!cert || cert.traineeId !== trainee.id) {
      return NextResponse.json({ error: "Certificate not found or unauthorized" }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;

    let updatedCert;
    if (action === "SUBMIT_FOR_VERIFICATION") {
      updatedCert = await prisma.certification.update({
        where: { id: params.id },
        data: {
          verificationStatus: "PENDING_VERIFICATION",
          verificationNotes: "Submitted for training provider verification.",
        },
        include: {
          program: {
            include: {
              provider: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, certification: updatedCert });
  } catch (error: any) {
    console.error("PATCH /api/trainee/certifications/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update certificate" }, { status: 500 });
  }
}
