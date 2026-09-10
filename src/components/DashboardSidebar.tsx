"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  User, 
  GraduationCap, 
  Award, 
  Briefcase, 
  Clock, 
  Sparkles, 
  Settings, 
  Building2, 
  CheckSquare, 
  Users, 
  BarChart3, 
  BookOpen, 
  MapPin, 
  PieChart, 
  Shield, 
  FileSpreadsheet,
  Layers,
  ArrowLeft,
  ChevronRight
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface DashboardSidebarProps {
  role: "TRAINEE" | "EMPLOYER" | "TRAINING_PROVIDER" | "GOVERNMENT_ADMIN";
  title: string;
  userEmail?: string;
}

export default function DashboardSidebar({ role, title, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();

  const getLinks = (): SidebarItem[] => {
    switch (role) {
      case "TRAINEE":
        return [
          { label: "Overview", href: "/trainee", icon: Home },
          { label: "My Profile", href: "/trainee/profile", icon: User },
          { label: "My Skills", href: "/trainee/skills", icon: Award },
          { label: "Training & Certs", href: "/trainee/training", icon: GraduationCap },
          { label: "Employment Journey", href: "/trainee/outcomes", icon: Briefcase },
          { label: "Follow-ups", href: "/trainee/followups", icon: Clock },
          { label: "AI Recommendations", href: "/trainee/recommendations", icon: Sparkles },
          { label: "Settings & Consent", href: "/trainee/settings", icon: Settings },
        ];

      case "EMPLOYER":
        return [
          { label: "Dashboard", href: "/employer", icon: Home },
          { label: "Company Profile", href: "/employer/profile", icon: Building2 },
          { label: "Verifications", href: "/employer/verifications", icon: CheckSquare },
          { label: "Verified Employees", href: "/employer/employees", icon: Users },
          { label: "Retention Analytics", href: "/employer/analytics", icon: BarChart3 },
        ];

      case "TRAINING_PROVIDER":
        return [
          { label: "Overview", href: "/provider", icon: Home },
          { label: "Programs & Batches", href: "/provider/programs", icon: BookOpen },
          { label: "Placement & Outcomes", href: "/provider/outcomes", icon: Briefcase },
          { label: "Outcome Analytics", href: "/provider/analytics", icon: BarChart3 },
        ];

      case "GOVERNMENT_ADMIN":
        return [
          { label: "Executive Overview", href: "/admin", icon: Home },
          { label: "Trainee Outcomes", href: "/admin/outcomes", icon: Briefcase },
          { label: "District Intelligence", href: "/admin/districts", icon: MapPin },
          { label: "Course Performance", href: "/admin/courses", icon: BookOpen },
          { label: "Provider Scorecard", href: "/admin/providers", icon: Building2 },
          { label: "Skill Gap Demand", href: "/admin/skills", icon: Sparkles },
          { label: "Retention & Wages", href: "/admin/retention", icon: PieChart },
          { label: "Policy Interventions", href: "/admin/reports", icon: FileSpreadsheet },
          { label: "Audit & Consent Logs", href: "/admin/audit", icon: Shield },
        ];

      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-border min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        
        {/* Header Capsule */}
        <div className="px-3 py-2 rounded-xl bg-sage-50 border border-sage-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
            {role.replace("_", " ")}
          </p>
          <h3 className="font-display font-bold text-sm text-charcoal-800 truncate">
            {title}
          </h3>
          {userEmail && (
            <p className="text-[11px] text-muted truncate">{userEmail}</p>
          )}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-xs font-semibold"
                    : "text-charcoal-700 hover:bg-sage-50 hover:text-emerald-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-800/70"}`} />
                  <span>{link.label}</span>
                </div>

                {link.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switch Portal Helper */}
      <div className="pt-4 border-t border-border mt-6">
        <Link
          href="/signin"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted hover:text-charcoal-800 hover:bg-sage-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch Role / Portal</span>
        </Link>
      </div>
    </aside>
  );
}
