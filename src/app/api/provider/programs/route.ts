import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in." }, { status: 401 });
    }

    if (user.role !== "TRAINING_PROVIDER" && user.role !== "GOVERNMENT_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Training Provider access required." }, { status: 403 });
    }

    const providerProfile = await prisma.trainingProviderProfile.findUnique({
      where: { userId: user.id },
      include: {
        programs: {
          include: {
            batches: {
              include: {
                enrollments: {
                  include: {
                    trainee: {
                      include: {
                        user: { select: { id: true, name: true, email: true } },
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            enrollments: {
              include: {
                trainee: {
                  include: {
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
                batch: true,
                assessments: true,
              },
              orderBy: { enrollmentDate: "desc" },
            },
            certifications: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!providerProfile) {
      return NextResponse.json({ error: "Training Provider profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      programs: providerProfile.programs,
    });
  } catch (error: any) {
    console.error("GET /api/provider/programs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider programs", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in." }, { status: 401 });
    }

    if (user.role !== "TRAINING_PROVIDER") {
      return NextResponse.json({ error: "Forbidden: Only Training Providers can create programs." }, { status: 403 });
    }

    let providerProfile = await prisma.trainingProviderProfile.findUnique({
      where: { userId: user.id },
    });

    if (!providerProfile) {
      providerProfile = await prisma.trainingProviderProfile.create({
        data: {
          userId: user.id,
          institutionName: user.name || "Vocational Training Center",
          contactEmail: user.email,
          district: "National",
          state: "National",
          centerType: "Vocational Skill Center",
        },
      });
    }

    const body = await req.json();
    const { title, code, sector, description, durationWeeks, minHours, skillsOffered } = body;

    if (!title || !code || !sector || !description) {
      return NextResponse.json(
        { error: "Title, program code, sector, and description are required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check code uniqueness
    const existing = await prisma.trainingProgram.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Program code '${cleanCode}' is already registered. Please use a unique code.` },
        { status: 409 }
      );
    }

    const program = await prisma.trainingProgram.create({
      data: {
        providerId: providerProfile.id,
        title: title.trim(),
        code: cleanCode,
        sector: sector.trim(),
        description: description.trim(),
        durationWeeks: parseInt(durationWeeks) || 12,
        minHours: parseInt(minHours) || 360,
        skillsOffered: skillsOffered?.trim() || null,
        status: "ACTIVE",
      },
      include: {
        provider: {
          select: {
            id: true,
            institutionName: true,
            district: true,
            state: true,
            contactEmail: true,
          },
        },
        batches: true,
      },
    });

    await logAuditAction({
      userId: user.id,
      role: "TRAINING_PROVIDER",
      action: "CREATED_TRAINING_PROGRAM",
      targetEntity: "TrainingProgram",
      targetEntityId: program.id,
      metadata: { code: cleanCode, title: program.title, sector: program.sector },
    });

    return NextResponse.json({
      success: true,
      message: "Training program published successfully.",
      program,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/provider/programs error:", error);
    return NextResponse.json(
      { error: "Failed to create program", message: error.message },
      { status: 500 }
    );
  }
}
