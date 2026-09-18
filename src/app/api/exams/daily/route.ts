import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getQuestionsForRole, shuffleOptions } from "@/lib/exam-questions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const TODAY = () => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

async function generateQuestionsWithAI(role: string, difficulty: string, count: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate ${count} multiple-choice exam questions for a ${role} placement exam.
Difficulty: ${difficulty}
Return ONLY valid JSON array, no markdown:
[{
  "question": "...",
  "optionA": "...",
  "optionB": "...",
  "optionC": "...",
  "optionD": "...",
  "correctAnswer": "A|B|C|D",
  "explanation": "...",
  "topic": "...",
  "difficulty": "${difficulty}"
}]
Mix technical, problem-solving, and role-specific questions. All options must be distinct.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = TODAY();

  // Get user's career target for role-based exam
  const profile = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: { careerTarget: true },
  });

  const role = profile?.careerTarget?.targetRole || "Software Developer";

  // Check if today's exam already exists for this role
  let exam = await prisma.dailyExam.findUnique({
    where: { role_date: { role, date: today } },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });

  // Check if user already attempted today's exam
  let attempt = null;
  if (exam) {
    attempt = await prisma.examAttempt.findUnique({
      where: { userId_examId: { userId: user.id, examId: exam.id } },
      include: { answers: true },
    });
  }

  // Get exam history stats
  const allAttempts = await prisma.examAttempt.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: 30,
    include: { exam: { select: { date: true, role: true } } },
  });

  const totalCompleted = allAttempts.length;
  const avgScore = totalCompleted > 0
    ? Math.round(allAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalCompleted)
    : 0;
  const bestScore = totalCompleted > 0
    ? Math.round(Math.max(...allAttempts.map(a => a.percentage)))
    : 0;

  // Calculate streak
  let streak = 0;
  const sortedDates = Array.from(new Set(allAttempts.map(a => a.exam.date))).sort().reverse();
  let expectedDate = new Date();
  for (const dateStr of sortedDates) {
    const d = new Date(dateStr);
    const exp = expectedDate.toISOString().split("T")[0];
    if (dateStr === exp) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else break;
  }

  return NextResponse.json({
    exam: exam ? {
      id: exam.id,
      title: exam.title,
      role: exam.role,
      difficulty: exam.difficulty,
      date: exam.date,
      timeLimit: exam.timeLimit,
      questionCount: exam.questionCount,
    } : null,
    attempted: !!attempt,
    attempt: attempt ? {
      id: attempt.id,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      timeTaken: attempt.timeTaken,
    } : null,
    role,
    stats: { totalCompleted, avgScore, bestScore, streak },
  });
}

export async function POST(req: NextRequest) {
  // POST: generate/create today's exam
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = TODAY();

  const profile = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: { careerTarget: true },
  });
  const role = profile?.careerTarget?.targetRole || "Software Developer";

  // Return existing exam if already created
  const existing = await prisma.dailyExam.findUnique({
    where: { role_date: { role, date: today } },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });
  if (existing) {
    // Don't reveal correct answers
    const safeQuestions = existing.questions.map(q => ({
      id: q.id, question: q.question, optionA: q.optionA,
      optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
      topic: q.topic, difficulty: q.difficulty,
    }));
    return NextResponse.json({ exam: { ...existing, questions: safeQuestions } });
  }

  // Generate questions
  const COUNT = 10;
  const difficulty = "MEDIUM";
  let questionsData = await generateQuestionsWithAI(role, difficulty, COUNT);

  if (!questionsData || questionsData.length < COUNT) {
    // Fallback to static bank
    const fallback = getQuestionsForRole(role, COUNT);
    questionsData = fallback.map(q => shuffleOptions(q));
  }

  // Create exam in DB
  const exam = await prisma.dailyExam.create({
    data: {
      title: `${role} — Daily Challenge`,
      role,
      difficulty,
      date: today,
      timeLimit: 15,
      questionCount: COUNT,
      questions: {
        create: questionsData.slice(0, COUNT).map((q: any, i: number) => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "No explanation provided.",
          topic: q.topic || "General",
          difficulty: q.difficulty || difficulty,
          orderIndex: i,
        })),
      },
    },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });

  const safeQuestions = exam.questions.map(q => ({
    id: q.id, question: q.question, optionA: q.optionA,
    optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
    topic: q.topic, difficulty: q.difficulty,
  }));

  return NextResponse.json({ exam: { ...exam, questions: safeQuestions } });
}
