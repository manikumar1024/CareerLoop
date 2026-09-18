import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  GRAMMAR_EXERCISES,
  VOCABULARY_WORDS,
  READING_PASSAGES,
  WRITING_PROMPTS,
  INTERVIEW_PROMPTS,
} from "@/lib/communication-content";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Fetch user attempts today
    const todayAttempts = await prisma.communicationAttempt.findMany({
      where: {
        userId: user.id,
        completedAt: { gte: todayStart },
      },
      include: {
        activity: {
          select: { type: true },
        },
      },
    });

    // Total stats
    const allAttempts = await prisma.communicationAttempt.findMany({
      where: { userId: user.id },
      select: { score: true, completedAt: true, activity: { select: { type: true } } },
    });

    const completedTypes = new Set(todayAttempts.map((a) => a.activity.type));

    const completedToday = {
      grammar: completedTypes.has("GRAMMAR"),
      vocabulary: completedTypes.has("VOCABULARY"),
      reading: completedTypes.has("READING"),
      writing: completedTypes.has("WRITING"),
      interview: completedTypes.has("INTERVIEW"),
    };

    const avgScore =
      allAttempts.length > 0
        ? Math.round(
            allAttempts.reduce((acc, a) => acc + (a.score || 0), 0) /
              allAttempts.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        completedToday,
        totalCompleted: allAttempts.length,
        avgScore,
        todayCount: todayAttempts.length,
        activities: {
          grammar: GRAMMAR_EXERCISES.slice(0, 4),
          vocabulary: VOCABULARY_WORDS.slice(0, 3),
          reading: READING_PASSAGES[0],
          writing: WRITING_PROMPTS[0],
          interview: INTERVIEW_PROMPTS[0],
        },
      },
    });
  } catch (error: any) {
    console.error("Error in communication daily API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
