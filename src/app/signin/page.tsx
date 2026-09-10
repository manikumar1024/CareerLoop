"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Lock, 
  Mail, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register" && selectedRole === "GOVERNMENT_ADMIN") {
      if (adminCode.trim() !== (process.env.NEXT_PUBLIC_ADMIN_CODE || "")) {
        setError("Invalid Government Admin Authorization Code. Please contact your administrator.");
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
        // For trainees: check if onboarding is complete
        if (selectedRole === "TRAINEE") {
          const check = await fetch("/api/trainee/profile-complete");
          const data = await check.json();
          if (!data.complete) {
            router.push("/onboarding");
          } else {
            router.push(callbackUrl === "/" ? "/trainee" : callbackUrl);
          }
        } else {
          const redirectMap: Record<string, string> = {
            EMPLOYER: "/employer",
            TRAINING_PROVIDER: "/provider",
            GOVERNMENT_ADMIN: "/admin",
          };
          router.push(redirectMap[selectedRole] || "/");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const roles = [
    { id: "TRAINEE", label: "Trainee", desc: "Build your career profile" },
    { id: "EMPLOYER", label: "Employer", desc: "Hire verified candidates" },
    { id: "TRAINING_PROVIDER", label: "Training Provider", desc: "Manage training programs" },
    { id: "GOVERNMENT_ADMIN", label: "Government Admin", desc: "Outcome intelligence" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="font-display font-extrabold text-2xl text-charcoal-800 tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted">
              {mode === "signin"
                ? "Sign in to continue your career journey."
                : "Join CareerLoop and start building your career."}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm space-y-5">
            
            {/* Mode Tabs */}
            <div className="grid grid-cols-2 p-1 bg-sage-50 rounded-xl border border-sage-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); }}
                className={`py-2 rounded-lg transition ${
                  mode === "signin" ? "bg-white text-charcoal-800 shadow-xs" : "text-muted hover:text-charcoal-700"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); }}
                className={`py-2 rounded-lg transition ${
                  mode === "register" ? "bg-white text-charcoal-800 shadow-xs" : "text-muted hover:text-charcoal-700"
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-3 rounded-xl border text-left transition text-xs ${
                        selectedRole === r.id
                          ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                          : "bg-white text-charcoal-700 hover:bg-sage-50 border-border"
                      }`}
                    >
                      <div className="font-semibold">{r.label}</div>
                      <div className={`text-[10px] mt-0.5 ${selectedRole === r.id ? "text-emerald-100" : "text-muted"}`}>
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === "register" && (
                  <p className="text-[10px] text-muted mt-1">Minimum 6 characters</p>
                )}
              </div>

              {mode === "register" && selectedRole === "GOVERNMENT_ADMIN" && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-900">
                    Government Authorization Code
                  </label>
                  <input
                    type="text"
                    required
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter authorization code"
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
                  />
                  <p className="text-[10px] text-amber-800">
                    Administrative access requires departmental authorization.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>
                  {loading 
                    ? "Please wait..." 
                    : mode === "signin" 
                    ? "Sign In" 
                    : "Create Account"}
                </span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-muted">
            {mode === "signin" ? (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => setMode("register")} className="text-emerald-800 font-semibold hover:underline">
                  Create one
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-emerald-800 font-semibold hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-muted">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
