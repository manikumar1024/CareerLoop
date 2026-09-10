import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: LucideIcon;
  badge?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  badge,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-card hover:shadow-elevated transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
              {value}
            </h3>
            {badge && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
        {subtitle && <p className="text-muted leading-tight">{subtitle}</p>}
        {trend && (
          <div
            className={`flex items-center gap-1 font-medium text-[11px] shrink-0 ml-auto ${
              trend.isNeutral
                ? "text-muted"
                : trend.isPositive
                ? "text-emerald-700"
                : "text-amber-600"
            }`}
          >
            {trend.isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
