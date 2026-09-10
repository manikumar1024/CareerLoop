"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Compass, 
  Layers, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = (session?.user as any)?.role;

  const getDashboardUrl = () => {
    if (!role) return "/signin";
    switch (role) {
      case "TRAINEE": return "/trainee";
      case "EMPLOYER": return "/employer";
      case "TRAINING_PROVIDER": return "/provider";
      case "GOVERNMENT_ADMIN": return "/admin";
      default: return "/trainee";
    }
  };

  const navLinks = [
    { label: "PLATFORM", href: "/" },
    { label: "HOW IT WORKS", href: "/how-it-works" },
    { label: "ARCHITECTURE", href: "/architecture" },
    { label: "PRIVACY & TRUST", href: "/privacy" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 pt-4 pb-2 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-sm tracking-tighter shadow-sm group-hover:bg-emerald-700 transition">
            CL
          </span>
          <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-charcoal-800 flex items-center">
            careerloop<span className="text-emerald-700 font-extrabold">.ai</span>
          </span>
        </Link>

        {/* Floating Centered Pill Navigation (Amra Reference Aesthetic) */}
        <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full glass-pill shadow-soft text-xs font-semibold tracking-wider text-charcoal-700">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "text-charcoal-700 hover:text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href={getDashboardUrl()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800 text-white text-xs font-semibold tracking-wide hover:bg-emerald-900 transition shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{role ? role.replace("_", " ") : "DASHBOARD"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign Out"
                className="p-2 rounded-full text-muted hover:text-charcoal-800 hover:bg-sage-100 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="px-5 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm"
              >
                SIGN IN
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          {session && (
            <Link
              href={getDashboardUrl()}
              className="px-3 py-1.5 rounded-full bg-emerald-800 text-white text-xs font-medium"
            >
              Dashboard
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-charcoal-800 hover:bg-sage-100 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 mx-2 p-4 rounded-2xl glass-card shadow-elevated animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-charcoal-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border my-2 pt-2">
              {session ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href={getDashboardUrl()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-emerald-800 text-white text-center text-sm font-semibold"
                  >
                    Go to {role?.replace("_", " ")} Portal
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full py-2 rounded-xl text-xs font-medium text-muted hover:text-charcoal-800 text-center"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 rounded-xl bg-emerald-800 text-white text-center text-sm font-semibold"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
