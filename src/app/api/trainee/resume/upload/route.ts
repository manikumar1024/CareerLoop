// src/app/api/trainee/resume/upload/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ResumeParserService } from "@/lib/resume-parser";
import { logAuditAction } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized: Trainee access required." }, { status: 401 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
    });

    if (!trainee) {
      return NextResponse.json({ error: "Trainee profile not found." }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided." }, { status: 400 });
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds maximum permitted size of 5MB." }, { status: 400 });
    }

    // Validate extension
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();
    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx") && !lowerName.endsWith(".txt")) {
      return NextResponse.json({ error: "Only PDF, DOCX, and TXT resume files are supported." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run Parser Service
    const parser = ResumeParserService.getInstance();
    const extractedData = await parser.parse(buffer, fileName, file.type);

    // Save resume file metadata and JSON snapshot to DB
    await prisma.traineeProfile.update({
      where: { id: trainee.id },
      data: {
        resumeFileName: fileName,
        resumeUploadedAt: new Date(),
        resumeParsedData: JSON.stringify(extractedData),
      },
    });

    await logAuditAction({
      userId: user.id,
      role: "TRAINEE",
      action: "UPLOADED_RESUME",
      targetEntity: "TraineeProfile",
      targetEntityId: trainee.id,
      metadata: { fileName, fileSize: file.size },
    });

    return NextResponse.json({
      success: true,
      fileName,
      extractedData,
      message: "Resume successfully parsed. Please review detected competencies to synchronize with your profile.",
    });
  } catch (error: any) {
    console.error("Resume upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to process resume upload." }, { status: 500 });
  }
}
