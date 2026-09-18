"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { VOCABULARY_WORDS, VocabularyWord } from "@/lib/communication-content";

export default function VocabularyPage() {
  const [words] = useState<VocabularyWord[]>(VOCABULARY_WORDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentWord = words[currentIndex];
  const selectedAnswer = quizAnswers[currentIndex];
  const isAnswered = selectedAnswer !== undefined;

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectQuiz = (optIndex: number) => {
    if (showResult[currentIndex]) return;
    setQuizAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
    setShowResult((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishVocab();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    words.forEach((w, idx) => {
      if (quizAnswers[idx] === w.quizCorrectIndex) correct++;
    });
    return Math.round((correct / words.length) * 100);
  };

  const finishVocab = async () => {
    setIsCompleted(true);
    const score = calculateScore();
    try {
      await fetch("/api/communication/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "VOCABULARY",
          score,
          maxScore: 100,
          response: quizAnswers,
          feedback: `Completed daily vocabulary workout with ${score}% quiz accuracy.`,
        }),
      });
    } catch (err) {
      console.error("Failed to record vocab completion:", err);
    }
  };

  if (isCompleted) {
    const finalScore = calculateScore();
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 text-center shadow-lg space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              Vocabulary Workout Complete
            </span>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mt-3">
              Words Mastered Today
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              You reviewed {words.length} corporate vocabulary words and scored {finalScore}% on retention.
            </p>
          </div>

          <div className="text-5xl font-extrabold font-serif text-stone-900">
            {finalScore}%
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/trainee/communication"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-md transition"
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
          <ChevronLeft className="w-4 h-4" /> Exit Vocabulary
        </Link>
        <span className="text-xs font-bold text-stone-500">
          Word {currentIndex + 1} of {words.length}
        </span>
      </div>

      {/* Word Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                  {currentWord.word}
                </h1>
                <button
                  onClick={() => handleSpeak(currentWord.word)}
                  title="Pronounce"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                {currentWord.phonetic} • <span className="italic">{currentWord.partOfSpeech}</span>
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Corporate Word
          </span>
        </div>

        {/* Definition */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
            Definition
          </p>
          <p className="text-stone-800 font-medium text-sm leading-relaxed">
            {currentWord.definition}
          </p>
        </div>

        {/* Workplace Example */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
            Workplace Example
          </p>
          <p className="text-stone-800 text-sm italic leading-relaxed">
            "{currentWord.workplaceExample}"
          </p>
        </div>

        {/* Synonyms & Antonyms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-stone-200">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Synonyms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentWord.synonyms.map((syn, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium"
                >
                  {syn}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-stone-200">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Antonyms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentWord.antonyms.map((ant, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-medium"
                >
                  {ant}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Quiz */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-emerald-600" /> Retention Check
          </div>
          <p className="font-semibold text-stone-800 text-sm">
            {currentWord.quizQuestion}
          </p>

          <div className="space-y-2">
            {currentWord.quizOptions.map((opt, idx) => {
              const isChosen = selectedAnswer === idx;
              const isAnswerKey = idx === currentWord.quizCorrectIndex;
              const revealed = showResult[currentIndex];

              let style = "border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/20";
              if (revealed) {
                if (isAnswerKey) {
                  style = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                } else if (isChosen) {
                  style = "border-red-400 bg-red-50 text-red-900";
                } else {
                  style = "border-stone-200 opacity-50";
                }
              } else if (isChosen) {
                style = "border-emerald-700 bg-emerald-50";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectQuiz(idx)}
                  disabled={revealed}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                >
                  <span className="text-stone-800">{opt}</span>
                  {revealed && isAnswerKey && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  )}
                  {revealed && isChosen && !isAnswerKey && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Word
          </button>
          <button
            onClick={handleNext}
            disabled={!showResult[currentIndex]}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-md disabled:opacity-40 transition"
          >
            {currentIndex < words.length - 1 ? "Next Word" : "Complete Workout"}{" "}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
