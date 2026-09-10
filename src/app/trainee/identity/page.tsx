import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import SkillBadge from "@/components/SkillBadge";
import { revalidatePath } from "next/cache";
import { formatCurrency, formatDate } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import {
  User, MapPin, GraduationCap, Shield, Phone, Mail, Award,
  CheckCircle2, ShieldCheck, AlertCircle, Target, BookOpen,
  Briefcase, PlusCircle, ExternalLink, Code, Star, Clock
} from "lucide-react";

export const revalidate = 0;

export default async function CareerIdentityPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      skills: { include: { skill: true } },
      skillEvidence: { include: { skill: true } },
      certifications: { include: { program: true } },
      enrollments: { include: { program: true, assessments: true } },
      employmentRecords: { include: { employer: true } },
      projects: true,
      externalProfiles: true,
      careerTarget: true,
    },
  });

  if (!trainee) {
    return (
      <EmptyState
        title="Career Identity Not Initialized"
        description="Complete your profile to build your Career Identity — your evidence-backed professional profile."
        actionText="Setup Profile"
        actionHref="/onboarding"
      />
    );
  }

  const verifiedSkills = trainee.skills.filter(s => s.verifiedByAssessment || s.verifiedByEmployer);
  const unverifiedSkills = trainee.skills.filter(s => !s.verifiedByAssessment && !s.verifiedByEmployer);
  const verifiedCerts = trainee.certifications.filter(c => c.verificationStatus === "VERIFIED" || c.verificationStatus === "PROVIDER_VERIFIED");
  const currentJob = trainee.employmentRecords.find(e => e.isCurrent);
  const githubProfile = trainee.externalProfiles.find(ep => ep.platform === "GITHUB");
  const leetcodeProfile = trainee.externalProfiles.find(ep => ep.platform === "LEETCODE");

  async function updateIdentityAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const district = formData.get("district") as string;
    const educationLevel = formData.get("educationLevel") as string;
    const phone = formData.get("phone") as string;
    const bio = formData.get("bio") as string;
    const currentStatus = formData.get("currentStatus") as string;

    const updated = await prisma.traineeProfile.update({
      where: { userId: userSession.id },
      data: { district, educationLevel, phone, bio, currentStatus },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "TRAINEE",
      action: "UPDATED_CAREER_IDENTITY",
      targetEntity: "TraineeProfile",
      targetEntityId: updated.id,
    });

    revalidatePath("/trainee/identity");
  }

  async function addProjectAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: userSession.id } });
    if (!traineeProfile) return;

    const title = formData.get("projectTitle") as string;
    const description = formData.get("projectDescription") as string;
    const techStack = formData.get("techStack") as string;
    const url = formData.get("projectUrl") as string;
    const repoUrl = formData.get("repoUrl") as string;

    if (title) {
      await prisma.project.create({
        data: {
          traineeId: traineeProfile.id,
          title,
          description: description || null,
          techStack: techStack || null,
          url: url || null,
          repoUrl: repoUrl || null,
        },
      });
    }

    revalidatePath("/trainee/identity");
  }

  async function connectExternalAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: userSession.id } });
    if (!traineeProfile) return;

    const platform = formData.get("platform") as string;
    const username = formData.get("username") as string;
    const profileUrl = formData.get("profileUrl") as string;

    if (platform && username) {
      await prisma.externalProfile.upsert({
        where: { traineeId_platform: { traineeId: traineeProfile.id, platform } },
        update: { username, profileUrl: profileUrl || null, isConnected: true },
        create: { traineeId: traineeProfile.id, platform, username, profileUrl: profileUrl || null, isConnected: true },
      });
    }

    revalidatePath("/trainee/identity");
  }

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            {trainee.traineeId}
          </span>
          <StatusBadge status={trainee.currentStatus} />
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Career Identity
        </h1>
        <p className="text-xs text-muted">
          Your evidence-backed professional profile — verified skills, projects, training, and employment history.
        </p>
      </div>

      {/* Identity Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-display font-bold text-2xl">
              {user.name?.charAt(0)?.toUpperCase() || "T"}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-charcoal-800">{user.name}</h2>
              <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3" /> {user.email}
              </p>
              {trainee.phone && (
                <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3" /> {trainee.phone}
                </p>
              )}
              <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3" /> {trainee.district}, {trainee.state}
              </p>
            </div>
          </div>

          {/* Career Target Summary */}
          {trainee.careerTarget ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 min-w-[200px]">
              <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider mb-1">Career Target</p>
              <p className="font-display font-bold text-base text-charcoal-800">{trainee.careerTarget.targetRole}</p>
              {trainee.careerTarget.industry && (
                <p className="text-xs text-muted">{trainee.careerTarget.industry}</p>
              )}
              {trainee.careerTarget.targetSalaryMin && (
                <p className="text-xs text-emerald-800 font-semibold mt-1">
                  Target: {formatCurrency(trainee.careerTarget.targetSalaryMin)}–{formatCurrency(trainee.careerTarget.targetSalaryMax || 0)}/mo
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 min-w-[200px]">
              <p className="text-[10px] uppercase font-bold text-amber-800 tracking-wider mb-1">Career Target</p>
              <p className="text-xs text-amber-900">Not set yet</p>
              <a href="/trainee/career-target" className="text-xs font-semibold text-amber-800 underline mt-1 block">
                Set your career target →
              </a>
            </div>
          )}
        </div>

        {/* Bio */}
        {trainee.bio && (
          <p className="text-sm text-charcoal-700 leading-relaxed pt-4">{trainee.bio}</p>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/40 mt-4">
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-charcoal-800">{trainee.skills.length}</p>
            <p className="text-[11px] text-muted">Skills Mapped</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-emerald-700">{verifiedSkills.length}</p>
            <p className="text-[11px] text-muted">Verified Skills</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-charcoal-800">{trainee.certifications.length}</p>
            <p className="text-[11px] text-muted">Certifications</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-charcoal-800">{trainee.projects.length}</p>
            <p className="text-[11px] text-muted">Projects</p>
          </div>
        </div>
      </div>

      {/* Skills & Evidence Section */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-800" />
            <h3 className="font-display font-bold text-base text-charcoal-800">Skills & Evidence</h3>
          </div>
          <a href="/trainee/skills" className="text-xs font-semibold text-emerald-800 hover:underline">
            Manage Skills →
          </a>
        </div>

        {trainee.skills.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-muted mb-3">No skills added yet. Build your skill profile to power career matching.</p>
            <a href="/trainee/skills" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 text-white text-xs font-semibold">
              <PlusCircle className="w-3.5 h-3.5" /> Add Skills
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {verifiedSkills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Skills ({verifiedSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {verifiedSkills.map(ts => (
                    <SkillBadge
                      key={ts.id}
                      name={ts.skill.name}
                      category={ts.skill.category}
                      proficiency={ts.proficiencyLevel}
                      verifiedByAssessment={ts.verifiedByAssessment}
                      verifiedByEmployer={ts.verifiedByEmployer}
                    />
                  ))}
                </div>
              </div>
            )}
            {unverifiedSkills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Self-Declared Skills ({unverifiedSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {unverifiedSkills.map(ts => (
                    <SkillBadge
                      key={ts.id}
                      name={ts.skill.name}
                      category={ts.skill.category}
                      proficiency={ts.proficiencyLevel}
                      verifiedByAssessment={false}
                      verifiedByEmployer={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Training & Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Training */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/50">
            <BookOpen className="w-5 h-5 text-blue-700" />
            <h3 className="font-display font-bold text-base text-charcoal-800">Training</h3>
          </div>
          {trainee.enrollments.length === 0 ? (
            <p className="text-xs text-muted py-4 text-center">No training programs recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {trainee.enrollments.map(e => (
                <div key={e.id} className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <p className="font-semibold text-xs text-charcoal-800">{e.program.title}</p>
                  <p className="text-[11px] text-muted">{e.program.sector} · {e.status.replace(/_/g, " ")}</p>
                  <div className="flex gap-3 mt-1 text-[11px] text-muted">
                    {e.attendancePercentage !== null && e.attendancePercentage !== undefined && (
                      <span>Attendance: {e.attendancePercentage}%</span>
                    )}
                    {e.grade && <span>Grade: {e.grade}</span>}
                    <span>Enrolled: {formatDate(e.enrollmentDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-700" />
              <h3 className="font-display font-bold text-base text-charcoal-800">Certifications</h3>
            </div>
            <a href="/trainee/certifications" className="text-xs font-semibold text-emerald-800 hover:underline">
              View Wallet →
            </a>
          </div>
          {trainee.certifications.length === 0 ? (
            <p className="text-xs text-muted py-4 text-center">No certifications recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {trainee.certifications.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-xs text-charcoal-800">{c.program.title}</p>
                    <p className="text-[11px] text-muted font-mono">{c.certificateNumber}</p>
                    <p className="text-[11px] text-muted">{formatDate(c.issueDate)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                    c.verificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                    c.verificationStatus === "PROVIDER_VERIFIED" ? "bg-blue-50 text-blue-800 border-blue-200" :
                    c.verificationStatus === "UPLOADED" ? "bg-amber-50 text-amber-800 border-amber-200" :
                    "bg-gray-50 text-gray-700 border-gray-200"
                  }`}>
                    {c.verificationStatus.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-700" />
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Projects ({trainee.projects.length})
            </h3>
          </div>
        </div>

        {trainee.projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {trainee.projects.map(proj => (
              <div key={proj.id} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm text-charcoal-800">{proj.title}</h4>
                  <div className="flex gap-1.5">
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer"
                        className="p-1 rounded text-muted hover:text-charcoal-800">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                {proj.description && <p className="text-xs text-muted">{proj.description}</p>}
                {proj.techStack && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.techStack.split(",").map((tech, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white text-charcoal-700 border border-border">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Project Form */}
        <form action={addProjectAction} className="p-4 rounded-2xl border border-dashed border-border space-y-3 text-xs">
          <p className="font-semibold text-charcoal-700">Add a Project</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              name="projectTitle"
              placeholder="Project title *"
              required
              className="px-3 py-2 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
            <input
              type="text"
              name="techStack"
              placeholder="Tech stack (comma separated: React, Node.js)"
              className="px-3 py-2 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
            <input
              type="url"
              name="projectUrl"
              placeholder="Live URL (optional)"
              className="px-3 py-2 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
            <input
              type="url"
              name="repoUrl"
              placeholder="Repository URL (optional)"
              className="px-3 py-2 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <textarea
            name="projectDescription"
            placeholder="Brief description of the project and your role..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition"
          >
            Add Project
          </button>
        </form>
      </div>

      {/* External Evidence Connectors */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border/50">
          <ExternalLink className="w-5 h-5 text-emerald-700" />
          <h3 className="font-display font-bold text-base text-charcoal-800">Evidence Connectors</h3>
        </div>

        <p className="text-xs text-muted">
          Connect external profiles to strengthen your skill evidence. Connected profiles are used as supporting evidence — not automatically verified.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* GitHub */}
          <div className="p-4 rounded-2xl border border-border space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-bold">G</div>
              <div>
                <p className="text-xs font-bold text-charcoal-800">GitHub</p>
                {githubProfile?.isConnected ? (
                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> @{githubProfile.username}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted">Not connected</p>
                )}
              </div>
            </div>
            {!githubProfile?.isConnected && (
              <form action={connectExternalAction} className="space-y-2 text-xs">
                <input type="hidden" name="platform" value="GITHUB" />
                <input type="text" name="username" placeholder="GitHub username"
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs" />
                <input type="url" name="profileUrl" placeholder="Profile URL (optional)"
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs" />
                <button type="submit" className="w-full py-1.5 rounded-lg bg-charcoal-800 text-white text-xs font-semibold">
                  Connect GitHub
                </button>
              </form>
            )}
          </div>

          {/* LeetCode */}
          <div className="p-4 rounded-2xl border border-border space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold">LC</div>
              <div>
                <p className="text-xs font-bold text-charcoal-800">LeetCode</p>
                {leetcodeProfile?.isConnected ? (
                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> @{leetcodeProfile.username}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted">Not connected</p>
                )}
              </div>
            </div>
            {!leetcodeProfile?.isConnected && (
              <form action={connectExternalAction} className="space-y-2 text-xs">
                <input type="hidden" name="platform" value="LEETCODE" />
                <input type="text" name="username" placeholder="LeetCode username"
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs" />
                <input type="url" name="profileUrl" placeholder="Profile URL (optional)"
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs" />
                <button type="submit" className="w-full py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold">
                  Connect LeetCode
                </button>
              </form>
            )}
          </div>

          {/* Portfolio */}
          <div className="p-4 rounded-2xl border border-border space-y-2">
            {(() => {
              const portfolio = trainee.externalProfiles.find(ep => ep.platform === "PORTFOLIO");
              return (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">P</div>
                    <div>
                      <p className="text-xs font-bold text-charcoal-800">Portfolio</p>
                      {portfolio?.isConnected ? (
                        <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted">Not connected</p>
                      )}
                    </div>
                  </div>
                  {!portfolio?.isConnected && (
                    <form action={connectExternalAction} className="space-y-2 text-xs">
                      <input type="hidden" name="platform" value="PORTFOLIO" />
                      <input type="text" name="username" placeholder="Portfolio name"
                        className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs" />
                      <input type="url" name="profileUrl" placeholder="Portfolio URL *"
                        className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs" />
                      <button type="submit" className="w-full py-1.5 rounded-lg bg-purple-700 text-white text-xs font-semibold">
                        Connect Portfolio
                      </button>
                    </form>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        <p className="text-[11px] text-muted italic">
          Note: Connecting a profile does not automatically verify your skills. Evidence from external profiles is labelled &quot;UNVERIFIED&quot; until reviewed by a training provider or employer.
        </p>
      </div>

      {/* Employment */}
      {trainee.employmentRecords.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-charcoal-700" />
              <h3 className="font-display font-bold text-base text-charcoal-800">Employment History</h3>
            </div>
            <a href="/trainee/outcomes" className="text-xs font-semibold text-emerald-800 hover:underline">
              Manage →
            </a>
          </div>
          <div className="space-y-3">
            {trainee.employmentRecords.map(emp => (
              <div key={emp.id} className="p-4 rounded-2xl bg-sage-50/60 border border-sage-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-charcoal-800">{emp.jobTitle}</p>
                  <p className="text-xs text-muted">{emp.companyName} · {emp.locationDistrict}</p>
                  <p className="text-[11px] text-muted">{formatDate(emp.startDate)} · {formatCurrency(emp.monthlySalary)}/mo</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                  emp.verificationStatus === "EMPLOYER_VERIFIED"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : emp.verificationStatus === "PENDING_VERIFICATION"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}>
                  {emp.verificationStatus.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border/50">
          <User className="w-5 h-5 text-charcoal-700" />
          <h3 className="font-display font-bold text-base text-charcoal-800">Edit Basic Details</h3>
        </div>
        <form action={updateIdentityAction} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Home District</label>
              <input type="text" name="district" defaultValue={trainee.district || ""}
                required className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Phone Number</label>
              <input type="text" name="phone" defaultValue={trainee.phone || ""}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Highest Education Level</label>
              <input type="text" name="educationLevel" defaultValue={trainee.educationLevel || ""}
                placeholder="e.g. Diploma, B.Tech, 12th Pass"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Current Status</label>
              <select name="currentStatus" defaultValue={trainee.currentStatus}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20">
                <option value="TRAINING">In Training</option>
                <option value="CERTIFIED">Certified (Seeking Placement)</option>
                <option value="EMPLOYED">Formally Employed</option>
                <option value="SELF_EMPLOYED">Self-Employed</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
                <option value="UNEMPLOYED">Unemployed</option>
                <option value="FURTHER_STUDIES">Further Studies</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">Professional Summary</label>
            <textarea name="bio" rows={3} defaultValue={trainee.bio || ""}
              placeholder="Brief description of your strengths and career goals..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="flex justify-end pt-2 border-t border-border/50">
            <button type="submit"
              className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
