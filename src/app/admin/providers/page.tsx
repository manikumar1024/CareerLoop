import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { Building2, Award, Users, ShieldCheck, MapPin } from "lucide-react";

export const revalidate = 0;

export default async function AdminProvidersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const providers = await prisma.trainingProviderProfile.findMany({
    include: {
      programs: {
        include: {
          enrollments: {
            include: {
              trainee: {
                include: {
                  employmentRecords: { where: { isCurrent: true } },
                  selfEmployments: true,
                  apprenticeships: true,
                  followUps: { where: { isCompleted: true } },
                },
              },
            },
          },
          certifications: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Training Provider Performance Scorecard
        </h1>
        <p className="text-xs text-muted">
          Provider evaluation based on audit-verified graduate outcomes, retention rates, and wage progression.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Accredited Centers Roster ({providers.length})
          </h3>
        </div>

        {providers.length === 0 ? (
          <EmptyState
            title="No Training Providers Found"
            description="Training provider scorecards will populate as institutions register."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted uppercase font-bold text-[10px] tracking-wider">
                  <th className="pb-3 pr-4">Institution / Accreditation</th>
                  <th className="pb-3 px-4">District</th>
                  <th className="pb-3 px-4">Active Batches</th>
                  <th className="pb-3 px-4">Trainees</th>
                  <th className="pb-3 px-4">Certified</th>
                  <th className="pb-3 px-4">Placement Rate</th>
                  <th className="pb-3 pl-4">6-Month Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {providers.map((p) => {
                  const enrollments = p.programs.flatMap((pr) => pr.enrollments);
                  const totalCertified = p.programs.reduce((acc, pr) => acc + pr.certifications.length, 0);
                  const placed = enrollments.filter(
                    (e) =>
                      e.trainee.employmentRecords.length > 0 ||
                      e.trainee.selfEmployments.length > 0 ||
                      e.trainee.apprenticeships.length > 0
                  );

                  const placementRate = totalCertified > 0 ? Math.round((placed.length / totalCertified) * 100) : 0;
                  
                  const allFollowups = enrollments.flatMap((e) => e.trainee.followUps);
                  const f180 = allFollowups.filter((f) => f.milestoneDays === 180);
                  const retained180 = f180.filter((f) => f.isEmployed).length;
                  const retRate = f180.length > 0 ? Math.round((retained180 / f180.length) * 100) : 100;

                  return (
                    <tr key={p.id} className="hover:bg-sage-50/50 transition">
                      <td className="py-3.5 pr-4">
                        <p className="font-bold text-charcoal-800 text-sm">{p.institutionName}</p>
                        <p className="font-mono text-[10px] text-muted">{p.accreditationNumber || "Accredited Center"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-muted font-medium">
                        {p.district}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-charcoal-800">
                        {p.programs.length} programs
                      </td>
                      <td className="py-3.5 px-4 font-medium text-charcoal-700">
                        {enrollments.length}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-charcoal-700">
                        {totalCertified}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs">
                          {placementRate}%
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 font-bold text-charcoal-800">
                        {retRate}%
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
