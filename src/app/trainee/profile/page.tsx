import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import ResumeUploadManager from "@/components/ResumeUploadManager";
import { revalidatePath } from "next/cache";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Phone, 
  Mail, 
  Award, 
  CheckCircle2, 
  Briefcase, 
  Code, 
  Calendar,
  ExternalLink
} from "lucide-react";
import { logAuditAction } from "@/lib/audit";

export const revalidate = 0;

export default async function TraineeProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: true,
      skills: { include: { skill: true } },
      projects: { orderBy: { createdAt: "desc" } },
      certifications: { include: { program: true }, orderBy: { issueDate: "desc" } },
    },
  });

  if (!trainee) {
    return (
      <EmptyState
        title="Profile Not Initialized"
        description="Please initialize your profile to view and manage your digital identity."
        actionText="Setup Profile"
        actionHref="/onboarding"
      />
    );
  }

  async function updateProfileAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const name = formData.get("name") as string;
    const ageStr = formData.get("age") as string;
    const gender = formData.get("gender") as string;
    const district = formData.get("district") as string;
    const state = formData.get("state") as string;
    const educationLevel = formData.get("educationLevel") as string;
    const phone = formData.get("phone") as string;
    const bio = formData.get("bio") as string;
    const currentStatus = formData.get("currentStatus") as string;

    if (name && name.trim()) {
      await prisma.user.update({
        where: { id: userSession.id },
        data: { name: name.trim() },
      });
    }

    const updated = await prisma.traineeProfile.update({
      where: { userId: userSession.id },
      data: {
        district,
        state: state || "National",
        educationLevel,
        phone,
        bio,
        currentStatus,
        age: ageStr ? parseInt(ageStr, 10) : null,
        gender: gender || null,
      },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "TRAINEE",
      action: "UPDATED_PROFILE",
      targetEntity: "TraineeProfile",
      targetEntityId: updated.id,
    });

    revalidatePath("/trainee/profile");
    revalidatePath("/trainee");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {trainee.traineeId}
            </span>
            <StatusBadge status={trainee.currentStatus} />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Digital Trainee Identity
          </h1>
          <p className="text-xs text-muted">
            Permanent, verifiable skilling and livelihood record synchronized with national skill registries.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200 text-left sm:text-right text-xs">
          <p className="text-[10px] uppercase font-bold text-muted">Unique Trainee ID</p>
          <p className="font-mono font-bold text-emerald-800 text-sm">{trainee.traineeId}</p>
          <p className="text-[10px] text-muted">Cryptographically anchored</p>
        </div>
      </div>

      {/* AI Resume Upload & Parsing Card */}
      <ResumeUploadManager
        initialFileName={trainee.resumeFileName}
        initialUploadedAt={trainee.resumeUploadedAt?.toISOString() || null}
        initialParsedData={trainee.resumeParsedData}
      />

      {/* Core Profile Edit & Identity Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border/50">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-display font-bold text-xl shadow-sm">
            {user.name?.charAt(0) || "T"}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-charcoal-800">
              {user.name}
            </h3>
            <p className="text-xs text-muted flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form action={updateProfileAction} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={user.name || ""}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                min="14"
                max="100"
                defaultValue={trainee.age ?? ""}
                placeholder="e.g. 23"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                defaultValue={trainee.gender || "PREFER_NOT_TO_SAY"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Encrypted Phone Number
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={trainee.phone || ""}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Home District
              </label>
              <input
                type="text"
                name="district"
                defaultValue={trainee.district || ""}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                State / Region
              </label>
              <input
                type="text"
                name="state"
                defaultValue={trainee.state || "Maharashtra"}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Highest Education Level
              </label>
              <input
                type="text"
                name="educationLevel"
                defaultValue={trainee.educationLevel || "Diploma / Higher Secondary"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Current Livelihood Status
              </label>
              <select
                name="currentStatus"
                defaultValue={trainee.currentStatus}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="TRAINING">In Training</option>
                <option value="CERTIFIED">Certified (Seeking Placement)</option>
                <option value="EMPLOYED">Formally Employed</option>
                <option value="SELF_EMPLOYED">Self-Employed / Entrepreneur</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
                <option value="UNEMPLOYED">Unemployed (Seeking Support)</option>
                <option value="FURTHER_STUDIES">Pursuing Further Studies</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Professional Bio & Career Goals
            </label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={trainee.bio || ""}
              placeholder="Brief summary of your competencies and aspirations..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <p className="text-xs text-muted">
              Career Targets (Role, CTC, Locations) can also be tuned in{" "}
              <a href="/trainee/career-target" className="text-emerald-800 font-semibold underline">
                Career Target settings →
              </a>
            </p>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Verified Skills Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-800" />
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Verified Technical Skills ({trainee.skills.length})
            </h3>
          </div>
          <a
            href="/trainee/skills"
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Manage Skills & Assessments →
          </a>
        </div>

        {trainee.skills.length === 0 ? (
          <p className="text-xs text-muted italic py-4 text-center">
            No verified skills registered yet. Upload your resume or take an assessment to register competencies.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5 pt-2">
            {trainee.skills.map((ts) => (
              <div
                key={ts.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sage-50 border border-sage-200 text-xs"
              >
                <span className="font-bold text-charcoal-800">{ts.skill.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 uppercase font-semibold">
                  {ts.proficiencyLevel}
                </span>
                {(ts.verifiedByAssessment || ts.verifiedByEmployer) && (
                  <span title="Verified by Assessor or Employer">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-800" />
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Showcase Projects ({trainee.projects.length})
            </h3>
          </div>
        </div>

        {trainee.projects.length === 0 ? (
          <p className="text-xs text-muted italic py-4 text-center">
            No projects added yet. Upload your resume above to auto-extract your practical projects.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {trainee.projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-2xl bg-sage-50/40 border border-border hover:border-emerald-500/40 transition space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-charcoal-800 text-sm">{proj.title}</h4>
                  {proj.isHighlighted && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-muted text-xs line-clamp-3">{proj.description}</p>
                )}
                {proj.techStack && (
                  <div className="pt-1">
                    <p className="text-[10px] font-mono text-emerald-800 font-semibold truncate">
                      Stack: {proj.techStack}
                    </p>
                  </div>
                )}
                {(proj.url || proj.repoUrl) && (
                  <div className="flex items-center gap-3 pt-2 text-[11px] font-semibold text-emerald-800">
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                        Live Demo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {proj.repoUrl && (
                      <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                        Repository <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications & Programs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-800" />
            <h3 className="font-display font-bold text-base text-charcoal-800">
              Verifiable Certifications & Credentials ({trainee.certifications.length})
            </h3>
          </div>
          <a
            href="/trainee/credentials"
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Open Verifiable Passbook →
          </a>
        </div>

        {trainee.certifications.length === 0 ? (
          <p className="text-xs text-muted italic py-4 text-center">
            No certifications issued yet. Complete program assessments to earn cryptographically verifiable credentials.
          </p>
        ) : (
          <div className="space-y-3 pt-2">
            {trainee.certifications.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-2xl bg-white border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-charcoal-800 text-sm">{cert.program?.title ?? "Program Certification"}</h4>
                  <p className="text-muted text-[11px]">
                    Issued by {cert.issuingAuthority} • Certificate #{cert.certificateNumber}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-800 mt-0.5">
                    Issued on {new Date(cert.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
