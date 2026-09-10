import React from "react";
import Link from "next/link";
import { LucideIcon, Inbox, PlusCircle, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  secondaryText?: string;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  actionHref,
  onActionClick,
  secondaryText,
}: EmptyStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl bg-white border border-dashed border-border text-center">
      <div className="w-14 h-14 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center text-emerald-800 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>

      <h4 className="font-display font-bold text-lg text-charcoal-800 mb-2">
        {title}
      </h4>

      <p className="text-xs sm:text-sm text-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {secondaryText && (
        <p className="text-xs text-emerald-800/80 bg-emerald-50 px-3 py-1 rounded-full mb-6 font-mono">
          {secondaryText}
        </p>
      )}

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </Link>
      )}

      {actionText && !actionHref && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
