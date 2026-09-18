"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { READING_PASSAGES, ReadingComprehension } from "@/lib/communication-content";

export default function ReadingComprehensionPage() {
  const [passage] = useState<ReadingComprehension>(READING_PASSAGES[0]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    passage.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correct++;
    });
    return Math.round((correct / passage.questions.length) * 100);
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    const score = calculateScore();

    try {
      await fetch("/api/communication/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "READING",
          score,
          maxScore: 100,
          response: answers,
          feedback: `Completed reading '${passage.title}' with ${score}% comprehension accuracy.`,
          timeSpent: seconds,
        }),
      });
    } catch (err) {
      console.error("Error submitting reading attempt:", err);
    }
  };

  const allAnswered = passage.questions.every((_, idx) => answers[idx] !== undefined);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/trainee/communication"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Communication Hub
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* Article Container */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-stone-100 pb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            {passage.topic} • {passage.readTime}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 leading-tight">
            {passage.title}
          </h1>
        </div>

        {/* Text Passage */}
        <div className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
          {passage.passage.split("\n\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>

      {/* Comprehension Questions */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex items-center gap-2 text-sm font-bold font-serif text-stone-900 border-b border-stone-100 pb-4">
          <BookOpen className="w-5 h-5 text-blue-700" /> Comprehension Questions
        </div>

        {passage.questions.map((q, qIdx) => {
          const chosen = answers[qIdx];
          const isCorrect = chosen === q.correctIndex;

          return (
            <div key={qIdx} className="space-y-3">
              <p className="font-semibold text-stone-900 text-sm sm:text-base">
                {qIdx + 1}. {q.question}
              </p>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = chosen === optIdx;
                  const isAnswerKey = optIdx === q.correctIndex;

                  let style = "border-stone-200 hover:border-blue-600 hover:bg-blue-50/20";
                  if (isSubmitted) {
                    if (isAnswerKey) {
                      style = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                    } else if (isSelected) {
                      style = "border-red-400 bg-red-50 text-red-900";
                    } else {
                      style = "border-stone-200 opacity-50";
                    }
                  } else if (isSelected) {
                    style = "border-blue-700 bg-blue-50 text-blue-950 font-medium";
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${style}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSubmitted && isAnswerKey && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {isSubmitted && isSelected && !isAnswerKey && (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 leading-relaxed">
                  <span className="font-semibold text-stone-800">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}

        {/* Submit or Score Footer */}
        <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-semibold text-sm shadow-md disabled:opacity-40 transition"
            >
              Submit Comprehension Answers <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-medium">Final Score</p>
                  <p className="text-xl font-bold text-stone-800">{calculateScore()}%</p>
                </div>
              </div>

              <Link
                href="/trainee/communication"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition"
              >
                Return to Hub <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
