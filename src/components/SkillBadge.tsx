import React from "react";
import { Award, CheckCircle2 } from "lucide-react";

interface SkillBadgeProps {
  name: string;
  proficiency?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | string;
  verifiedByAssessment?: boolean;
  verifiedByEmployer?: boolean;
  category?: string;
}

export default function SkillBadge({
  name,
  proficiency = "INTERMEDIATE",
  verifiedByAssessment = false,
  verifiedByEmployer = false,
  category,
}: SkillBadgeProps) {
  const isVerified = verifiedByAssessment || verifiedByEmployer;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sage-50 border border-sage-200 text-charcoal-800 text-xs font-medium hover:border-emerald-300 transition">
      <span>{name}</span>
      
      {category && (
        <span className="text-[10px] text-muted font-normal">({category})</span>
      )}

      {proficiency && (
        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white text-muted border border-border">
          {proficiency.slice(0, 3)}
        </span>
      )}

      {isVerified && (
        <span title={verifiedByAssessment ? "Verified by Practical Assessment" : "Verified by Employer"}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
        </span>
      )}
    </div>
  );
}
