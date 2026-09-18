"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PenTool,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { WRITING_PROMPTS, WritingPrompt } from "@/lib/communication-content";

export default function WritingPracticePage() {
  const [prompt] = useState<WritingPrompt>(WRITING_PROMPTS[0]);
  const [userText, setUserText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

  const handleEvaluate = async () => {
    if (!userText.trim() || wordCount < 15) return;
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/communication/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WRITING",
          prompt: prompt.prompt,
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
            type: "WRITING",
            score: data.evaluation.totalScore || 85,
            maxScore: 100,
            response: userText,
            feedback: JSON.stringify(data.evaluation),
          }),
        });
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCopyRewrite = () => {
    if (evaluation?.polishedVersion) {
      navigator.clipboard.writeText(evaluation.polishedVersion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        <span className="text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full">
          {prompt.tone}
        </span>
      </div>

      {/* Scenario Prompt Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-800 uppercase tracking-wider">
          <PenTool className="w-4 h-4" /> Scenario & Prompt
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
          {prompt.scenario}
        </h1>

        <p className="text-stone-700 text-sm leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200 font-medium">
          {prompt.prompt}
        </p>

        {/* Guidelines */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Professional Guidelines
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
            {prompt.guidelines.map((g, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Drafting Editor */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-stone-800">
            Your Response
          </label>
          <span className="text-xs text-stone-400 font-medium">
            {wordCount} words
          </span>
        </div>

        <textarea
          rows={8}
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Subject: ...&#10;&#10;Dear ...,"
          className="w-full p-4 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm text-stone-800 font-sans leading-relaxed resize-y"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-stone-400">
            {wordCount < 15 ? "Write at least 15 words for AI evaluation" : "Ready to evaluate"}
          </p>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || wordCount < 15}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-800 hover:bg-violet-900 text-white font-semibold text-xs shadow-md disabled:opacity-40 transition"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Evaluating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Evaluate & Get Feedback
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Evaluation Report */}
      {evaluation && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in-50 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-3 py-1 rounded-full">
                AI Evaluation Report
              </span>
              <h2 className="text-2xl font-bold font-serif text-stone-900 mt-2">
                Overall Communication Score: {evaluation.totalScore}/100
              </h2>
              <p className="text-sm text-stone-500 mt-1">{evaluation.verdict}</p>
            </div>

            <div className="text-4xl font-black font-serif text-violet-900">
              {evaluation.totalScore}%
            </div>
          </div>

          {/* Sub Scores */}
          {evaluation.scores && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Tone</p>
                <p className="text-lg font-bold text-stone-800">{evaluation.scores.tone}/25</p>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Clarity</p>
                <p className="text-lg font-bold text-stone-800">{evaluation.scores.clarity}/25</p>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Grammar</p>
                <p className="text-lg font-bold text-stone-800">{evaluation.scores.grammar}/25</p>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Actionability</p>
                <p className="text-lg font-bold text-stone-800">{evaluation.scores.alignment}/25</p>
              </div>
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Key Strengths
              </p>
              <ul className="space-y-1 text-xs text-stone-700">
                {evaluation.strengths?.map((s: string, idx: number) => (
                  <li key={idx}>• {s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" /> Improvement Tips
              </p>
              <ul className="space-y-1 text-xs text-stone-700">
                {evaluation.improvements?.map((imp: string, idx: number) => (
                  <li key={idx}>• {imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Polished Rewrite */}
          {evaluation.polishedVersion && (
            <div className="p-5 rounded-2xl bg-violet-50/50 border border-violet-200 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-violet-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-700" /> Executive Polished Rewrite
                </p>
                <button
                  onClick={handleCopyRewrite}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-violet-800 hover:text-violet-950 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Rewrite"}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed font-mono bg-white p-4 rounded-xl border border-violet-100">
                {evaluation.polishedVersion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
