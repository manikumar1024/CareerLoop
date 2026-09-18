import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Trophy,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ChevronLeft,
  Flame,
  Award,
  BookOpen,
} from "lucide-react";

export default async function ExamHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id },
    include: {
      exam: {
        select: {
          title: true,
          role: true,
          date: true,
          difficulty: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  const totalAttempts = attempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts
        )
      : 0;
  const bestScore =
    totalAttempts > 0 ? Math.round(Math.max(...attempts.map((a) => a.percentage))) : 0;
  const passedCount = attempts.filter((a) => a.passed || a.percentage >= 70).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/trainee/daily-exam"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Daily Exam
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Exam History & Records
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Complete record of your daily practice assessments and scores.
          </p>
        </div>
        <Link
          href="/trainee/daily-exam/take"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold text-sm shadow-md hover:shadow-amber-900/20 hover:scale-[1.02] transition"
        >
          Take Today's Exam <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Total Taken</p>
              <p className="text-xl font-bold text-stone-800">{totalAttempts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Average Score</p>
              <p className="text-xl font-bold text-stone-800">{avgScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Best Score</p>
              <p className="text-xl font-bold text-stone-800">{bestScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Passed (≥70%)</p>
              <p className="text-xl font-bold text-stone-800">{passedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-serif font-bold text-stone-800 text-lg">
            Past Attempts ({attempts.length})
          </h2>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-stone-800 text-base">
              No exams taken yet
            </h3>
            <p className="text-stone-500 text-sm max-w-sm mx-auto mt-1 mb-6">
              Complete daily exams to practice your skills and build your career performance record.
            </p>
            <Link
              href="/trainee/daily-exam/take"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition"
            >
              Take First Exam <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-xs text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Track / Title</th>
                  <th className="py-3.5 px-6">Score</th>
                  <th className="py-3.5 px-6">Time Taken</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {attempts.map((attempt) => {
                  const minutes = Math.floor(attempt.timeTaken / 60);
                  const seconds = attempt.timeTaken % 60;
                  const isPass = attempt.passed || attempt.percentage >= 70;

                  return (
                    <tr
                      key={attempt.id}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-stone-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-stone-400" />
                          {new Date(attempt.completedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-stone-800">
                        <div>
                          {attempt.exam?.title || "Daily Assessment"}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600">
                          {attempt.exam?.role || "General"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            isPass
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {Math.round(attempt.percentage)}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-stone-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {minutes}m {seconds}s
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Link
                          href={`/trainee/daily-exam/results/${attempt.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 transition hover:underline"
                        >
                          View Results <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
