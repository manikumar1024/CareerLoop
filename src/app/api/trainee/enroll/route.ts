import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in." }, { status: 401 });
    }

    if (user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Forbidden: Only Trainees / Students can enroll in programs." }, { status: 403 });
    }

    // Ensure trainee profile exists
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

    const body = await req.json();
    const { programId, batchId } = body;

    if (!programId) {
      return NextResponse.json({ error: "Program ID is required for enrollment." }, { status: 400 });
    }

    // Check program exists
    const program = await prisma.trainingProgram.findUnique({
      where: { id: programId },
      include: { provider: true },
    });

    if (!program) {
      return NextResponse.json({ error: "Selected training program not found." }, { status: 404 });
    }

    // Prevent duplicate enrollment
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        traineeId: trainee.id,
        programId: program.id,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        {
          error: "You are already enrolled in this training program.",
          enrollment: existingEnrollment,
        },
        { status: 409 }
      );
    }

    // Validate batch if specified
    let selectedBatch = null;
    if (batchId) {
      selectedBatch = await prisma.batch.findUnique({
        where: { id: batchId },
        include: {
          _count: { select: { enrollments: true } },
        },
      });

      if (!selectedBatch || selectedBatch.programId !== program.id) {
        return NextResponse.json({ error: "Invalid batch selected for this program." }, { status: 400 });
      }

      if (selectedBatch._count.enrollments >= selectedBatch.maxCapacity) {
        return NextResponse.json(
          { error: "This batch has reached maximum student capacity. Please choose another batch or contact the provider." },
          { status: 400 }
        );
      }
    }

    // Create Enrollment in database
    const enrollment = await prisma.enrollment.create({
      data: {
        traineeId: trainee.id,
        programId: program.id,
        batchId: selectedBatch?.id || null,
        status: "ENROLLED",
        enrollmentDate: new Date(),
      },
      include: {
        program: {
          include: {
            provider: true,
          },
        },
        batch: true,
      },
    });

    await logAuditAction({
      userId: user.id,
      role: "TRAINEE",
      action: "ENROLLED_IN_PROGRAM",
      targetEntity: "Enrollment",
      targetEntityId: enrollment.id,
      metadata: {
        programId: program.id,
        programTitle: program.title,
        batchId: selectedBatch?.id || null,
        providerName: program.provider.institutionName,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${program.title}!`,
      enrollment,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/trainee/enroll error:", error);
    return NextResponse.json(
      { error: "Failed to process enrollment", message: error.message },
      { status: 500 }
    );
  }
}
