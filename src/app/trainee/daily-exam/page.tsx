import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Trophy, Clock, Target, Flame, BarChart3,
  ArrowRight, CheckCircle2, Play, TrendingUp, Star
} from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];

export const revalidate = 0;

export default async function DailyExamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login/student");

  const profile = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: { careerTarget: true },
  });
  const role = profile?.careerTarget?.targetRole || "Software Developer";

  // Today's exam
  const todayExam = await prisma.dailyExam.findUnique({
    where: { role_date: { role, date: TODAY } },
  });

  // Today's attempt
  const todayAttempt = todayExam
    ? await prisma.examAttempt.findUnique({
        where: { userId_examId: { userId: user.id, examId: todayExam.id } },
      })
    : null;

  // History
  const history = await prisma.examAttempt.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: 20,
    include: { exam: { select: { date: true, role: true, title: true, questionCount: true } } },
  });

  const totalCompleted = history.length;
  const avgScore = totalCompleted > 0
    ? Math.round(history.reduce((s, a) => s + a.percentage, 0) / totalCompleted)
    : 0;
  const bestScore = totalCompleted > 0
    ? Math.round(Math.max(...history.map(a => a.percentage)))
    : 0;

  // Streak
  let streak = 0;
  const sortedDates = Array.from(new Set(history.map(a => a.exam.date))).sort().reverse();
  let expectedDate = new Date();
  for (const dateStr of sortedDates) {
    const exp = expectedDate.toISOString().split("T")[0];
    if (dateStr === exp) { streak++; expectedDate.setDate(expectedDate.getDate() - 1); }
    else break;
  }

  const recentFive = history.slice(0, 5);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal-800 flex items-center gap-3">
          <Trophy className="w-7 h-7 text-emerald-700" />
          Daily Practice Exam
        </h1>
        <p className="text-sm text-muted mt-1">Role: <strong className="text-charcoal-700">{role}</strong> · {TODAY}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle2, label: "Completed", value: totalCompleted, color: "emerald" },
          { icon: TrendingUp, label: "Avg Score", value: `${avgScore}%`, color: "blue" },
          { icon: Star, label: "Best Score", value: `${bestScore}%`, color: "amber" },
          { icon: Flame, label: "Streak", value: `${streak} day${streak !== 1 ? "s" : ""}`, color: "red" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-border shadow-card">
            <div className={`w-8 h-8 rounded-xl bg-${color}-50 text-${color}-700 flex items-center justify-center mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-muted font-medium">{label}</p>
            <p className="font-display font-bold text-lg text-charcoal-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Today's challenge card */}
      <div className={`rounded-3xl border p-6 sm:p-8 ${
        todayAttempt
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-border shadow-card"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Today&apos;s Challenge</p>
                <h2 className="font-display font-bold text-lg text-charcoal-800">{role} Daily Exam</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted font-medium">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />10 Questions</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-600" />15 Minutes</span>
              <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5 text-amber-600" />Medium Difficulty</span>
            </div>
            {todayAttempt && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed today — Score: {todayAttempt.score}/10 ({Math.round(todayAttempt.percentage)}%)
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 flex-shrink-0">
            {todayAttempt ? (
              <Link
                href={`/trainee/daily-exam/results/${todayAttempt.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition"
              >
                View Results <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/trainee/daily-exam/take"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 transition-all hover:scale-105 shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Exam
              </Link>
            )}
            <Link
              href="/trainee/daily-exam/history"
              className="text-center text-xs text-muted hover:text-charcoal-700 transition"
            >
              View Full History →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent history */}
      {recentFive.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-base text-charcoal-800 mb-4">Recent Exams</h2>
          <div className="space-y-3">
            {recentFive.map(attempt => (
              <Link
                key={attempt.id}
                href={`/trainee/daily-exam/results/${attempt.id}`}
                className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-border shadow-card hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-charcoal-800">{attempt.exam.title}</p>
                  <p className="text-xs text-muted">{attempt.exam.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold font-display ${
                      attempt.percentage >= 70 ? "text-emerald-700" :
                      attempt.percentage >= 40 ? "text-amber-600" : "text-red-600"
                    }`}>{Math.round(attempt.percentage)}%</p>
                    <p className="text-xs text-muted">{attempt.score}/{attempt.exam.questionCount || 10} correct</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    attempt.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}>{attempt.passed ? "Passed" : "Failed"}</span>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
