import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Briefcase, MapPin, Search, Filter, ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default async function AdminOutcomesPage({
  searchParams,
}: {
  searchParams: { q?: string; district?: string; status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const searchQuery = searchParams.q || "";
  const districtFilter = searchParams.district || "";
  const statusFilter = searchParams.status || "";

  const whereClause: any = {};
  if (districtFilter) {
    whereClause.district = districtFilter;
  }
  if (statusFilter) {
    whereClause.currentStatus = statusFilter;
  }

  const trainees = await prisma.traineeProfile.findMany({
    where: whereClause,
    include: {
      user: true,
      enrollments: { include: { program: true } },
      certifications: true,
      employmentRecords: { where: { isCurrent: true } },
      selfEmployments: true,
      apprenticeships: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const filteredTrainees = trainees.filter((t) => {
    if (!searchQuery) return true;
    const nameMatch = t.user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = t.traineeId.toLowerCase().includes(searchQuery.toLowerCase());
    const distMatch = t.district.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || idMatch || distMatch;
  });

  const allDistricts = Array.from(new Set(trainees.map((t) => t.district)));

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          National Trainee Outcome Roster
        </h1>
        <p className="text-xs text-muted">
          Individual longitudinal outcome tracking across programs, employers, and districts.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <form method="GET" className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search candidate name, CLP-ID, or district..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-sage-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <select
            name="district"
            defaultValue={districtFilter}
            className="px-3 py-2 rounded-xl border border-border bg-white"
          >
            <option value="">All Districts</option>
            {allDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={statusFilter}
            className="px-3 py-2 rounded-xl border border-border bg-white"
          >
            <option value="">All Statuses</option>
            <option value="EMPLOYED">Employed</option>
            <option value="SELF_EMPLOYED">Self-Employed</option>
            <option value="APPRENTICESHIP">Apprenticeship</option>
            <option value="UNEMPLOYED">Unemployed</option>
            <option value="TRAINING">In Training</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold transition"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Trainee Records ({filteredTrainees.length})
          </h3>
        </div>

        {filteredTrainees.length === 0 ? (
          <EmptyState
            title="No Trainees Found"
            description="No trainee records matched your search or filter query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted uppercase font-bold text-[10px] tracking-wider">
                  <th className="pb-3 pr-4">Candidate / ID</th>
                  <th className="pb-3 px-4">District</th>
                  <th className="pb-3 px-4">Training Program</th>
                  <th className="pb-3 px-4">Current Outcome</th>
                  <th className="pb-3 px-4">Monthly Wage</th>
                  <th className="pb-3 pl-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTrainees.map((t) => {
                  const program = t.enrollments[0]?.program;
                  const emp = t.employmentRecords[0];
                  const selfBiz = t.selfEmployments[0];
                  const appr = t.apprenticeships[0];

                  const salary = emp ? emp.monthlySalary : selfBiz ? selfBiz.monthlyNetIncome : appr ? appr.stipendAmount : null;
                  const verificationStatus = emp ? emp.verificationStatus : "SELF_REPORTED";

                  return (
                    <tr key={t.id} className="hover:bg-sage-50/50 transition">
                      <td className="py-3.5 pr-4">
                        <p className="font-bold text-charcoal-800 text-sm">{t.user.name}</p>
                        <p className="font-mono text-[10px] text-emerald-800 font-semibold">{t.traineeId}</p>
                      </td>
                      <td className="py-3.5 px-4 text-muted font-medium">
                        {t.district}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-charcoal-800 truncate max-w-xs">{program?.title || "Vocational Skilling"}</p>
                        <p className="text-[10px] text-muted">{program?.sector || "General"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={t.currentStatus} />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-charcoal-800">
                        {formatCurrency(salary)}
                      </td>
                      <td className="py-3.5 pl-4">
                        <StatusBadge status={verificationStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
