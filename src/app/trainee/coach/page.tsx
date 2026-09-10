import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { Sparkles, MessageCircle, Target, ArrowRight, BookOpen, Briefcase, Award, AlertCircle } from "lucide-react";
import { analyzeSkillGap, INDUSTRY_ROLE_TAXONOMY, evaluateEmployabilityRisk } from "@/lib/ai-service";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 0;

export default async function AICareerCoachPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      skills: { include: { skill: true } },
      certifications: true,
      enrollments: { include: { program: true, assessments: true } },
      employmentRecords: { include: { employer: true } },
      careerTarget: true,
      projects: true,
      externalProfiles: true,
    },
  });

  if (!trainee) return null;

  // Build context from real data
  const traineeSkills = trainee.skills.map(s => ({
    name: s.skill.name,
    proficiency: s.proficiencyLevel,
    verified: s.verifiedByAssessment || s.verifiedByEmployer,
  }));

  const targetRole = trainee.careerTarget?.targetRole || null;

  // Run skill gap analysis if target is set
  const skillGapAnalysis = targetRole
    ? await analyzeSkillGap({ targetRole, traineeSkills })
    : null;

  // Employability risk using real data only
  const activeEnrollment = trainee.enrollments[0];
  const assessment = activeEnrollment?.assessments[0];
  const riskReport = evaluateEmployabilityRisk({
    traineeId: trainee.traineeId,
    attendancePercentage: activeEnrollment?.attendancePercentage ?? undefined,
    assessmentScore: assessment?.scoreObtained ?? undefined,
    skillsCount: trainee.skills.length,
    isEmployed: trainee.employmentRecords.some(e => e.isCurrent),
    hasCertifiedCredentials: trainee.certifications.some(
      c => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED"
    ),
  });

  // Build "next best action" from profile state
  const nextActions: { priority: number; action: string; reason: string; href: string }[] = [];

  if (!trainee.careerTarget) {
    nextActions.push({
      priority: 1,
      action: "Set your Career Target",
      reason: "Without a defined target role, career matching, skill gap analysis, and job recommendations cannot be personalized.",
      href: "/trainee/career-target",
    });
  }

  if (trainee.skills.length === 0) {
    nextActions.push({
      priority: 2,
      action: "Add your skills to your profile",
      reason: "Your skill profile is empty. Add at least 5 skills to enable career matching and job recommendations.",
      href: "/trainee/skills",
    });
  }

  if (skillGapAnalysis && skillGapAnalysis.missingCriticalSkills.length > 0) {
    nextActions.push({
      priority: 3,
      action: `Close skill gap: learn ${skillGapAnalysis.missingCriticalSkills[0]}`,
      reason: `${skillGapAnalysis.missingCriticalSkills[0]} is a required core skill for ${targetRole} that is currently missing from your profile.`,
      href: "/trainee/recommendations",
    });
  }

  if (trainee.certifications.length === 0) {
    nextActions.push({
      priority: 4,
      action: "Complete a certification",
      reason: "Verified credentials significantly improve your employability score and employer confidence.",
      href: "/trainee/training",
    });
  }

  if (trainee.projects.length === 0) {
    nextActions.push({
      priority: 5,
      action: "Add a project to your Career Identity",
      reason: "Portfolio projects provide practical evidence of your skills — stronger than self-declared skills alone.",
      href: "/trainee/identity",
    });
  }

  const githubProfile = trainee.externalProfiles.find(ep => ep.platform === "GITHUB");
  if (!githubProfile?.isConnected) {
    nextActions.push({
      priority: 6,
      action: "Connect your GitHub profile",
      reason: "GitHub provides additional evidence for technical skills through your repositories and project activity.",
      href: "/trainee/identity",
    });
  }

  // Sort by priority
  nextActions.sort((a, b) => a.priority - b.priority);
  const topAction = nextActions[0] || null;

  const hasGemini = !!process.env.GEMINI_API_KEY;

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          AI Career Coach
        </h1>
        <p className="text-xs text-muted">
          Evidence-based guidance grounded in your actual CareerLoop profile — skills, training, certifications, and career target.
        </p>
        {!hasGemini && (
          <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
            Running in deterministic mode (no Gemini API key configured). Analysis is based on standard skill taxonomies and your profile data.
          </div>
        )}
      </div>

      {/* Next Best Action */}
      {topAction && (
        <div className="bg-emerald-800 text-white rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
            Your Next Best Action
          </p>
          <h2 className="font-display font-bold text-xl sm:text-2xl mb-3">
            {topAction.action}
          </h2>
          <p className="text-sm text-emerald-100 leading-relaxed mb-4">
            {topAction.reason}
          </p>
          <a href={topAction.href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-emerald-800 text-xs font-semibold hover:bg-emerald-50 transition">
            Take Action
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Profile Status Summary */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border/50">
          <Sparkles className="w-5 h-5 text-emerald-700" />
          <h3 className="font-display font-bold text-base text-charcoal-800">Profile Intelligence</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-sage-50 border border-sage-200 text-center">
            <p className="font-display font-bold text-xl text-charcoal-800">{trainee.skills.length}</p>
            <p className="text-[11px] text-muted">Skills</p>
            <p className="text-[10px] text-emerald-700 font-semibold">
              {trainee.skills.filter(s => s.verifiedByAssessment || s.verifiedByEmployer).length} verified
            </p>
          </div>
          <div className="p-3 rounded-xl bg-sage-50 border border-sage-200 text-center">
            <p className="font-display font-bold text-xl text-charcoal-800">{trainee.certifications.length}</p>
            <p className="text-[11px] text-muted">Certifications</p>
            <p className="text-[10px] text-emerald-700 font-semibold">
              {trainee.certifications.filter(c => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED").length} verified
            </p>
          </div>
          <div className="p-3 rounded-xl bg-sage-50 border border-sage-200 text-center">
            <p className="font-display font-bold text-xl text-charcoal-800">{trainee.projects.length}</p>
            <p className="text-[11px] text-muted">Projects</p>
            <p className="text-[10px] text-muted">Portfolio</p>
          </div>
          <div className="p-3 rounded-xl bg-sage-50 border border-sage-200 text-center">
            <p className="font-display font-bold text-xl text-charcoal-800">{trainee.enrollments.length}</p>
            <p className="text-[11px] text-muted">Training</p>
            <p className="text-[10px] text-muted">Programs</p>
          </div>
        </div>

        {/* Employability Risk Summary */}
        <div className="p-4 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-charcoal-800">AI Readiness Assessment</p>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              riskReport.riskLevel === "LOW" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
              riskReport.riskLevel === "MODERATE" ? "bg-amber-50 text-amber-800 border-amber-200" :
              "bg-red-50 text-red-800 border-red-200"
            }`}>
              {riskReport.riskLevel} RISK · {riskReport.employabilityScore}/100
            </span>
          </div>
          <p className="text-xs text-muted">{riskReport.advisorySummary}</p>
          {riskReport.primaryFactors.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-border/40">
              {riskReport.primaryFactors.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">{f.factor}</span>
                  <span className={f.impact === "POSITIVE" ? "text-emerald-700 font-semibold" : "text-amber-600 font-semibold"}>
                    {f.impact === "POSITIVE" ? `+${f.weight} pts` : `${f.weight} pts`}
                  </span>
                </div>
              ))}
            </div>
          )}
          {riskReport.primaryFactors.length === 0 && (
            <p className="text-[11px] text-muted italic">Add skills, complete assessments, and get certified to build your readiness score.</p>
          )}
        </div>
      </div>

      {/* Skill Gap Analysis */}
      {skillGapAnalysis ? (
        <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-700" />
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Skill Gap: {targetRole}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-sage-50 border border-sage-200 text-center">
              <p className="font-display font-bold text-xl text-emerald-800">{skillGapAnalysis.matchedScore}%</p>
              <p className="text-[10px] text-muted">Role Match</p>
            </div>
          </div>

          <p className="text-xs text-muted leading-relaxed">{skillGapAnalysis.explainableRationale}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-800 mb-2">
                ✓ Matched Skills ({skillGapAnalysis.matchedSkills.length})
              </p>
              {skillGapAnalysis.matchedSkills.length === 0 ? (
                <p className="text-xs text-muted">No matching skills found for this role yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skillGapAnalysis.matchedSkills.map((s, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-emerald-300 text-emerald-900 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
              <p className="text-xs font-semibold text-amber-800 mb-2">
                ○ Missing Skills ({skillGapAnalysis.missingCriticalSkills.length})
              </p>
              {skillGapAnalysis.missingCriticalSkills.length === 0 ? (
                <p className="text-xs text-emerald-800 font-semibold">All core skills present!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skillGapAnalysis.missingCriticalSkills.map((s, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-amber-300 text-amber-900 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <a href="/trainee/recommendations"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline">
              <BookOpen className="w-3.5 h-3.5" />
              View Full Learning Roadmap →
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-border shadow-card">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-800 mb-1">
                No Career Target Set
              </h3>
              <p className="text-xs text-muted mb-3">
                Set your career target to unlock personalized skill gap analysis, learning roadmap, and job matching.
              </p>
              <a href="/trainee/career-target"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 text-white text-xs font-semibold">
                Set Career Target
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* All Recommended Actions */}
      {nextActions.length > 1 && (
        <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-800 pb-3 border-b border-border/50">
            All Recommended Actions ({nextActions.length})
          </h3>
          <div className="space-y-3">
            {nextActions.map((action, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-sage-50/60 border border-sage-200">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-charcoal-800">{action.action}</p>
                    <p className="text-[11px] text-muted mt-0.5">{action.reason}</p>
                  </div>
                </div>
                <a href={action.href}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-charcoal-700 hover:border-emerald-300 transition">
                  Go
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {nextActions.length === 0 && (
        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 text-center">
          <p className="font-display font-bold text-lg text-emerald-800 mb-1">Great Progress!</p>
          <p className="text-xs text-emerald-700">
            Your profile looks strong. Continue completing follow-up milestones and updating your employment status to keep your career data current.
          </p>
        </div>
      )}
    </div>
  );
}
