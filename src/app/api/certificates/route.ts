import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificates = await prisma.certificate.findMany({
      where: { studentId: user.id },
      include: {
        reviewer: {
          select: { name: true, email: true },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: certificates });
  } catch (error: any) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      courseName,
      issuingOrg,
      issueDate,
      expiryDate,
      credentialId,
      fileUrl,
      fileName,
      fileSize,
      description,
    } = body;

    if (!title || !issuingOrg) {
      return NextResponse.json(
        { error: "Certificate Title and Issuing Organization are required" },
        { status: 400 }
      );
    }

    const certificate = await prisma.certificate.create({
      data: {
        studentId: user.id,
        certificateName: title,
        courseName: courseName || title,
        issuingOrganization: issuingOrg,
        certificateExternalId: credentialId || null,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize ? Number(fileSize) : null,
        description: description || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: certificate });
  } catch (error: any) {
    console.error("Error creating certificate submission:", error);
    return NextResponse.json(
      { error: "Failed to submit certificate", message: error.message },
      { status: 500 }
    );
  }
}
