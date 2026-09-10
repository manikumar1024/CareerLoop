"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, User, ShieldCheck } from "lucide-react";

interface RoleHeaderProps {
  portalName: string;
  roleBadge: string;
  userName?: string;
  userEmail?: string;
}

export default function RoleHeader({
  portalName,
  roleBadge,
  userName,
  userEmail,
}: RoleHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-border px-4 sm:px-8 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand + Role Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-xs tracking-tighter shadow-sm group-hover:bg-emerald-700 transition">
              CL
            </span>
            <span className="font-display font-bold text-lg text-charcoal-800 hidden sm:inline">
              careerloop<span className="text-emerald-700 font-extrabold">.ai</span>
            </span>
          </Link>

          <span className="text-border text-lg font-light hidden sm:inline">/</span>

          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-charcoal-800">
              {portalName}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {roleBadge}
            </span>
          </div>
        </div>

        {/* Right: Authenticated User Info & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-charcoal-800 leading-tight truncate max-w-[180px]">
              {userName || "Authenticated User"}
            </span>
            {userEmail && (
              <span className="text-[10px] text-muted truncate max-w-[180px]">
                {userEmail}
              </span>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-sage-50/60 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-charcoal-700 text-xs font-semibold transition"
            title="Secure Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

      </div>
    </header>
  );
}
