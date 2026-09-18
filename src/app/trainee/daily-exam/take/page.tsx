"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy, Clock, CheckCircle2, XCircle, AlertCircle,
  ArrowRight, ChevronLeft, ChevronRight, Send, Loader2
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  topic: string;
  difficulty: string;
}

interface Exam {
  id: string;
  title: string;
  role: string;
  difficulty: string;
  timeLimit: number;
  questionCount: number;
  questions: Question[];
}

export default function TakeExamPage() {
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [startTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = useCallback(async (auto = false) => {
    if (!exam) return;
    if (submitting) return;
    setSubmitting(true);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const answerList = exam.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] || null,
    }));

    try {
      const res = await fetch("/api/exams/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: exam.id, answers: answerList, timeTaken }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.attemptId) {
          router.push(`/trainee/daily-exam/results/${data.attemptId}`);
          return;
        }
        throw new Error(data.error || "Submission failed");
      }

      const data = await res.json();
      router.push(`/trainee/daily-exam/results/${data.attemptId}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit exam");
      setSubmitting(false);
    }
  }, [exam, answers, startTime, submitting, router]);

  useEffect(() => {
    async function loadExam() {
      try {
        const res = await fetch("/api/exams/daily", { method: "POST" });
        if (!res.ok) throw new Error("Failed to load exam");
        const data = await res.json();
        if (!data.exam) throw new Error("No exam available");
        setExam(data.exam);
        setTimeLeft(data.exam.timeLimit * 60);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, []);

  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [exam, handleSubmit]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-700 mx-auto" />
          <p className="text-sm text-muted font-medium">Preparing your exam questions…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-display font-bold text-xl text-charcoal-800">Something went wrong</h2>
        <p className="text-sm text-muted">{error}</p>
        <button onClick={() => router.push("/trainee/daily-exam")} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!exam) return null;

  const q = exam.questions[currentQ];
  const answered = Object.keys(answers).length;
  const isTimeLow = timeLeft <= 120;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-border shadow-card">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-emerald-700" />
          <div>
            <h1 className="font-display font-bold text-sm text-charcoal-800">{exam.title}</h1>
            <p className="text-xs text-muted">{answered}/{exam.questionCount} answered</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm transition-colors ${
          isTimeLow ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${((currentQ + 1) / exam.questionCount) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 text-sm font-bold flex items-center justify-center">
            {currentQ + 1}
          </span>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-sage-50 text-charcoal-600 font-medium border border-border">{q.topic}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                q.difficulty === "EASY" ? "bg-green-50 text-green-700" :
                q.difficulty === "HARD" ? "bg-red-50 text-red-700" :
                "bg-amber-50 text-amber-700"
              }`}>{q.difficulty}</span>
            </div>
            <p className="text-base font-medium text-charcoal-800 leading-relaxed">{q.question}</p>
          </div>
        </div>

        <div className="space-y-3">
          {(["A", "B", "C", "D"] as const).map(key => {
            const text = q[`option${key}` as keyof Question] as string;
            const selected = answers[q.id] === key;
            return (
              <button
                key={key}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: key }))}
                className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                  selected
                    ? "bg-emerald-50 border-emerald-400 shadow-sm"
                    : "bg-background border-border hover:bg-sage-50 hover:border-emerald-200"
                }`}
              >
                <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                  selected ? "bg-emerald-700 text-white" : "bg-white border border-border text-charcoal-600"
                }`}>{key}</span>
                <span className={`text-sm leading-relaxed pt-0.5 ${selected ? "text-charcoal-800 font-medium" : "text-charcoal-700"}`}>{text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="flex flex-wrap gap-2 justify-center">
        {exam.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
              i === currentQ ? "bg-emerald-700 text-white scale-110" :
              answers[exam.questions[i].id] ? "bg-emerald-100 text-emerald-800" :
              "bg-white border border-border text-charcoal-500 hover:bg-sage-50"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-charcoal-600 hover:bg-sage-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {currentQ < exam.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(q => q + 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-800 text-white text-sm font-medium hover:bg-charcoal-700 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition"
          >
            <Send className="w-4 h-4" /> Submit Exam
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-elevated space-y-5 border border-border">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal-800 mb-2">Submit Exam?</h3>
              <p className="text-sm text-muted">
                You have answered <strong>{answered}</strong> of <strong>{exam.questionCount}</strong> questions.
                {answered < exam.questionCount && (
                  <span className="block mt-1 text-amber-600 font-medium">{exam.questionCount - answered} question(s) unanswered.</span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-charcoal-700 hover:bg-sage-50 transition"
              >
                Review More
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleSubmit(); }}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
