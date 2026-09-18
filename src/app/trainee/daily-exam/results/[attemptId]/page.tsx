import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Trophy, CheckCircle2, XCircle, Clock, ArrowLeft,
  ArrowRight, TrendingUp, BookOpen, Lightbulb, Target
} from "lucide-react";

export const revalidate = 0;

export default async function ResultsPage({ params }: { params: { attemptId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login/student");

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      exam: { select: { title: true, role: true, questionCount: true } },
      answers: {
        include: {
          question: true,
        },
        orderBy: { question: { orderIndex: "asc" } },
      },
    },
  });

  if (!attempt || attempt.userId !== user.id) notFound();

  // Topic-wise performance
  const topicMap: Record<string, { correct: number; total: number }> = {};
  for (const ans of attempt.answers) {
    const topic = ans.question.topic;
    if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
    topicMap[topic].total++;
    if (ans.isCorrect) topicMap[topic].correct++;
  }
  const topics = Object.entries(topicMap).map(([name, stats]) => ({
    name,
    ...stats,
    pct: Math.round((stats.correct / stats.total) * 100),
  })).sort((a, b) => b.pct - a.pct);

  const strongTopics = topics.filter(t => t.pct >= 70);
  const weakTopics = topics.filter(t => t.pct < 50);

  const minutes = Math.floor(attempt.timeTaken / 60);
  const seconds = attempt.timeTaken % 60;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Navigation */}
      <Link href="/trainee/daily-exam" className="inline-flex items-center gap-2 text-sm text-muted hover:text-charcoal-700 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Score hero */}
      <div className={`rounded-3xl p-8 text-center border ${
        attempt.passed
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200"
      }`}>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-card border border-border mb-4">
          <Trophy className={`w-9 h-9 ${attempt.passed ? "text-emerald-600" : "text-red-500"}`} />
        </div>
        <p className={`font-display font-black text-6xl mb-2 ${attempt.passed ? "text-emerald-700" : "text-red-600"}`}>
          {Math.round(attempt.percentage)}%
        </p>
        <p className="font-display font-bold text-xl text-charcoal-800 mb-1">{attempt.exam.title}</p>
        <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
          attempt.passed ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
        }`}>{attempt.passed ? "🎉 Passed!" : "Better luck tomorrow"}</span>

        <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-charcoal-700">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{attempt.score} Correct</span>
          <span className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" />{attempt.exam.questionCount - attempt.score} Wrong</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" />{minutes}m {seconds}s</span>
        </div>
      </div>

      {/* Topic performance */}
      {topics.length > 0 && (
        <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-base text-charcoal-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-700" /> Topic-wise Performance
          </h2>
          <div className="space-y-3">
            {topics.map(t => (
              <div key={t.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-charcoal-700">{t.name}</span>
                  <span className={`font-semibold ${t.pct >= 70 ? "text-emerald-700" : t.pct >= 40 ? "text-amber-600" : "text-red-600"}`}>
                    {t.correct}/{t.total} · {t.pct}%
                  </span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${t.pct >= 70 ? "bg-emerald-500" : t.pct >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="grid sm:grid-cols-2 gap-4">
        {strongTopics.length > 0 && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 space-y-2">
            <h3 className="font-semibold text-sm text-emerald-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Strong Areas
            </h3>
            <ul className="space-y-1">
              {strongTopics.map(t => (
                <li key={t.name} className="text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />{t.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {weakTopics.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-2">
            <h3 className="font-semibold text-sm text-amber-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Needs Improvement
            </h3>
            <ul className="space-y-1">
              {weakTopics.map(t => (
                <li key={t.name} className="text-xs text-amber-700 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5" />{t.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detailed Q&A review */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-base text-charcoal-800">Detailed Review</h2>
        {attempt.answers.map((ans, idx) => {
          const q = ans.question;
          const options: Record<string, string> = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD };
          return (
            <div key={ans.id} className={`rounded-2xl border p-5 space-y-4 ${ans.isCorrect ? "bg-white border-border" : "bg-red-50/40 border-red-200"}`}>
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${ans.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {idx + 1}
                </span>
                <p className="text-sm font-medium text-charcoal-800 leading-relaxed">{q.question}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 pl-10">
                {Object.entries(options).map(([k, text]) => {
                  const isCorrect = k === q.correctAnswer;
                  const isSelected = k === ans.selectedAnswer;
                  return (
                    <div key={k} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                      isCorrect ? "bg-emerald-50 border border-emerald-300 font-semibold text-emerald-800" :
                      isSelected && !isCorrect ? "bg-red-50 border border-red-300 text-red-700 line-through" :
                      "bg-sage-50 text-charcoal-600"
                    }`}>
                      <span className="font-bold">{k}.</span>
                      <span>{text}</span>
                      {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-emerald-600" />}
                      {isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-red-500" />}
                    </div>
                  );
                })}
              </div>

              <div className="pl-10 flex items-start gap-2 bg-sage-50 rounded-xl p-3 border border-border">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-charcoal-700 leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Link href="/trainee/daily-exam" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <Link href="/trainee/daily-exam/history" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-medium text-charcoal-700 hover:bg-sage-50 transition">
          View History <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
