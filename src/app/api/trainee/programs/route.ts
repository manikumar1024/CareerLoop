import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let traineeId: string | null = null;

    if (user) {
      const trainee = await prisma.traineeProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      traineeId = trainee?.id || null;
    }

    const programs = await prisma.trainingProgram.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        provider: {
          select: {
            id: true,
            institutionName: true,
            accreditationNumber: true,
            district: true,
            state: true,
            contactEmail: true,
          },
        },
        batches: {
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
          orderBy: { startDate: "asc" },
        },
        enrollments: {
          select: {
            id: true,
            traineeId: true,
            status: true,
            batchId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format program data with enrollment indicators
    const formattedPrograms = programs.map((p) => {
      const isEnrolled = traineeId
        ? p.enrollments.some((e) => e.traineeId === traineeId)
        : false;
      const userEnrollment = traineeId
        ? p.enrollments.find((e) => e.traineeId === traineeId) || null
        : null;

      return {
        id: p.id,
        title: p.title,
        code: p.code,
        sector: p.sector,
        description: p.description,
        durationWeeks: p.durationWeeks,
        minHours: p.minHours,
        skillsOffered: p.skillsOffered,
        status: p.status,
        provider: p.provider,
        totalEnrolled: p.enrollments.length,
        isEnrolled,
        userEnrollment,
        batches: p.batches.map((b) => ({
          id: b.id,
          name: b.name,
          batchCode: b.batchCode,
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status,
          maxCapacity: b.maxCapacity,
          enrolledCount: b._count.enrollments,
          availableSeats: Math.max(0, b.maxCapacity - b._count.enrollments),
          isUserInBatch: userEnrollment?.batchId === b.id,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      programs: formattedPrograms,
      count: formattedPrograms.length,
    });
  } catch (error: any) {
    console.error("GET /api/trainee/programs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch available training programs", message: error.message },
      { status: 500 }
    );
  }
}
