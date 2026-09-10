import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import SkillBadge from "@/components/SkillBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Building2, ShieldCheck, Mail, MapPin } from "lucide-react";

export const revalidate = 0;

export default async function EmployerEmployeesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer) return null;

  const verifiedEmployees = await prisma.employmentRecord.findMany({
    where: {
      employerId: employer.id,
      verificationStatus: "EMPLOYER_VERIFIED",
    },
    include: {
      trainee: {
        include: {
          user: true,
          skills: { include: { skill: true } },
          certifications: { include: { program: true } },
          followUps: { where: { isCompleted: true }, orderBy: { milestoneDays: "desc" } },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Verified Employee Directory
        </h1>
        <p className="text-xs text-muted">
          Active roster of verified vocational trainees employed at {employer.companyName}.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Confirmed Recruits ({verifiedEmployees.length})
          </h3>
        </div>

        {verifiedEmployees.length === 0 ? (
          <EmptyState
            title="No Verified Recruits Found"
            description="Trainee employment claims must first be verified in the verification queue."
            actionText="Go to Verification Queue"
            actionHref="/employer/verifications"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedEmployees.map((emp) => {
              const latestFollowup = emp.trainee.followUps[0];

              return (
                <div
                  key={emp.id}
                  className="p-5 rounded-2xl bg-sage-50/50 border border-sage-200 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display font-bold text-base text-charcoal-800">
                        {emp.trainee.user.name}
                      </h4>
                      <p className="font-mono text-[10px] text-emerald-800 font-bold">
                        {emp.trainee.traineeId}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Verified
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-charcoal-700">
                    <p>Designation: <strong>{emp.jobTitle}</strong></p>
                    <p>Starting Salary: <strong>{formatCurrency(emp.monthlySalary)} / mo</strong></p>
                    {latestFollowup?.currentSalary && latestFollowup.currentSalary > emp.monthlySalary && (
                      <p className="text-emerald-700 font-semibold">
                        Current Wage: {formatCurrency(latestFollowup.currentSalary)} (+{latestFollowup.wageIncreasePercent}%)
                      </p>
                    )}
                    <p className="text-muted text-[11px]">Joined {formatDate(emp.startDate)}</p>
                  </div>

                  {emp.trainee.skills.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-[10px] uppercase font-bold text-muted mb-1.5">Competencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {emp.trainee.skills.map((ts) => (
                          <span key={ts.id} className="text-[10px] px-2 py-0.5 rounded bg-white text-charcoal-800 border border-border">
                            {ts.skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
