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
  Target,
  MessageSquare,
  ClipboardList,
  ArrowLeft,
  Layers,
  BriefcaseIcon,
  ScrollText
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  section?: string;
}

interface DashboardSidebarProps {
  role: "TRAINEE" | "STUDENT" | "TRAINER" | "EMPLOYER" | "TRAINING_PROVIDER" | "GOVERNMENT_ADMIN" | "ADMINISTRATOR";
  title: string;
  userEmail?: string;
}

export default function DashboardSidebar({ role, title, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();

  const getLinks = (): SidebarItem[] => {
    switch (role) {
      case "TRAINEE":
      case "STUDENT":
        return [
          { label: "Dashboard", href: "/trainee", icon: Home },
          { label: "My Career", href: "/trainee/career-target", icon: Target },
          { label: "Skills", href: "/trainee/skills", icon: Award },
          { label: "Roadmap", href: "/trainee/roadmap", icon: BookOpen },
          { label: "Profile & Resume", href: "/trainee/profile", icon: User },
          { label: "Career Identity", href: "/trainee/identity", icon: Award },
          { label: "Training", href: "/trainee/training", icon: GraduationCap },
          { label: "Certifications", href: "/trainee/certifications", icon: Award },
          { label: "Jobs", href: "/trainee/jobs", icon: Briefcase },
          { label: "Applications", href: "/trainee/applications", icon: ClipboardList },
          { label: "Employment", href: "/trainee/outcomes", icon: BriefcaseIcon },
          { label: "AI Career Coach", href: "/trainee/coach", icon: Sparkles },
          { label: "Career Timeline", href: "/trainee/timeline", icon: ScrollText },
          { label: "Follow-ups", href: "/trainee/followups", icon: Clock },
          { label: "Settings & Consent", href: "/trainee/settings", icon: Settings },
        ];

      case "TRAINER":
        return [
          { label: "Dashboard", href: "/trainer", icon: Home },
          { label: "Assigned Batches", href: "/trainer/batches", icon: BookOpen },
          { label: "Learners Roster", href: "/trainer/learners", icon: Users },
          { label: "Assessments", href: "/trainer/assessments", icon: Award },
          { label: "Trainer Profile", href: "/trainer/profile", icon: User },
        ];

      case "EMPLOYER":
        return [
          { label: "Dashboard", href: "/employer", icon: Home },
          { label: "Company Profile", href: "/employer/profile", icon: Building2 },
          { label: "Jobs", href: "/employer/jobs", icon: Briefcase },
          { label: "Candidates", href: "/employer/candidates", icon: Users },
          { label: "Applications", href: "/employer/applications", icon: ClipboardList },
          { label: "Verification Queue", href: "/employer/verifications", icon: CheckSquare },
          { label: "Bulk Verification", href: "/employer/bulk-verify", icon: Shield },
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
      case "ADMINISTRATOR":
        return [
          { label: "Executive Overview", href: "/admin", icon: Home },
          { label: "Policy Simulator", href: "/admin/simulator", icon: Target },
          { label: "Outcome Intelligence", href: "/admin/outcomes", icon: Briefcase },
          { label: "District Intelligence", href: "/admin/districts", icon: MapPin },
          { label: "Course Performance", href: "/admin/courses", icon: BookOpen },
          { label: "Provider Scorecard", href: "/admin/providers", icon: Building2 },
          { label: "Skill Demand", href: "/admin/skills", icon: Sparkles },
          { label: "Retention & Wages", href: "/admin/retention", icon: PieChart },
          { label: "Interventions", href: "/admin/reports", icon: FileSpreadsheet },
          { label: "Audit & Consent", href: "/admin/audit", icon: Shield },
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

      {/* Verified Status Footer */}
      <div className="pt-4 border-t border-border mt-6 text-center">
        <span className="text-[10px] text-muted inline-flex items-center justify-center gap-1 font-medium">
          <Shield className="w-3 h-3 text-emerald-700" />
          <span>Role Session Protected</span>
        </span>
      </div>
    </aside>
  );
}
