import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "TRAINING_PROVIDER" && user.role !== "GOVERNMENT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (status && ["PENDING", "APPROVED", "REJECTED", "RESUBMIT"].includes(status)) {
      whereClause.status = status;
    }

    const certificates = await prisma.certificate.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        reviewer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    const counts = {
      total: await prisma.certificate.count(),
      pending: await prisma.certificate.count({ where: { status: "PENDING" } }),
      approved: await prisma.certificate.count({ where: { status: "APPROVED" } }),
      rejected: await prisma.certificate.count({ where: { status: "REJECTED" } }),
    };

    return NextResponse.json({
      success: true,
      data: certificates,
      counts,
    });
  } catch (error: any) {
    console.error("Error fetching pending certificates:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
