import React from "react";
import { 
  GraduationCap, 
  Award, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Building,
  DollarSign
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  type: "TRAINING" | "CERTIFICATION" | "PLACEMENT" | "EMPLOYMENT" | "FOLLOWUP" | "PROMOTION";
  title: string;
  subtitle: string;
  date: Date | string;
  details?: string;
  salary?: number;
  status?: string;
  isVerified?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
  emptyMessage?: string;
}

export default function Timeline({ events, emptyMessage }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted">
        {emptyMessage || "No longitudinal career events recorded yet."}
      </div>
    );
  }

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "TRAINING": return GraduationCap;
      case "CERTIFICATION": return Award;
      case "PLACEMENT": return Briefcase;
      case "EMPLOYMENT": return Building;
      case "FOLLOWUP": return Clock;
      case "PROMOTION": return TrendingUp;
      default: return CheckCircle2;
    }
  };

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "TRAINING": return "bg-blue-50 text-blue-800 border-blue-200";
      case "CERTIFICATION": return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "PLACEMENT": return "bg-purple-50 text-purple-800 border-purple-200";
      case "EMPLOYMENT": return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "FOLLOWUP": return "bg-amber-50 text-amber-800 border-amber-200";
      case "PROMOTION": return "bg-emerald-50 text-emerald-800 border-emerald-200";
      default: return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-3 sm:before:left-4 before:w-0.5 before:bg-sage-200">
      {events.map((event) => {
        const Icon = getEventIcon(event.type);
        const colorClasses = getEventColor(event.type);

        return (
          <div key={event.id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full border flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 ${colorClasses}`}
            >
              <Icon className="w-3 sm:w-4 h-3 sm:h-4" />
            </div>

            {/* Event content card */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-border shadow-xs hover:border-sage-300 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <h4 className="font-display font-semibold text-sm sm:text-base text-charcoal-800">
                  {event.title}
                </h4>
                <span className="text-[11px] text-muted flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  {formatDate(event.date)}
                </span>
              </div>

              <p className="text-xs text-charcoal-600 mb-2 font-medium">
                {event.subtitle}
              </p>

              {event.details && (
                <p className="text-xs text-muted leading-relaxed mb-3">
                  {event.details}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
                {event.salary !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(event.salary)} / mo
                  </span>
                )}

                {event.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified by Employer
                  </span>
                )}

                {event.status && (
                  <span className="px-2.5 py-0.5 rounded-full bg-sage-50 text-charcoal-700 font-medium capitalize">
                    {event.status.toLowerCase().replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
