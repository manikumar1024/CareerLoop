import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import SkillBadge from "@/components/SkillBadge";
import { analyzeSkillGap, INDUSTRY_ROLE_TAXONOMY } from "@/lib/ai-service";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  Compass, 
  Target,
  Award,
  Layers,
  Clock
} from "lucide-react";

export const revalidate = 0;

export default async function TraineeRecommendationsPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!trainee) return null;

  const selectedRole = searchParams.role || trainee.targetRole || "Full Stack Web Developer";
  const traineeSkillsFormatted = trainee.skills.map((s) => ({
    name: s.skill.name,
    proficiency: s.proficiencyLevel,
    verified: s.verifiedByAssessment || s.verifiedByEmployer,
  }));

  const analysis = await analyzeSkillGap({
    targetRole: selectedRole,
    traineeSkills: traineeSkillsFormatted,
  });

  const availableRoles = Object.keys(INDUSTRY_ROLE_TAXONOMY);

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable AI Outcome Intelligence</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          AI Skill Gap Analyzer & Learning Pathways
        </h1>
        <p className="text-xs text-muted">
          Compare your verified competencies against industry demand benchmarks. AI recommendations are transparent and grounded in standard role taxonomies.
        </p>
      </div>

      {/* Target Role Selector Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Select Target Industry Role Benchmark:
        </label>
        
        <div className="flex flex-wrap gap-2">
          {availableRoles.map((roleName) => (
            <a
              key={roleName}
              href={`/trainee/recommendations?role=${encodeURIComponent(roleName)}`}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                selectedRole === roleName
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-sage-50 text-charcoal-700 hover:bg-sage-100 border border-sage-200"
              }`}
            >
              {roleName}
            </a>
          ))}
        </div>
      </div>

      {/* Main Analysis Result Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        
        {/* Score & Rationale Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-800" />
              <h3 className="font-display font-bold text-xl text-charcoal-800">
                {analysis.targetRole}
              </h3>
            </div>
            <p className="text-xs text-muted max-w-xl leading-relaxed">
              {analysis.explainableRationale}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-center shrink-0 min-w-[140px]">
            <p className="text-[10px] uppercase font-bold text-muted">Role Alignment</p>
            <p className="font-display font-extrabold text-3xl sm:text-4xl text-emerald-800 mt-0.5">
              {analysis.matchedScore}%
            </p>
            <p className="text-[10px] text-muted font-medium">Competency match</p>
          </div>
        </div>

        {/* Skill Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Matched Skills */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Demonstrated & Matched Skills ({analysis.matchedSkills.length})</span>
            </div>

            {analysis.matchedSkills.length === 0 ? (
              <p className="text-xs text-muted">No matching skills detected for this target role yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.matchedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-medium shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Missing Critical Skills */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Missing Critical Skills ({analysis.missingCriticalSkills.length})</span>
            </div>

            {analysis.missingCriticalSkills.length === 0 ? (
              <p className="text-xs text-emerald-800 font-semibold">
                🎉 All core competencies for this role are present in your profile!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.missingCriticalSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-medium shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Recommended 3-Phase Learning Pathway */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-800" />
            <h4 className="font-display font-bold text-base text-charcoal-800">
              Recommended Modular Upskilling Pathway
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.recommendedLearningPath.map((phase, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-border hover:border-emerald-300 transition shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      PHASE 0{idx + 1}
                    </span>
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{phase.estimatedWeeks} wks
                    </span>
                  </div>

                  <h5 className="font-display font-bold text-sm text-charcoal-800 mb-2">
                    {phase.stage}
                  </h5>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {phase.skills.map((sk, sidx) => (
                      <span
                        key={sidx}
                        className="text-[10px] px-2 py-0.5 rounded bg-sage-50 text-charcoal-800 border border-sage-200 font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-muted bg-sage-50/50 p-2.5 rounded-xl border border-sage-200/60 leading-relaxed">
                  {phase.resourceRecommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
