import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { revalidatePath } from "next/cache";
import { formatCurrency, formatDate } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { 
  Briefcase, 
  Building2, 
  DollarSign, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Star,
  Users,
  Compass
} from "lucide-react";

export const revalidate = 0;

export default async function TraineeOutcomesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      employmentRecords: { include: { employer: true } },
      selfEmployments: true,
      apprenticeships: true,
    },
  });

  if (!trainee) return null;

  // Registered employers in the platform for direct linking
  const employers = await prisma.employerProfile.findMany({
    select: { id: true, companyName: true, industry: true, district: true },
  });

  async function addEmploymentAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const companyName = formData.get("companyName") as string;
    const employerId = (formData.get("employerId") as string) || null;
    const jobTitle = formData.get("jobTitle") as string;
    const locationDistrict = formData.get("locationDistrict") as string;
    const monthlySalary = parseInt(formData.get("monthlySalary") as string) || 20000;
    const employmentType = formData.get("employmentType") as string;
    const startDate = new Date(formData.get("startDate") as string || Date.now());
    const skillRelevanceScore = parseInt(formData.get("skillRelevanceScore") as string) || 4;

    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: userSession.id },
    });
    if (!traineeProfile) return;

    await prisma.employmentRecord.create({
      data: {
        traineeId: traineeProfile.id,
        employerId: employerId || undefined,
        companyName,
        jobTitle,
        locationDistrict,
        monthlySalary,
        employmentType,
        startDate,
        skillRelevanceScore,
        verificationStatus: employerId ? "PENDING_VERIFICATION" : "SELF_REPORTED",
        isCurrent: true,
      },
    });

    // Update trainee current status
    await prisma.traineeProfile.update({
      where: { id: traineeProfile.id },
      data: { currentStatus: "EMPLOYED" },
    });

    await logAuditAction({
      userId: userSession.id,
      role: "TRAINEE",
      action: "RECORDED_EMPLOYMENT",
      targetEntity: "EmploymentRecord",
      metadata: { companyName, jobTitle, monthlySalary },
    });

    revalidatePath("/trainee/outcomes");
    revalidatePath("/trainee");
  }

  async function addSelfEmploymentAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const businessName = formData.get("businessName") as string;
    const businessType = formData.get("businessType") as string;
    const sector = formData.get("sector") as string;
    const monthlyNetIncome = parseInt(formData.get("monthlyNetIncome") as string) || 25000;
    const employeesHired = parseInt(formData.get("employeesHired") as string) || 0;
    const skillsApplied = formData.get("skillsApplied") as string;
    const startDate = new Date(formData.get("startDate") as string || Date.now());

    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: userSession.id },
    });
    if (!traineeProfile) return;

    await prisma.selfEmploymentRecord.create({
      data: {
        traineeId: traineeProfile.id,
        businessName,
        businessType,
        sector,
        monthlyNetIncome,
        employeesHired,
        skillsApplied,
        startDate,
        businessStatus: "ACTIVE",
      },
    });

    await prisma.traineeProfile.update({
      where: { id: traineeProfile.id },
      data: { currentStatus: "SELF_EMPLOYED" },
    });

    revalidatePath("/trainee/outcomes");
    revalidatePath("/trainee");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Employment Journey & Outcomes
        </h1>
        <p className="text-xs text-muted">
          Record your formal employment, self-employment ventures, and apprenticeships. Employers can verify formal placement claims.
        </p>
      </div>

      {/* Existing Outcomes List */}
      <div className="space-y-6">
        
        {/* Formal Employment */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-800" />
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Formal Employment Records
              </h3>
            </div>
            <span className="text-xs text-muted">
              {trainee.employmentRecords.length} recorded
            </span>
          </div>

          {trainee.employmentRecords.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted">
              No formal employment records submitted yet. Use the form below to add your job.
            </div>
          ) : (
            <div className="space-y-4">
              {trainee.employmentRecords.map((emp) => (
                <div
                  key={emp.id}
                  className="p-5 rounded-2xl bg-sage-50/60 border border-sage-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-base text-charcoal-800">
                        {emp.jobTitle}
                      </h4>
                      <StatusBadge status={emp.verificationStatus} />
                    </div>

                    <p className="text-xs text-charcoal-700 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-muted" />
                      <span>{emp.companyName}</span>
                      <span className="text-muted">· {emp.locationDistrict}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted pt-1">
                      <span className="font-semibold text-emerald-800">
                        {formatCurrency(emp.monthlySalary)} / month
                      </span>
                      <span>·</span>
                      <span>Joined {formatDate(emp.startDate)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-charcoal-700">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        Skill Relevance: {emp.skillRelevanceScore}/5
                      </span>
                    </div>
                  </div>

                  {emp.verificationStatus === "EMPLOYER_VERIFIED" && (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Audit Verified</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Self-Employment Ventures */}
        {trainee.selfEmployments.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <Compass className="w-5 h-5 text-purple-800" />
              <h3 className="font-display font-bold text-base text-charcoal-800">
                Self-Employment & Enterprise
              </h3>
            </div>

            <div className="space-y-3">
              {trainee.selfEmployments.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200 flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-charcoal-800">{s.businessName}</h4>
                    <p className="text-xs text-muted">{s.businessType} · {s.sector}</p>
                    <p className="text-[11px] text-charcoal-700 mt-1">Skills: {s.skillsApplied || "Applied Vocational Competencies"}</p>
                  </div>
                  <div className="text-left sm:text-right text-xs">
                    <p className="font-bold text-purple-900">{formatCurrency(s.monthlyNetIncome)} / mo</p>
                    <p className="text-[10px] text-muted">{s.employeesHired} jobs created</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Forms Section: Add Employment Record */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <Plus className="w-5 h-5 text-emerald-700" />
          <h3 className="font-display font-bold text-lg text-charcoal-800">
            Record New Formal Employment
          </h3>
        </div>

        <form action={addEmploymentAction} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Employer / Company Name
              </label>
              <input
                type="text"
                name="companyName"
                required
                placeholder="e.g. Apex InfoSolutions Pvt Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Link Registered Partner Employer (Optional)
              </label>
              <select
                name="employerId"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">-- Other / Unregistered Employer --</option>
                {employers.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.companyName} ({emp.industry} · {emp.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Job Title / Designation
              </label>
              <input
                type="text"
                name="jobTitle"
                required
                placeholder="e.g. Junior Software Engineer, Solar Site Tech"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Job Location District
              </label>
              <input
                type="text"
                name="locationDistrict"
                required
                defaultValue={trainee.district || "Pune"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Starting Monthly Salary (₹ INR)
              </label>
              <input
                type="number"
                name="monthlySalary"
                required
                defaultValue={25000}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Employment Type
              </label>
              <select
                name="employmentType"
                defaultValue="FULL_TIME"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract Basis</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Skill Relevance Score (1 to 5)
              </label>
              <select
                name="skillRelevanceScore"
                defaultValue="5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="5">5 - Highly Relevant (Daily core tasks use training skills)</option>
                <option value="4">4 - Relevant (Most tasks align with training)</option>
                <option value="3">3 - Moderately Relevant (Some skill overlap)</option>
                <option value="2">2 - Low Relevance (Minor use of skills)</option>
                <option value="1">1 - Not Relevant (Unrelated industry role)</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
            >
              Submit Employment Record
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
