import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { computeSkillGap, calculateCareerReadiness } from "@/lib/career-engine";
import { 
  Target, BookOpen, CheckCircle2, Circle, Clock, ArrowRight, 
  Sparkles, RefreshCw, AlertCircle, TrendingUp, Award
} from "lucide-react";

export const revalidate = 0;

// Phase label map
const PHASE_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Phase 1 — Required Skills", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  2: { label: "Phase 2 — Skill Advancement", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  3: { label: "Phase 3 — Recommended Skills", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  4: { label: "Phase 4 — Projects & Portfolio", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

function StatusIcon({ status }: { status: string }) {
  if (status === "COMPLETED") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (status === "IN_PROGRESS") return <Clock className="w-4 h-4 text-amber-500" />;
  return <Circle className="w-4 h-4 text-border" />;
}

function ReadinessBar({ value, label, color = "bg-emerald-600" }: { value: number | null; label: string; color?: string }) {
  if (value === null) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-charcoal-700 font-medium">{label}</span>
          <span className="text-muted">—</span>
        </div>
        <div className="h-1.5 bg-sage-100 rounded-full" />
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-charcoal-700 font-medium">{label}</span>
        <span className="font-bold text-charcoal-800">{value}%</span>
      </div>
      <div className="h-1.5 bg-sage-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      careerTarget: true,
      skills: { include: { skill: true } },
      projects: true,
      certifications: true,
      employmentRecords: true,
      skillEvidence: true,
      roadmap: {
        include: {
          items: {
            include: { skill: true },
            orderBy: [{ phase: "asc" }, { orderIndex: "asc" }],
          },
        },
      },
    },
  });

  if (!trainee) return null;

  const hasRoadmap = !!trainee.roadmap && trainee.roadmap.items.length > 0;
  const hasCareerTarget = !!trainee.careerTarget;

  // Career readiness calculation
  let readiness = null;
  let skillGapSummary = { strong: 0, developing: 0, missing: 0, total: 0 };

  if (hasCareerTarget) {
    const careerPath = await prisma.careerPath.findFirst({
      where: { title: { contains: trainee.careerTarget!.targetRole } },
      include: { requirements: { include: { skill: true } } },
    });

    if (careerPath) {
      const requirements = careerPath.requirements.map((r) => ({
        skillId: r.skillId,
        skillName: r.skill.name,
        category: r.skill.category,
        importance: r.importance,
        minLevel: r.minLevel,
      }));
      const userSkills = trainee.skills.map((s) => ({
        skillId: s.skillId,
        proficiencyLevel: s.proficiencyLevel,
      }));
      const gap = computeSkillGap(requirements, userSkills);
      const required = gap.filter((g) => g.importance === "REQUIRED");
      skillGapSummary = {
        strong: gap.filter((g) => g.status === "STRONG" && g.importance === "REQUIRED").length,
        developing: gap.filter((g) => g.status === "DEVELOPING" && g.importance === "REQUIRED").length,
        missing: gap.filter((g) => g.status === "MISSING" && g.importance === "REQUIRED").length,
        total: required.length,
      };

      readiness = calculateCareerReadiness({
        totalRequiredSkills: required.length,
        strongSkills: skillGapSummary.strong,
        developingSkills: skillGapSummary.developing,
        missingRequiredSkills: skillGapSummary.missing,
        projectCount: trainee.projects.length,
        certificationCount: trainee.certifications.length,
        verifiedCertifications: trainee.certifications.filter(
          (c) => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED"
        ).length,
        employmentRecordCount: trainee.employmentRecords.length,
        evidenceCount: trainee.skillEvidence.length,
        hasCareerTarget: true,
      });
    }
  }

  // Group roadmap items by phase
  type RoadmapItemsType = NonNullable<typeof trainee.roadmap>["items"];
  const byPhase = new Map<number, RoadmapItemsType>();
  if (trainee.roadmap) {
    for (const item of trainee.roadmap.items) {
      const existing = byPhase.get(item.phase) || [];
      existing.push(item);
      byPhase.set(item.phase, existing);
    }
  }

  const completedCount = trainee.roadmap?.items.filter((i) => i.status === "COMPLETED").length ?? 0;
  const totalCount = trainee.roadmap?.items.length ?? 0;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800">
            Your Learning Roadmap
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {hasCareerTarget
              ? `Personalized path to: ${trainee.careerTarget!.targetRole}`
              : "Set a career target to generate your personalized roadmap."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasCareerTarget && (
            <form action="/api/trainee/roadmap/generate" method="POST">
              <Link
                href="/trainee/roadmap?regenerate=1"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-semibold text-charcoal-700 hover:bg-sage-50 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </Link>
            </form>
          )}
          <Link
            href="/trainee/career-target"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm transition"
          >
            <Target className="w-3.5 h-3.5" />
            {hasCareerTarget ? "Change Goal" : "Set Career Goal"}
          </Link>
        </div>
      </div>

      {!hasCareerTarget ? (
        /* Empty state — no career target */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Target className="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-charcoal-800">
              No Career Goal Set
            </h3>
            <p className="text-xs text-muted mt-1 max-w-sm">
              Tell CareerLoop where you want to go, and we'll build a personalized skill roadmap based on your current profile.
            </p>
          </div>
          <Link
            href="/trainee/career-target"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm transition"
          >
            <span>Set Your Career Goal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : !hasRoadmap ? (
        /* Career target exists but no roadmap yet */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-blue-700" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-charcoal-800">
              Roadmap Not Generated Yet
            </h3>
            <p className="text-xs text-muted mt-1 max-w-sm">
              Add your current skills, then generate your personalized roadmap for{" "}
              <strong>{trainee.careerTarget!.targetRole}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/trainee/skills"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-semibold text-charcoal-700 hover:bg-sage-50 transition"
            >
              Add Skills First
            </Link>
            <GenerateRoadmapButton />
          </div>
        </div>
      ) : (
        /* Main roadmap content */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Roadmap items — main column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Progress banner */}
            <div className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-0.5">
                  Overall Progress
                </p>
                <p className="font-display font-bold text-2xl text-charcoal-800">
                  {totalCount === 0 ? "—" : `${completedCount} / ${totalCount}`}
                </p>
                <p className="text-[11px] text-muted">milestones completed</p>
              </div>
              <div className="text-right">
                <div className="w-32 h-1.5 bg-sage-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%" }}
                  />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Phases */}
            {Array.from(byPhase.entries()).map(([phase, items]) => {
              const phaseInfo = PHASE_LABELS[phase] || { label: `Phase ${phase}`, color: "text-charcoal-700", bg: "bg-sage-50 border-sage-200" };
              const phaseCompleted = items.filter((i) => i.status === "COMPLETED").length;

              return (
                <div key={phase} className="bg-white rounded-3xl border border-border overflow-hidden">
                  {/* Phase header */}
                  <div className={`px-5 py-3 border-b flex items-center justify-between ${phaseInfo.bg}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${phaseInfo.color}`}>
                      {phaseInfo.label}
                    </h3>
                    <span className={`text-[10px] font-semibold ${phaseInfo.color}`}>
                      {phaseCompleted} / {items.length} done
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border/50">
                    {items.map((item) => (
                      <RoadmapItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right sidebar — readiness & gap */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Career Readiness */}
            <div className="bg-white rounded-3xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <h3 className="font-display font-bold text-sm text-charcoal-800">
                  Career Readiness
                </h3>
              </div>

              {readiness?.overall !== null && readiness !== null ? (
                <>
                  <div className="text-center py-2">
                    <p className="font-display font-extrabold text-4xl text-charcoal-800">
                      {readiness.overall}%
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                      {readiness.dataQuality === "SUFFICIENT" ? "Based on your profile" : "Partial data"}
                    </p>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <ReadinessBar value={readiness.breakdown.skills} label="Skills" color="bg-emerald-600" />
                    <ReadinessBar value={readiness.breakdown.projects} label="Projects" color="bg-blue-500" />
                    <ReadinessBar value={readiness.breakdown.experience} label="Experience" color="bg-amber-500" />
                    <ReadinessBar value={readiness.breakdown.certifications} label="Certifications" color="bg-purple-500" />
                    <ReadinessBar value={readiness.breakdown.evidence} label="Evidence" color="bg-red-500" />
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed border-t border-border/50 pt-3">
                    {readiness.explanation}
                  </p>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted">
                    {readiness?.explanation || "Add skills to calculate readiness."}
                  </p>
                </div>
              )}
            </div>

            {/* Skill Gap Summary */}
            <div className="bg-white rounded-3xl border border-border p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h3 className="font-display font-bold text-sm text-charcoal-800">
                  Skill Gap
                </h3>
              </div>

              {skillGapSummary.total > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Strong
                    </span>
                    <span className="font-bold text-charcoal-800">{skillGapSummary.strong}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      Developing
                    </span>
                    <span className="font-bold text-charcoal-800">{skillGapSummary.developing}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-red-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      Missing
                    </span>
                    <span className="font-bold text-charcoal-800">{skillGapSummary.missing}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">No gap data yet.</p>
              )}

              <Link
                href="/trainee/recommendations"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline mt-1"
              >
                View full skill gap →
              </Link>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-3xl border border-border p-5 space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Quick Actions
              </h3>
              <Link href="/trainee/skills" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-sage-50 text-xs font-medium text-charcoal-700 transition">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                Manage Skills
              </Link>
              <Link href="/trainee/identity" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-sage-50 text-xs font-medium text-charcoal-700 transition">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                Add Projects
              </Link>
              <Link href="/trainee/certifications" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-sage-50 text-xs font-medium text-charcoal-700 transition">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                View Certifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Client component for inline status updates ──────────────────────────────
function RoadmapItemRow({ item }: { item: any }) {
  const statusColors: Record<string, string> = {
    COMPLETED: "bg-emerald-50 border-emerald-100",
    IN_PROGRESS: "bg-amber-50 border-amber-100",
    NOT_STARTED: "bg-white",
  };

  return (
    <div className={`flex items-start gap-3 px-5 py-4 ${statusColors[item.status] || "bg-white"}`}>
      <div className="mt-0.5 shrink-0">
        <StatusIcon status={item.status} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-xs font-semibold ${
            item.status === "COMPLETED" ? "line-through text-muted" : "text-charcoal-800"
          }`}>
            {item.title}
          </p>
          <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
            item.itemType === "PROJECT"
              ? "bg-purple-50 text-purple-700"
              : item.itemType === "MILESTONE"
              ? "bg-amber-50 text-amber-700"
              : "bg-sage-50 text-emerald-700"
          }`}>
            {item.itemType}
          </span>
        </div>
        {item.description && (
          <p className="text-[11px] text-muted mt-0.5">{item.description}</p>
        )}
        {item.reasoning && item.status !== "COMPLETED" && (
          <p className="text-[11px] text-muted/70 mt-0.5 italic">{item.reasoning}</p>
        )}
      </div>
      <UpdateStatusButton itemId={item.id} currentStatus={item.status} />
    </div>
  );
}

// Inline client component for status toggle
function UpdateStatusButton({ itemId, currentStatus }: { itemId: string; currentStatus: string }) {
  const nextStatus =
    currentStatus === "NOT_STARTED"
      ? "IN_PROGRESS"
      : currentStatus === "IN_PROGRESS"
      ? "COMPLETED"
      : null;

  if (!nextStatus) return null;

  return (
    <UpdateStatusClient itemId={itemId} nextStatus={nextStatus} currentStatus={currentStatus} />
  );
}

// We need a client component for the interactive button — extracted as a separate server-importable pattern
// Since this is a server component file, use a form action approach
function UpdateStatusClient({
  itemId, nextStatus, currentStatus,
}: { itemId: string; nextStatus: string; currentStatus: string }) {
  const labels: Record<string, string> = {
    IN_PROGRESS: "Start",
    COMPLETED: "Mark Done",
  };

  return (
    <form
      action={async () => {
        "use server";
      }}
    >
      <Link
        href={`/trainee/roadmap/update?itemId=${itemId}&status=${nextStatus}`}
        className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition ${
          nextStatus === "COMPLETED"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            : "bg-sage-50 text-charcoal-700 border-sage-200 hover:bg-white"
        }`}
      >
        {labels[nextStatus]}
      </Link>
    </form>
  );
}

function GenerateRoadmapButton() {
  return (
    <Link
      href="/trainee/roadmap/generate-redirect"
      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm transition"
    >
      <Sparkles className="w-3.5 h-3.5" />
      Generate Roadmap
    </Link>
  );
}
