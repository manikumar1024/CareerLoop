import React from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-sage-200/60 ${className || "h-6 w-full"}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-4 border-b border-border/60">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}
