"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  GraduationCap, 
  Landmark, 
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "TRAINEE";
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register" && selectedRole === "GOVERNMENT_ADMIN") {
      if (adminCode.trim() !== (process.env.NEXT_PUBLIC_ADMIN_CODE || "CAREERLOOP-GOV-ADMIN")) {
        setError("Invalid Government Admin Authorization Code. Please contact your state department.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        role: selectedRole,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Redirect to appropriate dashboard based on selected role
        switch (selectedRole) {
          case "TRAINEE":
            router.push("/trainee");
            break;
          case "EMPLOYER":
            router.push("/employer");
            break;
          case "TRAINING_PROVIDER":
            router.push("/provider");
            break;
          case "GOVERNMENT_ADMIN":
            router.push("/admin");
            break;
          default:
            router.push("/");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoRole: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: demoEmail,
        password: "CareerLoop2026!",
        role: demoRole,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        switch (demoRole) {
          case "TRAINEE": router.push("/trainee"); break;
          case "EMPLOYER": router.push("/employer"); break;
          case "TRAINING_PROVIDER": router.push("/provider"); break;
          case "GOVERNMENT_ADMIN": router.push("/admin"); break;
          default: router.push("/");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Error logging in.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="amra-ambient-top" />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 w-full z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-8 space-y-2">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            {mode === "signin" ? "Access CareerLoop AI" : "Create an Account"}
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            {mode === "signin"
              ? "Sign in with your role-authorized credentials or Google account."
              : "Register your profile into the national outcome intelligence system."}
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
          
          {/* Quick Evaluator Role Switcher */}
          <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Quick Demo Access
              </span>
              <span className="text-[10px] text-muted">Click any role to test</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("arjun.verma@example.com", "TRAINEE")}
                className="p-2 rounded-xl bg-white border border-border hover:border-emerald-300 text-left transition flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-charcoal-800 truncate">Arjun Verma</p>
                  <p className="text-[10px] text-muted truncate">Trainee Portal</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin@careerloop.gov.in", "GOVERNMENT_ADMIN")}
                className="p-2 rounded-xl bg-white border border-border hover:border-emerald-300 text-left transition flex items-center gap-2"
              >
                <Landmark className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-charcoal-800 truncate">Dr. Sharma</p>
                  <p className="text-[10px] text-muted truncate">Govt Admin</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("hr@infosolutions.com", "EMPLOYER")}
                className="p-2 rounded-xl bg-white border border-border hover:border-emerald-300 text-left transition flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-purple-700 shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-charcoal-800 truncate">Apex Info</p>
                  <p className="text-[10px] text-muted truncate">Employer</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("director@puneskillhub.org", "TRAINING_PROVIDER")}
                className="p-2 rounded-xl bg-white border border-border hover:border-emerald-300 text-left transition flex items-center gap-2"
              >
                <User className="w-4 h-4 text-blue-700 shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-charcoal-800 truncate">Pune Skill</p>
                  <p className="text-[10px] text-muted truncate">Provider</p>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-white px-3 text-[11px] text-muted uppercase tracking-wider font-semibold">
              Or Sign In With Email
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-sage-50 rounded-xl border border-sage-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              className={`py-1.5 rounded-lg transition ${
                mode === "signin" ? "bg-white text-charcoal-800 shadow-xs" : "text-muted hover:text-charcoal-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className={`py-1.5 rounded-lg transition ${
                mode === "register" ? "bg-white text-charcoal-800 shadow-xs" : "text-muted hover:text-charcoal-800"
              }`}
            >
              Register Role
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Role Selection */}
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "TRAINEE", label: "Trainee" },
                  { id: "EMPLOYER", label: "Employer" },
                  { id: "TRAINING_PROVIDER", label: "Training Provider" },
                  { id: "GOVERNMENT_ADMIN", label: "Govt Admin" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-2 rounded-xl border font-medium text-left transition ${
                      selectedRole === r.id
                        ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                        : "bg-white text-charcoal-700 hover:bg-sage-50 border-border"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Full Name / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            {/* Admin Approval Code check for Govt Admin registration */}
            {mode === "register" && selectedRole === "GOVERNMENT_ADMIN" && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                <label className="block font-bold text-amber-900">
                  Government Authorization Code
                </label>
                <input
                  type="text"
                  required
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter government authorization code"
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
                />
                <p className="text-[10px] text-amber-800">
                  Administrative access requires departmental authorization.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Verifying..." : mode === "signin" ? "Sign In to Portal" : "Complete Registration"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-muted">Loading authentication gateway...</div>}>
      <SignInContent />
    </Suspense>
  );
}
