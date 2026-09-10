import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DistrictHeatBar from "@/components/Charts/DistrictHeatBar";
import EmptyState from "@/components/EmptyState";
import { getDistrictAnalytics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Users, Award, Briefcase, TrendingUp, AlertTriangle } from "lucide-react";

export const revalidate = 0;

export default async function AdminDistrictsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const districtData = await getDistrictAnalytics();

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          District-Level Outcome Intelligence
        </h1>
        <p className="text-xs text-muted">
          Compare training enrollment, certification pass rates, positive livelihood conversion, and regional retention across districts.
        </p>
      </div>

      {/* Visual Chart Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div>
            <h3 className="font-display font-bold text-base text-charcoal-800">
              District Training vs. Certification vs. Placement
            </h3>
            <p className="text-xs text-muted">
              Comparative volume conversion across regional vocational hubs
            </p>
          </div>
        </div>

        <DistrictHeatBar data={districtData} />
      </div>

      {/* Detailed District Comparison Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            District Performance Scorecard ({districtData.length} Districts)
          </h3>
        </div>

        {districtData.length === 0 ? (
          <EmptyState
            title="Insufficient District Outcome Data"
            description="District analytics populate automatically when trainees across districts submit outcomes."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted uppercase font-bold text-[10px] tracking-wider">
                  <th className="pb-3 pr-4">District</th>
                  <th className="pb-3 px-4">Trained</th>
                  <th className="pb-3 px-4">Certified</th>
                  <th className="pb-3 px-4">Placed / Working</th>
                  <th className="pb-3 px-4">Placement Rate</th>
                  <th className="pb-3 px-4">90-Day Retention</th>
                  <th className="pb-3 px-4">Avg Monthly Wage</th>
                  <th className="pb-3 pl-4">Non-Placements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {districtData.map((d) => (
                  <tr key={d.district} className="hover:bg-sage-50/50 transition">
                    <td className="py-3.5 pr-4 font-bold text-charcoal-800 text-sm flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                      <span>{d.district}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-charcoal-700">
                      {d.totalCount}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-charcoal-700">
                      {d.certifiedCount}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">
                      {d.employedCount + d.selfEmployedCount + d.apprenticeshipCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold px-2 py-0.5 rounded-full ${d.employmentRate >= 70 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                        {d.employmentRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-charcoal-800">
                      {d.retentionRate90 > 0 ? `${d.retentionRate90}%` : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-charcoal-800">
                      {d.avgSalary > 0 ? formatCurrency(d.avgSalary) : "—"}
                    </td>
                    <td className="py-3.5 pl-4 text-muted">
                      {d.nonPlacementCount} reported
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
