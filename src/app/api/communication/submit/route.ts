import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { activityId, type, score, response, feedback } = body;

    if (!type || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: type, score" },
        { status: 400 }
      );
    }

    let targetActivityId = activityId;

    if (!targetActivityId) {
      // Find or create a CommunicationActivity for this type
      let activity = await prisma.communicationActivity.findFirst({
        where: { type: type.toUpperCase() },
      });

      if (!activity) {
        activity = await prisma.communicationActivity.create({
          data: {
            title: `Daily ${type.toUpperCase()}`,
            type: type.toUpperCase(),
            difficulty: "MEDIUM",
            content: "{}",
          },
        });
      }
      targetActivityId = activity.id;
    }

    // Save communication attempt
    const attempt = await prisma.communicationAttempt.create({
      data: {
        userId: user.id,
        activityId: targetActivityId,
        score: Number(score),
        response: typeof response === "object" ? JSON.stringify(response) : response || "",
        feedback: typeof feedback === "object" ? JSON.stringify(feedback) : feedback || "",
      },
    });

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error: any) {
    console.error("Error saving communication attempt:", error);
    return NextResponse.json(
      { error: "Failed to record attempt", message: error.message },
      { status: 500 }
    );
  }
}
