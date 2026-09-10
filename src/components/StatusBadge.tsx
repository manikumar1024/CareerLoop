import React from "react";
import { CheckCircle2, Clock, AlertCircle, XCircle, ShieldCheck } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const normalized = status?.toUpperCase() || "UNKNOWN";

  let bg = "bg-gray-100 text-gray-700 border-gray-200";
  let Icon = Clock;
  let label = status?.replace(/_/g, " ");

  if (normalized === "EMPLOYER_VERIFIED" || normalized === "VERIFIED" || normalized === "COMPLETED" || normalized === "PROVIDER_VERIFIED") {
    bg = "bg-emerald-50 text-emerald-800 border-emerald-200";
    Icon = ShieldCheck;
    if (normalized === "EMPLOYER_VERIFIED") label = "Employer Verified";
    else if (normalized === "PROVIDER_VERIFIED") label = "Provider Verified";
  } else if (normalized === "SELF_REPORTED") {
    bg = "bg-blue-50 text-blue-800 border-blue-200";
    Icon = CheckCircle2;
    label = "Self-Reported";
  } else if (normalized === "PENDING_VERIFICATION" || normalized === "IN_PROGRESS" || normalized === "UPLOADED") {
    bg = "bg-amber-50 text-amber-800 border-amber-200";
    Icon = Clock;
    if (normalized === "PENDING_VERIFICATION") label = "Pending Verification";
    else if (normalized === "UPLOADED") label = "Uploaded";
  } else if (normalized === "REJECTED" || normalized === "DROPPED" || normalized === "FAILED" || normalized === "EXPIRED") {
    bg = "bg-red-50 text-red-700 border-red-200";
    Icon = XCircle;
  } else if (normalized === "EMPLOYED") {
    bg = "bg-emerald-50 text-emerald-800 border-emerald-200";
    Icon = CheckCircle2;
  } else if (normalized === "SELF_EMPLOYED") {
    bg = "bg-purple-50 text-purple-800 border-purple-200";
    Icon = CheckCircle2;
  } else if (normalized === "APPRENTICESHIP") {
    bg = "bg-cyan-50 text-cyan-800 border-cyan-200";
    Icon = CheckCircle2;
  } else if (normalized === "UNEMPLOYED") {
    bg = "bg-orange-50 text-orange-800 border-orange-200";
    Icon = AlertCircle;
  }

  const px = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${px} ${bg}`}>
      <Icon className={iconSize} />
      <span className="capitalize">{label}</span>
    </span>
  );
}
