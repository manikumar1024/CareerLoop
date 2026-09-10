import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SkillBadge from "@/components/SkillBadge";
import { INDUSTRY_ROLE_TAXONOMY } from "@/lib/ai-service";
import { Sparkles, Award, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export const revalidate = 0;

export default async function AdminSkillsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const skills = await prisma.skill.findMany({
    include: {
      traineeSkills: true,
    },
  });

  const taxonomies = Object.entries(INDUSTRY_ROLE_TAXONOMY);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Skill Gap & Industry Demand Intelligence
        </h1>
        <p className="text-xs text-muted">
          Aggregated competency supply across active cohorts benchmarked against standardized industry role requirements.
        </p>
      </div>

      {/* Standard Role Taxonomy Benchmarks */}
      <div className="space-y-6">
        <h3 className="font-display font-bold text-lg text-charcoal-800">
          Standard Industry Role Taxonomies & Competency Blueprints
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taxonomies.map(([roleName, data]) => (
            <div
              key={roleName}
              className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-display font-bold text-base text-charcoal-800 mb-1">
                  {roleName}
                </h4>
                <p className="text-xs text-muted mb-3 leading-relaxed">
                  {data.description}
                </p>

                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-800 mb-1">Core Mandatory Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {data.core.map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted mb-1">Recommended Electives:</p>
                    <div className="flex flex-wrap gap-1">
                      {data.electives.map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-sage-50 text-charcoal-700 border border-border">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 text-[11px] text-muted flex items-center justify-between">
                <span>Industry Benchmark Wage</span>
                <span className="font-bold text-emerald-800">₹{data.avgSalary.toLocaleString()} / mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mapped Skills Supply in Active Database */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <h3 className="font-display font-bold text-base text-charcoal-800">
            Current Demonstrated Skill Inventory ({skills.length} Skills)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {skills.map((s) => (
            <div key={s.id} className="p-3.5 rounded-2xl bg-sage-50/50 border border-sage-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-charcoal-800">{s.name}</p>
                <p className="text-[10px] text-muted">{s.category}</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-border">
                {s.traineeSkills.length} candidates
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
