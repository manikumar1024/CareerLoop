import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";



/**
 * POST /api/trainee/onboarding-career-target
 * Creates or updates the career target collected during onboarding.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetRole, industry, employmentType } = await req.json();
    if (!targetRole?.trim()) {
      return NextResponse.json({ error: "Target role is required" }, { status: 400 });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
    });
    if (!trainee) {
      return NextResponse.json({ error: "Trainee profile not found" }, { status: 404 });
    }

    const validEmploymentTypes = [
      "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE",
    ];
    const resolvedEmploymentType = validEmploymentTypes.includes(employmentType)
      ? employmentType
      : "FULL_TIME";

    // Upsert career target
    await prisma.careerTarget.upsert({
      where: { traineeId: trainee.id },
      update: {
        targetRole: targetRole.trim(),
        industry: industry || null,
        employmentType: resolvedEmploymentType,
        updatedAt: new Date(),
      },
      create: {
        traineeId: trainee.id,
        targetRole: targetRole.trim(),
        industry: industry || null,
        employmentType: resolvedEmploymentType,
        priority: "HIGH",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Onboarding career target error:", err);
    return NextResponse.json({ error: err.message || "Failed to save career target" }, { status: 500 });
  }
}
