"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  BookOpen,
} from "lucide-react";
import { INTERVIEW_PROMPTS, InterviewPrompt } from "@/lib/communication-content";

export default function InterviewPracticePage() {
  const [prompts] = useState<InterviewPrompt[]>(INTERVIEW_PROMPTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userText, setUserText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const currentPrompt = prompts[currentIndex];
  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

  const handleEvaluate = async () => {
    if (!userText.trim() || wordCount < 20) return;
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/communication/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "INTERVIEW",
          prompt: currentPrompt.question,
          userText,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);

        // Record attempt to DB
        await fetch("/api/communication/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "INTERVIEW",
            score: data.evaluation.totalScore || 85,
            maxScore: 100,
            response: userText,
            feedback: JSON.stringify(data.evaluation),
          }),
        });
      }
    } catch (err) {
      console.error("Interview evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

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
        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">
          {currentPrompt.category} Question
        </span>
      </div>

      {/* Question & STAR Guide */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
          <Mic className="w-4 h-4" /> Interview Prompt
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-snug">
          "{currentPrompt.question}"
        </h1>

        {/* STAR Framework Help */}
        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-rose-700" /> STAR Answer Blueprint
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-rose-800 block mb-0.5">S — Situation</span>
              <p className="text-stone-600">{currentPrompt.starFrameworkGuide.situation}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-rose-800 block mb-0.5">T — Task</span>
              <p className="text-stone-600">{currentPrompt.starFrameworkGuide.task}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-rose-800 block mb-0.5">A — Action</span>
              <p className="text-stone-600">{currentPrompt.starFrameworkGuide.action}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-rose-800 block mb-0.5">R — Result</span>
              <p className="text-stone-600">{currentPrompt.starFrameworkGuide.result}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Response Box */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-stone-800">
            Your STAR Response
          </label>
          <span className="text-xs text-stone-400 font-medium">
            {wordCount} words
          </span>
        </div>

        <textarea
          rows={9}
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Situation: In my role at...&#10;Task: My goal was to...&#10;Action: I initiated...&#10;Result: Consequently, we achieved..."
          className="w-full p-4 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 text-sm text-stone-800 font-sans leading-relaxed resize-y"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-stone-400">
            {wordCount < 20 ? "Provide at least 20 words for detailed STAR analysis" : "Ready to evaluate"}
          </p>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || wordCount < 20}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-semibold text-xs shadow-md disabled:opacity-40 transition"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing STAR Delivery...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Evaluate STAR Answer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evaluation Feedback */}
      {evaluation && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in-50 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
                STAR Interview Evaluation
              </span>
              <h2 className="text-2xl font-bold font-serif text-stone-900 mt-2">
                Overall Interview Rating: {evaluation.totalScore}/100
              </h2>
            </div>
            <div className="text-4xl font-black font-serif text-rose-900">
              {evaluation.totalScore}%
            </div>
          </div>

          {/* STAR Breakdown */}
          {evaluation.starBreakdown && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                STAR Element Breakdown
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-stone-800 block mb-1">Situation (Context)</span>
                  <p className="text-stone-600">{evaluation.starBreakdown.situationFeedback}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-stone-800 block mb-1">Task (Responsibility)</span>
                  <p className="text-stone-600">{evaluation.starBreakdown.taskFeedback}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-stone-800 block mb-1">Action (Initiative)</span>
                  <p className="text-stone-600">{evaluation.starBreakdown.actionFeedback}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-stone-800 block mb-1">Result (Impact)</span>
                  <p className="text-stone-600">{evaluation.starBreakdown.resultFeedback}</p>
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Strengths
              </p>
              <ul className="space-y-1 text-xs text-stone-700">
                {evaluation.strengths?.map((s: string, idx: number) => (
                  <li key={idx}>• {s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" /> Coaching Tips
              </p>
              <ul className="space-y-1 text-xs text-stone-700">
                {evaluation.improvements?.map((imp: string, idx: number) => (
                  <li key={idx}>• {imp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
