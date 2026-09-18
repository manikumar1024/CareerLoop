"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { GRAMMAR_EXERCISES, GrammarExercise } from "@/lib/communication-content";

export default function GrammarPracticePage() {
  const [exercises] = useState<GrammarExercise[]>(GRAMMAR_EXERCISES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentExercise = exercises[currentIndex];
  const selectedIndex = selectedOptions[currentIndex];
  const isAnswered = selectedIndex !== undefined;
  const isCorrect = isAnswered && selectedIndex === currentExercise.correctIndex;

  const handleSelect = (optIndex: number) => {
    if (showExplanation[currentIndex]) return; // prevent changing after submitted
    setSelectedOptions((prev) => ({ ...prev, [currentIndex]: optIndex }));
    setShowExplanation((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishExercise();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    exercises.forEach((ex, idx) => {
      if (selectedOptions[idx] === ex.correctIndex) {
        correct++;
      }
    });
    return Math.round((correct / exercises.length) * 100);
  };

  const finishExercise = async () => {
    setIsCompleted(true);
    setIsSubmitting(true);
    const score = calculateScore();

    try {
      await fetch("/api/communication/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GRAMMAR",
          score,
          maxScore: 100,
          response: selectedOptions,
          feedback: `Scored ${score}% in Grammar & Precision exercise.`,
        }),
      });
    } catch (err) {
      console.error("Failed to record grammar submission:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setSelectedOptions({});
    setShowExplanation({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const finalScore = calculateScore();
    const correctCount = exercises.filter(
      (ex, idx) => selectedOptions[idx] === ex.correctIndex
    ).length;

    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 text-center shadow-lg space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full">
              Session Completed
            </span>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mt-3">
              Grammar & Precision Score
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              You answered {correctCount} out of {exercises.length} questions correctly.
            </p>
          </div>

          <div className="text-5xl font-extrabold font-serif text-stone-900">
            {finalScore}%
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-stone-300 font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              <RotateCcw className="w-4 h-4" /> Practice Again
            </button>
            <Link
              href="/trainee/communication"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold shadow-md transition"
            >
              Back to Communication Hub <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/trainee/communication"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Exit Practice
        </Link>
        <span className="text-xs font-bold text-stone-500">
          Question {currentIndex + 1} of {exercises.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-amber-700 h-full transition-all duration-300 rounded-full"
          style={{
            width: `${((currentIndex + 1) / exercises.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" /> Category: {currentExercise.category.replace("_", " ")}
        </div>

        <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 leading-snug">
          {currentExercise.sentence}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentExercise.options.map((opt, idx) => {
            const isChosen = selectedIndex === idx;
            const isAnswerKey = idx === currentExercise.correctIndex;
            const showResult = showExplanation[currentIndex];

            let btnStyle = "border-stone-200 hover:border-amber-700/50 hover:bg-amber-50/20";
            if (showResult) {
              if (isAnswerKey) {
                btnStyle = "border-emerald-500 bg-emerald-50/80 text-emerald-900 font-semibold";
              } else if (isChosen && !isAnswerKey) {
                btnStyle = "border-red-400 bg-red-50 text-red-900";
              } else {
                btnStyle = "border-stone-200 opacity-60";
              }
            } else if (isChosen) {
              btnStyle = "border-amber-700 bg-amber-50 text-amber-950 font-medium";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start justify-between gap-3 ${btnStyle}`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-stone-800 leading-relaxed">{opt}</span>
                </div>
                {showResult && isAnswerKey && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {showResult && isChosen && !isAnswerKey && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Rule Box */}
        {showExplanation[currentIndex] && (
          <div className="mt-6 p-5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2 animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-700" /> Explanation & Rule
            </div>
            <p className="text-sm text-stone-700 leading-relaxed font-medium">
              {currentExercise.explanation}
            </p>
            <p className="text-xs text-stone-500 italic mt-1">
              Rule: {currentExercise.rule}
            </p>
          </div>
        )}

        {/* Action Button */}
        {showExplanation[currentIndex] && (
          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm shadow-md transition"
            >
              {currentIndex < exercises.length - 1 ? "Next Question" : "Complete Exercise"}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
