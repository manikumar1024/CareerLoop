import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TRAINING_PROVIDER" && user.role !== "GOVERNMENT_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const provider = await prisma.trainingProviderProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");

    const batches = await prisma.batch.findMany({
      where: {
        program: {
          providerId: provider.id,
          ...(programId ? { id: programId } : {}),
        },
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            code: true,
            sector: true,
            durationWeeks: true,
          },
        },
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
    });

    return NextResponse.json({ success: true, batches });
  } catch (error: any) {
    console.error("GET /api/provider/batches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches", message: error.message },
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

    if (user.role !== "TRAINING_PROVIDER") {
      return NextResponse.json({ error: "Forbidden: Only Training Providers can create batches." }, { status: 403 });
    }

    const provider = await prisma.trainingProviderProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { programId, name, batchCode, startDate, endDate, maxCapacity, status } = body;

    if (!programId || !name || !batchCode) {
      return NextResponse.json(
        { error: "Program selection, Batch name, and unique Batch code are required." },
        { status: 400 }
      );
    }

    // Verify program belongs to this provider
    const program = await prisma.trainingProgram.findFirst({
      where: {
        id: programId,
        providerId: provider.id,
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Selected training program does not belong to your institution." },
        { status: 403 }
      );
    }

    const cleanBatchCode = batchCode.trim().toUpperCase();

    // Check unique batch code
    const existing = await prisma.batch.findUnique({
      where: { batchCode: cleanBatchCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Batch code '${cleanBatchCode}' is already registered. Please choose another code.` },
        { status: 409 }
      );
    }

    const batch = await prisma.batch.create({
      data: {
        programId: program.id,
        name: name.trim(),
        batchCode: cleanBatchCode,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        maxCapacity: parseInt(maxCapacity) || 30,
        status: status || "ACTIVE",
      },
      include: {
        program: true,
        enrollments: true,
      },
    });

    await logAuditAction({
      userId: user.id,
      role: "TRAINING_PROVIDER",
      action: "CREATED_BATCH",
      targetEntity: "Batch",
      targetEntityId: batch.id,
      metadata: { batchCode: cleanBatchCode, programId: program.id, name: batch.name },
    });

    return NextResponse.json({
      success: true,
      message: "Training batch created successfully.",
      batch,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/provider/batches error:", error);
    return NextResponse.json(
      { error: "Failed to create batch", message: error.message },
      { status: 500 }
    );
  }
}
