import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify batch ownership
    const batch = await prisma.batch.findUnique({
      where: { id: params.id },
      include: { program: true },
    });

    if (!batch || batch.program.providerId !== provider.id) {
      return NextResponse.json(
        { error: "Batch not found or not owned by your institution." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, startDate, endDate, maxCapacity, status } = body;

    const updated = await prisma.batch.update({
      where: { id: params.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(maxCapacity ? { maxCapacity: parseInt(maxCapacity) } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        program: true,
        enrollments: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Batch updated successfully.",
      batch: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/provider/batches/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update batch", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const batch = await prisma.batch.findUnique({
      where: { id: params.id },
      include: { program: true },
    });

    if (!batch || batch.program.providerId !== provider.id) {
      return NextResponse.json(
        { error: "Batch not found or not owned by your institution." },
        { status: 404 }
      );
    }

    await prisma.batch.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Batch deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/provider/batches/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete batch", message: error.message },
      { status: 500 }
    );
  }
}
