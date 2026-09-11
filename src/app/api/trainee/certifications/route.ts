import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
      include: {
        certifications: {
          include: {
            program: {
              include: {
                provider: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!trainee) {
      return NextResponse.json({ error: "Trainee profile not found" }, { status: 404 });
    }

    const providers = await prisma.trainingProviderProfile.findMany({
      select: {
        id: true,
        institutionName: true,
        accreditationNumber: true,
        programs: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: { institutionName: "asc" },
    });

    return NextResponse.json({
      certifications: trainee.certifications,
      providers,
    });
  } catch (error: any) {
    console.error("GET /api/trainee/certifications error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch certifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized: Trainee access required" }, { status: 401 });
    }

    let trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
    });

    if (!trainee) {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      trainee = await prisma.traineeProfile.create({
        data: {
          userId: user.id,
          traineeId: `CLP-2026-${randomSuffix}`,
          district: "National",
          state: "National",
        },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string)?.trim();
    const issuingAuthority = (formData.get("issuingAuthority") as string)?.trim() || "National Skill Development Board";
    let certificateNumber = (formData.get("certificateNumber") as string)?.trim();
    const issueDateStr = formData.get("issueDate") as string;
    const expiryDateStr = formData.get("expiryDate") as string;
    let providerId = (formData.get("providerId") as string)?.trim();
    let programId = (formData.get("programId") as string)?.trim();
    const submitForVerification = formData.get("submitForVerification") === "true";

    if (!title) {
      return NextResponse.json({ error: "Certificate title or program name is required" }, { status: 400 });
    }

    if (!certificateNumber) {
      certificateNumber = `CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Check if certificate number already exists
    const existingCert = await prisma.certification.findUnique({
      where: { certificateNumber },
    });
    if (existingCert) {
      certificateNumber = `${certificateNumber}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    let credentialUrl: string | null = null;

    if (file && file.size > 0) {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "File exceeds 10MB maximum limit" }, { status: 400 });
      }

      const originalName = file.name || "certificate.pdf";
      const ext = path.extname(originalName).toLowerCase() || ".pdf";
      const allowedExts = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
      if (!allowedExts.includes(ext)) {
        return NextResponse.json({ error: "Only PDF, PNG, JPG, JPEG, and WEBP formats are supported" }, { status: 400 });
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads", "certificates");
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueFileName = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));

      credentialUrl = `/uploads/certificates/${uniqueFileName}`;
    }

    // Find or associate TrainingProgram
    if (!programId || programId === "custom") {
      // Find first provider or create program under selected provider
      let targetProviderId = providerId;
      if (!targetProviderId || targetProviderId === "EXTERNAL") {
        const firstProvider = await prisma.trainingProviderProfile.findFirst();
        if (firstProvider) {
          targetProviderId = firstProvider.id;
        } else {
          // Create default provider if none exists
          const defaultUser = await prisma.user.create({
            data: {
              email: `provider_${Date.now()}@careerloop.org`,
              name: "Accredited Training Institute",
              role: "TRAINING_PROVIDER",
            },
          });
          const newProvider = await prisma.trainingProviderProfile.create({
            data: {
              userId: defaultUser.id,
              institutionName: "Accredited National Skills Institute",
              accreditationNumber: "NSDC-TC-NAT-001",
              contactEmail: defaultUser.email,
              district: "National",
              state: "National",
            },
          });
          targetProviderId = newProvider.id;
        }
      }

      // Check if a program with this title exists under this provider
      const existingProgram = await prisma.trainingProgram.findFirst({
        where: {
          title: { equals: title },
          providerId: targetProviderId,
        },
      });

      if (existingProgram) {
        programId = existingProgram.id;
      } else {
        const programCode = `PRG-${title.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X")}-${Math.floor(1000 + Math.random() * 9000)}`;
        const createdProgram = await prisma.trainingProgram.create({
          data: {
            providerId: targetProviderId,
            title,
            code: programCode,
            sector: "Technical & Vocational Skills",
            description: `${title} Certification Program`,
            durationWeeks: 12,
            minHours: 120,
          },
        });
        programId = createdProgram.id;
      }
    }

    const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();
    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;
    const verificationStatus = submitForVerification ? "PENDING_VERIFICATION" : "UPLOADED";

    const certification = await prisma.certification.create({
      data: {
        traineeId: trainee.id,
        programId,
        certificateNumber,
        credentialUrl,
        issueDate,
        expiryDate,
        issuingAuthority,
        verificationStatus,
        verificationNotes: submitForVerification ? "Submitted for training provider verification." : "Uploaded by learner.",
      },
      include: {
        program: {
          include: {
            provider: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      certification,
    });
  } catch (error: any) {
    console.error("POST /api/trainee/certifications error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload certificate" }, { status: 500 });
  }
}
