import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import SkillBadge from "@/components/SkillBadge";
import { formatDate } from "@/lib/utils";
import { Users, ShieldCheck, Award, Briefcase, MapPin } from "lucide-react";

export const revalidate = 0;

export default async function EmployerCandidatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer) {
    return (
      <EmptyState
        title="Employer Profile Not Setup"
        description="Set up your company profile to browse candidates."
        actionText="Setup Profile"
        actionHref="/employer/profile"
      />
    );
  }

  // Fetch candidates who are certified or employed with at least 1 verified skill
  const candidates = await prisma.traineeProfile.findMany({
    where: {
      currentStatus: { in: ["CERTIFIED", "EMPLOYED", "UNEMPLOYED", "TRAINING"] },
    },
    include: {
      user: { select: { name: true, email: true } },
      skills: { include: { skill: true } },
      certifications: true,
      enrollments: { include: { program: true } },
      careerTarget: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Group by verification status
  const certifiedCandidates = candidates.filter(c => c.certifications.length > 0);
  const verifiedSkillCandidates = candidates.filter(
    c => c.skills.some(s => s.verifiedByAssessment || s.verifiedByEmployer)
  );

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Candidate Pool
          </h1>
          <p className="text-xs text-muted">
            Browse verified candidates from training programs. Prioritize candidates with verified skills and certifications.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {certifiedCandidates.length} Certified
          </span>
          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            {verifiedSkillCandidates.length} Skill-Verified
          </span>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          title="No Candidates Available"
          description="Candidates will appear here once trainees complete their profiles and are certified."
        />
      ) : (
        <div className="space-y-4">
          {candidates.map(candidate => {
            const verifiedSkillCount = candidate.skills.filter(
              s => s.verifiedByAssessment || s.verifiedByEmployer
            ).length;
            const verifiedCertCount = candidate.certifications.filter(
              c => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED"
            ).length;

            return (
              <div key={candidate.id} className="bg-white rounded-3xl p-6 border border-border shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                        {candidate.user.name?.charAt(0)?.toUpperCase() || "T"}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-charcoal-800">
                          {candidate.user.name || "Candidate"}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <MapPin className="w-3 h-3" />
                          <span>{candidate.district}</span>
                          <span className="font-mono">· {candidate.traineeId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-full border font-semibold ${
                        candidate.currentStatus === "CERTIFIED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-sage-50 text-charcoal-700 border-sage-200"
                      }`}>
                        {candidate.currentStatus.replace(/_/g, " ")}
                      </span>

                      {verifiedSkillCount > 0 && (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          {verifiedSkillCount} verified skill{verifiedSkillCount !== 1 ? "s" : ""}
                        </span>
                      )}

                      {verifiedCertCount > 0 && (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Award className="w-3 h-3" />
                          {verifiedCertCount} verified cert{verifiedCertCount !== 1 ? "s" : ""}
                        </span>
                      )}

                      {candidate.careerTarget && (
                        <span className="flex items-center gap-1 text-charcoal-700">
                          <Briefcase className="w-3 h-3 text-muted" />
                          Seeking: {candidate.careerTarget.targetRole}
                        </span>
                      )}

                      {candidate.educationLevel && (
                        <span className="text-muted">{candidate.educationLevel}</span>
                      )}
                    </div>

                    {candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.slice(0, 6).map(ts => (
                          <SkillBadge
                            key={ts.id}
                            name={ts.skill.name}
                            category={ts.skill.category}
                            proficiency={ts.proficiencyLevel}
                            verifiedByAssessment={ts.verifiedByAssessment}
                            verifiedByEmployer={ts.verifiedByEmployer}
                          />
                        ))}
                        {candidate.skills.length > 6 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sage-50 text-muted border border-sage-200">
                            +{candidate.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <a href={`/employer/applications?traineeId=${candidate.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition">
                      View Profile
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
