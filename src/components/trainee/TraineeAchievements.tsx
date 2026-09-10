"use client";

import React from "react";
import { Award, ShieldCheck, CheckCircle2, Flame, Star, Target, Sparkles, FolderGit2 } from "lucide-react";

interface TraineeAchievementsProps {
  skillsCount: number;
  hasTarget: boolean;
  hasProjects: boolean;
  completedFollowUpsCount: number;
  verifiedCertificationsCount: number;
  hasVerifiedEmployment: boolean;
}

export default function TraineeAchievements({
  skillsCount,
  hasTarget,
  hasProjects,
  completedFollowUpsCount,
  verifiedCertificationsCount,
  hasVerifiedEmployment,
}: TraineeAchievementsProps) {
  const badges = [
    {
      id: "target_setter",
      name: "Goal Setter",
      desc: "Defined active Career Target & Target Role",
      unlocked: hasTarget,
      icon: Target,
      xp: 150,
    },
    {
      id: "skill_ascender",
      name: "Skill Ascender",
      desc: "Documented 5+ verified or self-reported skills",
      unlocked: skillsCount >= 5,
      icon: Award,
      xp: 200,
    },
    {
      id: "project_builder",
      name: "Portfolio Builder",
      desc: "Attached practical project evidence to profile",
      unlocked: hasProjects,
      icon: FolderGit2,
      xp: 250,
    },
    {
      id: "credentialed",
      name: "Certified Specialist",
      desc: "Earned accredited vocational credential",
      unlocked: verifiedCertificationsCount > 0,
      icon: ShieldCheck,
      xp: 300,
    },
    {
      id: "followup_champ",
      name: "Longitudinal Champion",
      desc: "Completed 30d/90d/180d employment check-in",
      unlocked: completedFollowUpsCount > 0,
      icon: Flame,
      xp: 350,
    },
    {
      id: "employer_verified",
      name: "Verified Placement",
      desc: "Confirmed employment record by HR employer",
      unlocked: hasVerifiedEmployment,
      icon: CheckCircle2,
      xp: 400,
    },
  ];

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const totalXp = unlockedBadges.reduce((acc, b) => acc + b.xp, 0);
  const maxPossibleXp = badges.reduce((acc, b) => acc + b.xp, 0);
  const progressPct = Math.min(100, Math.round((totalXp / maxPossibleXp) * 100));

  // Determine Level Tier
  let levelTitle = "Novice Explorer";
  let currentLevel = 1;
  if (totalXp >= 1000) {
    levelTitle = "Career Luminary";
    currentLevel = 4;
  } else if (totalXp >= 600) {
    levelTitle = "Senior Practitioner";
    currentLevel = 3;
  } else if (totalXp >= 300) {
    levelTitle = "Emerging Talent";
    currentLevel = 2;
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Career Milestones & Badges
              </h3>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Level {currentLevel}: {levelTitle}
              </span>
            </div>
            <p className="text-xs text-muted">
              Earn career credibility badges by recording skills, verifications, and longitudinal check-ins.
            </p>
          </div>
        </div>

        <div className="text-right sm:self-center">
          <span className="font-display font-black text-lg text-charcoal-800">{totalXp}</span>
          <span className="text-xs text-muted font-normal"> / {maxPossibleXp} XP</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-muted">
          <span>Overall Progression</span>
          <span className="font-semibold text-emerald-800">{progressPct}% Complete</span>
        </div>
        <div className="w-full h-2 bg-sage-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 ${
                badge.unlocked
                  ? "bg-sage-50/70 border-emerald-300 text-charcoal-800 shadow-xs"
                  : "bg-charcoal-50/50 border-border/60 text-muted opacity-60"
              }`}
            >
              <div
                className={`p-2.5 rounded-full ${
                  badge.unlocked
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-charcoal-200 text-charcoal-500"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-display font-bold text-xs leading-tight">
                  {badge.name}
                </p>
                <span className="text-[10px] font-mono font-semibold text-emerald-700">
                  +{badge.xp} XP
                </span>
              </div>
              <p className="text-[10px] text-muted line-clamp-2 leading-tight">
                {badge.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
