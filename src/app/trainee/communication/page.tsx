import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  MessageSquare,
  BookOpen,
  Sparkles,
  PenTool,
  Mic,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
  Zap,
  TrendingUp,
} from "lucide-react";

export default async function CommunicationHubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Fetch user attempts
  const [todayAttempts, allAttempts] = await Promise.all([
    prisma.communicationAttempt.findMany({
      where: {
        userId: user.id,
        completedAt: { gte: todayStart },
      },
      include: {
        activity: { select: { type: true } },
      },
    }),
    prisma.communicationAttempt.findMany({
      where: { userId: user.id },
      include: {
        activity: { select: { type: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 50,
    }),
  ]);

  const completedTypes = new Set(todayAttempts.map((a) => a.activity.type));

  const totalExercises = allAttempts.length;
  const avgScore =
    totalExercises > 0
      ? Math.round(
          allAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalExercises
        )
      : 0;

  const modules = [
    {
      id: "grammar",
      type: "GRAMMAR",
      title: "Grammar & Precision",
      desc: "Master professional workplace phrasing, subject-verb agreement, and error correction.",
      icon: CheckCircle2,
      accent: "from-amber-600 to-amber-800",
      bgLight: "bg-amber-50",
      textDark: "text-amber-800",
      borderCol: "border-amber-200",
      badge: "6 Exercises",
      href: "/trainee/communication/grammar",
      isCompleted: completedTypes.has("GRAMMAR"),
    },
    {
      id: "vocabulary",
      type: "VOCABULARY",
      title: "Vocabulary Builder",
      desc: "Learn corporate, executive, and high-impact vocabulary with definitions and context quizzes.",
      icon: Sparkles,
      accent: "from-emerald-600 to-emerald-800",
      bgLight: "bg-emerald-50",
      textDark: "text-emerald-800",
      borderCol: "border-emerald-200",
      badge: "Word of the Day",
      href: "/trainee/communication/vocabulary",
      isCompleted: completedTypes.has("VOCABULARY"),
    },
    {
      id: "reading",
      type: "READING",
      title: "Reading Comprehension",
      desc: "Read real-world business and technical scenarios and test your retention & critical analysis.",
      icon: BookOpen,
      accent: "from-blue-600 to-blue-800",
      bgLight: "bg-blue-50",
      textDark: "text-blue-800",
      borderCol: "border-blue-200",
      badge: "3 Min Read",
      href: "/trainee/communication/reading",
      isCompleted: completedTypes.has("READING"),
    },
    {
      id: "writing",
      type: "WRITING",
      title: "Workplace Writing & Email",
      desc: "Practice drafting client emails, sprint updates, and memos with instant AI scoring & polished rewrites.",
      icon: PenTool,
      accent: "from-violet-600 to-violet-800",
      bgLight: "bg-violet-50",
      textDark: "text-violet-800",
      borderCol: "border-violet-200",
      badge: "AI Evaluated",
      href: "/trainee/communication/writing",
      isCompleted: completedTypes.has("WRITING"),
    },
    {
      id: "interview",
      type: "INTERVIEW",
      title: "Interview Communication",
      desc: "Sharpen behavioral & situational interview answers using the structured STAR framework.",
      icon: Mic,
      accent: "from-rose-600 to-rose-800",
      bgLight: "bg-rose-50",
      textDark: "text-rose-800",
      borderCol: "border-rose-200",
      badge: "STAR Method",
      href: "/trainee/communication/interview",
      isCompleted: completedTypes.has("INTERVIEW"),
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" /> Communication Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-white">
            Daily Communication & Soft Skills
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Enhance your professional fluency, corporate email etiquette, vocabulary, and STAR interview delivery with daily AI-guided micro-practices.
          </p>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Completed Today</p>
            <p className="text-xl font-bold text-stone-800">
              {todayAttempts.length} / 5
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Average Score</p>
            <p className="text-xl font-bold text-stone-800">{avgScore}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Total Sessions</p>
            <p className="text-xl font-bold text-stone-800">{totalExercises}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Fluency Tier</p>
            <p className="text-xl font-bold text-stone-800">
              {avgScore >= 80 ? "Advanced" : avgScore >= 60 ? "Proficient" : "Foundational"}
            </p>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-stone-900">
            Today's Learning Modules
          </h2>
          <span className="text-xs font-semibold text-stone-500">
            5 Daily Tracks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="group relative bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-700/30 transition-all duration-200 flex flex-col justify-between p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl ${mod.bgLight} ${mod.textDark} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {mod.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                        {mod.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-serif text-stone-900 group-hover:text-amber-900 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100 mt-6 flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">
                    {mod.isCompleted ? "Practice again" : "Daily workout"}
                  </span>
                  <Link
                    href={mod.href}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 hover:text-amber-950 group-hover:translate-x-0.5 transition"
                  >
                    {mod.isCompleted ? "Review" : "Start Practice"}{" "}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
