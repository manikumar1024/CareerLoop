import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: 30,
    include: {
      exam: { select: { title: true, role: true, date: true, difficulty: true, questionCount: true } },
      answers: {
        include: { question: { select: { topic: true } } },
      },
    },
  });

  return NextResponse.json({ attempts });
}
