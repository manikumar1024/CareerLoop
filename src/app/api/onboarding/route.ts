import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateTraineeId } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, district, orgName, adminCode } = await req.json();

    if (!role) {
      return NextResponse.json({ error: "Role is required." }, { status: 400 });
    }

    if (role === "GOVERNMENT_ADMIN" && adminCode !== (process.env.ADMIN_REGISTRATION_CODE || "CAREERLOOP-GOV-ADMIN")) {
      return NextResponse.json({ error: "Invalid Admin Authorization Code." }, { status: 403 });
    }

    // Update user role
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role,
        adminApproved: role === "GOVERNMENT_ADMIN" ? true : false,
      },
    });

    // Create role profile if not existing
    if (role === "TRAINEE") {
      const existing = await prisma.traineeProfile.findUnique({ where: { userId: user.id } });
      if (!existing) {
        await prisma.traineeProfile.create({
          data: {
            userId: user.id,
            traineeId: generateTraineeId(),
            district: district || "National",
            currentStatus: "TRAINING",
          },
        });
      }
    } else if (role === "EMPLOYER") {
      const existing = await prisma.employerProfile.findUnique({ where: { userId: user.id } });
      if (!existing) {
        await prisma.employerProfile.create({
          data: {
            userId: user.id,
            companyName: orgName || `${user.name || "Organization"}'s Company`,
            industry: "Services / Technology",
            district: district || "National",
            contactEmail: user.email,
          },
        });
      }
    } else if (role === "TRAINING_PROVIDER") {
      const existing = await prisma.trainingProviderProfile.findUnique({ where: { userId: user.id } });
      if (!existing) {
        await prisma.trainingProviderProfile.create({
          data: {
            userId: user.id,
            institutionName: orgName || `${user.name || "Provider"} Skill Hub`,
            district: district || "National",
            contactEmail: user.email,
          },
        });
      }
    }

    await logAuditAction({
      userId: user.id,
      role,
      action: "COMPLETED_ONBOARDING",
      targetEntity: "User",
      targetEntityId: user.id,
      metadata: { role, district, orgName },
    });

    return NextResponse.json({ success: true, role });
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: err.message || "Failed to complete onboarding" }, { status: 500 });
  }
}
