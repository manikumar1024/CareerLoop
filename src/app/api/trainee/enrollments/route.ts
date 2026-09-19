import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
      include: {
        enrollments: {
          include: {
            program: {
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
              },
            },
            batch: true,
            assessments: true,
          },
          orderBy: { enrollmentDate: "desc" },
        },
        certifications: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!trainee) {
      return NextResponse.json({ success: true, enrollments: [] });
    }

    return NextResponse.json({
      success: true,
      enrollments: trainee.enrollments,
      certifications: trainee.certifications,
    });
  } catch (error: any) {
    console.error("GET /api/trainee/enrollments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments", message: error.message },
      { status: 500 }
    );
  }
}
