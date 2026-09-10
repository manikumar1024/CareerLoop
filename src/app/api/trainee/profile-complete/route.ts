import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/trainee/profile-complete
 * Returns whether the trainee's profile is sufficiently complete to skip onboarding.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ complete: false, reason: "unauthenticated" });
    }

    if (user.role !== "TRAINEE") {
      // Non-trainees check if their profile record exists
      if (user.role === "EMPLOYER") {
        const ep = await prisma.employerProfile.findUnique({ where: { userId: user.id } });
        return NextResponse.json({ complete: !!ep });
      }
      if (user.role === "TRAINING_PROVIDER") {
        const pp = await prisma.trainingProviderProfile.findUnique({ where: { userId: user.id } });
        return NextResponse.json({ complete: !!pp });
      }
      // GOVERNMENT_ADMIN always goes to dashboard
      return NextResponse.json({ complete: true });
    }

    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
      include: {
        skills: true,
        careerTarget: true,
      },
    });

    if (!trainee) {
      return NextResponse.json({ complete: false, reason: "no_profile" });
    }

    // Profile is "complete" for redirect purposes if:
    // - trainee profile exists
    // - has at least 1 skill
    // - has career target
    const complete =
      trainee.skills.length > 0 &&
      trainee.careerTarget !== null;

    const completionSteps = {
      profile: true, // trainee profile exists
      skills: trainee.skills.length > 0,
      careerTarget: trainee.careerTarget !== null,
    };

    return NextResponse.json({
      complete,
      completionSteps,
      reason: !complete
        ? !trainee.careerTarget
          ? "no_career_target"
          : "no_skills"
        : undefined,
    });
  } catch (err: any) {
    console.error("Profile complete check error:", err);
    return NextResponse.json({ complete: false, reason: "error" });
  }
}
