"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap, Building2, Award, Landmark, ArrowRight, ArrowLeft,
  ShieldCheck, AlertCircle, CheckCircle2, Search, X, Briefcase,
  MapPin, User, Target, BookOpen, Sparkles, Plus
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "TRAINEE" | "EMPLOYER" | "TRAINING_PROVIDER" | "GOVERNMENT_ADMIN";

interface SkillEntry {
  name: string;
  category: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
}

interface FormData {
  // Step 0 — Role
  role: Role;
  orgName: string;
  adminCode: string;
  // Step 1 — Basic Info (TRAINEE only)
  district: string;
  state: string;
  educationLevel: string;
  fieldOfStudy: string;
  graduationYear: string;
  // Step 2 — Professional
  currentStatus: string;
  experienceYears: string;
  industry: string;
  // Step 3 — Skills
  skills: SkillEntry[];
  skillSearch: string;
  // Step 4 — Career Goal
  targetRole: string;
  targetIndustry: string;
  employmentType: string;
}

const EDUCATION_LEVELS = [
  "10th Grade", "12th Grade", "Diploma", "ITI Certificate",
  "Bachelor's Degree", "Master's Degree", "PhD", "Other",
];

const CURRENT_STATUSES = [
  "Student", "Recent Graduate", "Job Seeker", "Working Professional",
  "Career Changer", "Entrepreneur", "Returning to Work",
];

const EXPERIENCE_OPTIONS = [
  "No experience", "Less than 1 year", "1–2 years",
  "3–5 years", "5–10 years", "10+ years",
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance & Banking", "Education",
  "Manufacturing", "Retail & E-commerce", "Agriculture", "Construction",
  "Media & Entertainment", "Logistics & Supply Chain", "Government",
  "Hospitality & Tourism", "Legal", "Non-profit", "Other",
];

const EMPLOYMENT_TYPES = [
  "Full-time", "Part-time", "Remote", "Hybrid", "Contract", "Freelance", "Internship",
];

const CAREER_ROLES = [
  "Full Stack Web Developer", "Frontend Developer", "Backend Developer",
  "Data Analyst", "Data Scientist", "DevOps Engineer", "UI/UX Designer",
  "Mobile App Developer", "Cybersecurity Analyst", "Digital Marketing Specialist",
  "Product Manager", "Cloud Engineer", "Machine Learning Engineer",
  "Business Analyst", "Project Manager", "Content Writer",
  "Graphic Designer", "Financial Analyst", "HR Manager", "Sales Executive",
  "Healthcare Technician", "Electrician", "Plumber", "Welder",
  "Automotive Technician", "Entrepreneur", "Other",
];

const SKILL_SUGGESTIONS = [
  { name: "JavaScript", category: "Programming Languages" },
  { name: "Python", category: "Programming Languages" },
  { name: "React", category: "Frontend Development" },
  { name: "Node.js", category: "Backend Development" },
  { name: "SQL", category: "Databases" },
  { name: "HTML", category: "Frontend Development" },
  { name: "CSS", category: "Frontend Development" },
  { name: "TypeScript", category: "Programming Languages" },
  { name: "Git", category: "Tools & Workflow" },
  { name: "Docker", category: "Cloud & DevOps" },
  { name: "AWS", category: "Cloud & DevOps" },
  { name: "Machine Learning", category: "AI & Machine Learning" },
  { name: "Data Analysis", category: "Data Science" },
  { name: "Figma", category: "Design" },
  { name: "Excel", category: "Data Science" },
  { name: "Power BI", category: "Data Science" },
  { name: "Java", category: "Programming Languages" },
  { name: "C++", category: "Programming Languages" },
  { name: "Next.js", category: "Frontend Development" },
  { name: "MongoDB", category: "Databases" },
  { name: "PostgreSQL", category: "Databases" },
  { name: "Linux", category: "Systems & Networking" },
  { name: "Kubernetes", category: "Cloud & DevOps" },
  { name: "Communication", category: "Soft Skills" },
  { name: "Problem Solving", category: "Soft Skills" },
  { name: "Leadership", category: "Soft Skills" },
];

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-blue-50 text-blue-700 border-blue-200",
  INTERMEDIATE: "bg-amber-50 text-amber-700 border-amber-200",
  ADVANCED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  EXPERT: "bg-purple-50 text-purple-700 border-purple-200",
};

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({
  current, total, labels,
}: { current: number; total: number; labels: string[] }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-emerald-800">
          Step {current + 1} of {total}
        </span>
        <span className="text-[11px] text-muted">
          {Math.round(((current + 1) / total) * 100)}% complete
        </span>
      </div>
      <div className="w-full h-1.5 bg-sage-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-700 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-charcoal-800">
        {labels[current]}
      </p>
    </div>
  );
}

