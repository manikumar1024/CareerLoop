import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { examId, answers, timeTaken } = body as {
    examId: string;
    answers: { questionId: string; selectedAnswer: string | null }[];
    timeTaken: number; // seconds
  };

  if (!examId || !answers) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check if already attempted
  const existing = await prisma.examAttempt.findUnique({
    where: { userId_examId: { userId: user.id, examId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Exam already submitted", attemptId: existing.id }, { status: 409 });
  }

  // Fetch correct answers from DB
  const exam = await prisma.dailyExam.findUnique({
    where: { id: examId },
    include: { questions: true },
  });
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  // Calculate score
  let correct = 0;
  const answerDetails: { questionId: string; selectedAnswer: string | null; isCorrect: boolean }[] = [];

  for (const q of exam.questions) {
    const userAnswer = answers.find(a => a.questionId === q.id);
    const selected = userAnswer?.selectedAnswer || null;
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) correct++;
    answerDetails.push({ questionId: q.id, selectedAnswer: selected, isCorrect });
  }

  const percentage = Math.round((correct / exam.questionCount) * 100);
  const passed = percentage >= 40;

  // Save attempt
  const attempt = await prisma.examAttempt.create({
    data: {
      userId: user.id,
      examId,
      score: correct,
      percentage,
      timeTaken: timeTaken || 0,
      passed,
      answers: {
        create: answerDetails,
      },
    },
    include: { answers: true },
  });

  // Return full results with correct answers and explanations
  const results = exam.questions.map(q => {
    const userAns = answerDetails.find(a => a.questionId === q.id);
    return {
      id: q.id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      selectedAnswer: userAns?.selectedAnswer || null,
      isCorrect: userAns?.isCorrect || false,
      explanation: q.explanation,
      topic: q.topic,
    };
  });

  return NextResponse.json({
    attemptId: attempt.id,
    score: correct,
    total: exam.questionCount,
    percentage,
    passed,
    timeTaken,
    results,
  });
}