// ─── Main Onboarding Component ────────────────────────────────────────────────
export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  const [form, setForm] = useState<FormData>({
    role: "TRAINEE",
    orgName: "",
    adminCode: "",
    district: "",
    state: "",
    educationLevel: "",
    fieldOfStudy: "",
    graduationYear: "",
    currentStatus: "",
    experienceYears: "",
    industry: "",
    skills: [],
    skillSearch: "",
    targetRole: "",
    targetIndustry: "",
    employmentType: "Full-time",
  });

  // Determine total steps based on role
  const isTrainee = form.role === "TRAINEE";
  const totalSteps = isTrainee ? 5 : 2;

  const STEP_LABELS = isTrainee
    ? ["Your Role", "Basic Info", "Professional Background", "Your Skills", "Career Goal"]
    : ["Your Role", "Organization Details"];

  const set = (k: keyof FormData, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // ── Skill helpers ────────────────────────────────────────────────────────
  const filteredSkills = skillSearch.trim()
    ? SKILL_SUGGESTIONS.filter(
        (s) =>
          s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
          !form.skills.find((fs) => fs.name === s.name)
      )
    : SKILL_SUGGESTIONS.filter((s) => !form.skills.find((fs) => fs.name === s.name)).slice(0, 12);

  const addSkill = (name: string, category: string) => {
    if (form.skills.find((s) => s.name === name)) return;
    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, { name, category, level: "INTERMEDIATE" }],
    }));
    setSkillSearch("");
  };

  const removeSkill = (name: string) =>
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name !== name),
    }));

  const updateSkillLevel = (name: string, level: SkillEntry["level"]) =>
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.name === name ? { ...s, level } : s)),
    }));

  // ── Validation per step ──────────────────────────────────────────────────
  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.role) return "Please select your role.";
      if (form.role === "GOVERNMENT_ADMIN" && !form.adminCode.trim())
        return "Government authorization code is required.";
      if (
        (form.role === "EMPLOYER" || form.role === "TRAINING_PROVIDER") &&
        !form.orgName.trim()
      )
        return "Organization name is required.";
    }
    if (!isTrainee) return null;
    if (step === 1) {
      if (!form.district.trim()) return "Please enter your district or city.";
    }
    if (step === 2) {
      if (!form.currentStatus) return "Please select your current status.";
    }
    if (step === 3) {
      if (form.skills.length === 0)
        return "Please add at least one skill to continue.";
    }
    if (step === 4) {
      if (!form.targetRole) return "Please select your target career role.";
    }
    return null;
  };

  // ── Navigation ───────────────────────────────────────────────────────────
  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  // ── Final submission ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create profile + role
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          district: form.district || "National",
          orgName: form.orgName,
          adminCode: form.adminCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete onboarding.");
      }

      // Step 2: If trainee, save skills + career target
      if (isTrainee) {
        // Save skills
        if (form.skills.length > 0) {
          await fetch("/api/trainee/onboarding-skills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skills: form.skills }),
          });
        }

        // Save career target
        if (form.targetRole) {
          await fetch("/api/trainee/onboarding-career-target", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetRole: form.targetRole,
              industry: form.targetIndustry || form.industry || null,
              employmentType: form.employmentType
                ? form.employmentType.toUpperCase().replace("-", "_")
                : "FULL_TIME",
            }),
          });
        }

        // Generate roadmap if we have career target
        if (form.targetRole) {
          await fetch("/api/trainee/roadmap/generate", {
            method: "POST",
          });
        }
      }

      await update({ role: form.role });

      // Redirect
      const redirectMap: Record<string, string> = {
        TRAINEE: "/trainee",
        EMPLOYER: "/employer",
        TRAINING_PROVIDER: "/provider",
        GOVERNMENT_ADMIN: "/admin",
      };
      router.push(redirectMap[form.role] || "/");
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  // ─── Render steps ─────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-charcoal-800">
          How will you use CareerLoop?
        </h2>
        <p className="text-xs text-muted">
          Select your role to set up the right workspace for you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: "TRAINEE", label: "Trainee / Job Seeker", icon: GraduationCap, desc: "Build your career profile, track skills, get job-ready" },
          { id: "EMPLOYER", label: "Employer", icon: Building2, desc: "Post jobs, find verified candidates, verify employment" },
          { id: "TRAINING_PROVIDER", label: "Training Provider", icon: BookOpen, desc: "Manage training programs and track outcomes" },
          { id: "GOVERNMENT_ADMIN", label: "Government Admin", icon: Landmark, desc: "Outcome intelligence and policy insights" },
        ].map((r) => {
          const Icon = r.icon;
          const active = form.role === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => set("role", r.id as Role)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                active
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                  : "bg-white text-charcoal-800 hover:bg-sage-50 border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4" />
                <span className="font-bold text-xs">{r.label}</span>
              </div>
              <p className={`text-[11px] leading-snug ${active ? "text-emerald-100" : "text-muted"}`}>
                {r.desc}
              </p>
            </button>
          );
        })}
      </div>

      {(form.role === "EMPLOYER" || form.role === "TRAINING_PROVIDER") && (
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Organization / Institution Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.orgName}
            onChange={(e) => set("orgName", e.target.value)}
            placeholder={form.role === "EMPLOYER" ? "e.g. Apex Solutions Pvt. Ltd." : "e.g. Pune Skill Development Hub"}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      )}

      {form.role === "GOVERNMENT_ADMIN" && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
          <label className="block text-xs font-bold text-amber-900">
            Government Authorization Code <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={form.adminCode}
            onChange={(e) => set("adminCode", e.target.value)}
            placeholder="Enter your authorization code"
            className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white"
          />
          <p className="text-[10px] text-amber-700">
            Contact your administrator to obtain this code.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-charcoal-800">
          Basic Information
        </h2>
        <p className="text-xs text-muted">
          Help us personalize your experience. All fields marked * are required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            City / District <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.district}
            onChange={(e) => set("district", e.target.value)}
            placeholder="e.g. Pune, Mumbai, Jaipur"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            State
          </label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            placeholder="e.g. Maharashtra"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
          Highest Education Level
        </label>
        <select
          value={form.educationLevel}
          onChange={(e) => set("educationLevel", e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Select education level</option>
          {EDUCATION_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Field of Study
          </label>
          <input
            type="text"
            value={form.fieldOfStudy}
            onChange={(e) => set("fieldOfStudy", e.target.value)}
            placeholder="e.g. Computer Science, Electronics"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Graduation Year
          </label>
          <input
            type="number"
            value={form.graduationYear}
            onChange={(e) => set("graduationYear", e.target.value)}
            placeholder="e.g. 2024"
            min="1990"
            max="2030"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-charcoal-800">
          Professional Background
        </h2>
        <p className="text-xs text-muted">
          Tell us where you are in your career journey.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal-700 mb-2">
          Current Status <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CURRENT_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("currentStatus", s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                form.currentStatus === s
                  ? "bg-emerald-800 text-white border-emerald-900"
                  : "bg-white text-charcoal-700 border-border hover:bg-sage-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Years of Experience
          </label>
          <select
            value={form.experienceYears}
            onChange={(e) => set("experienceYears", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Select experience</option>
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Industry
          </label>
          <select
            value={form.industry}
            onChange={(e) => set("industry", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-charcoal-800">
          Your Skills
        </h2>
        <p className="text-xs text-muted">
          Search and add the skills you already have. Set your current level for each.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
        <input
          type="text"
          value={skillSearch}
          onChange={(e) => setSkillSearch(e.target.value)}
          placeholder="Search skills… e.g. React, Python, Figma"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Suggestions */}
      {filteredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filteredSkills.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => addSkill(s.name, s.category)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sage-50 text-charcoal-700 border border-sage-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 transition"
            >
              <Plus className="w-3 h-3" />
              {s.name}
            </button>
          ))}
          {skillSearch && !SKILL_SUGGESTIONS.find((s) => s.name.toLowerCase() === skillSearch.toLowerCase()) && (
            <button
              type="button"
              onClick={() => addSkill(skillSearch, "Other")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <Plus className="w-3 h-3" />
              Add "{skillSearch}"
            </button>
          )}
        </div>
      )}

      {/* Selected skills */}
      {form.skills.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
            Your Skills ({form.skills.length})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {form.skills.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between bg-white border border-border rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-charcoal-800">{s.name}</span>
                  <span className="text-[10px] text-muted">{s.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={s.level}
                    onChange={(e) => updateSkillLevel(s.name, e.target.value as SkillEntry["level"])}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[s.level]} focus:outline-none`}
                  >
                    {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSkill(s.name)}
                    className="text-muted hover:text-red-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-6 text-center border border-dashed border-border rounded-2xl">
          <Award className="w-6 h-6 text-muted mx-auto mb-2" />
          <p className="text-xs text-muted">No skills added yet.</p>
          <p className="text-[11px] text-muted/70">Search above or click a suggestion to add skills.</p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-charcoal-800">
          Your Career Goal
        </h2>
        <p className="text-xs text-muted">
          Where do you want to go? CareerLoop will build your personalized roadmap from here.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal-700 mb-2">
          Target Role <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {CAREER_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set("targetRole", r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                form.targetRole === r
                  ? "bg-emerald-800 text-white border-emerald-900"
                  : "bg-white text-charcoal-700 border-border hover:bg-sage-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Target Industry
          </label>
          <select
            value={form.targetIndustry}
            onChange={(e) => set("targetIndustry", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Preferred Work Type
          </label>
          <select
            value={form.employmentType}
            onChange={(e) => set("employmentType", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderNonTraineeStep1 = () => (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-charcoal-800">
          Organization Details
        </h2>
        <p className="text-xs text-muted">Almost done — just a few more details.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
          Headquarters City / District
        </label>
        <input
          type="text"
          value={form.district}
          onChange={(e) => set("district", e.target.value)}
          placeholder="e.g. Bangalore, Pune, Delhi"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (step === 0) return renderStep0();
    if (!isTrainee) return renderNonTraineeStep1();
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    if (step === 4) return renderStep4();
    return null;
  };

  const isLastStep = step === totalSteps - 1;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-50 opacity-60 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-sage-50 opacity-60 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-extrabold text-lg text-charcoal-800">
              CareerLoop
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-border shadow-card p-6 sm:p-8 space-y-6">

          {/* Step indicator */}
          <StepIndicator
            current={step}
            total={totalSteps}
            labels={STEP_LABELS}
          />

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step content */}
          <div>{renderCurrentStep()}</div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-semibold text-charcoal-700 hover:bg-sage-50 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={next}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm transition disabled:opacity-60"
            >
              {loading ? (
                <span>Setting up your profile…</span>
              ) : isLastStep ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Launch My Profile</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted mt-4">
          Already have an account?{" "}
          <Link href="/signin" className="text-emerald-800 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
