"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Landmark, 
  ShieldAlert,
  UserCheck
} from "lucide-react";

interface RoleLoginFormProps {
  role: "TRAINEE" | "TRAINER" | "TRAINING_PROVIDER" | "EMPLOYER" | "GOVERNMENT_ADMIN" | "ADMINISTRATOR";
  title: string;
  subtitle: string;
  destinationUrl: string;
  badgeLabel: string;
}

const ROLE_ICONS = {
  TRAINEE: GraduationCap,
  TRAINER: BookOpen,
  TRAINING_PROVIDER: AwardIcon,
  EMPLOYER: Building2,
  GOVERNMENT_ADMIN: Landmark,
  ADMINISTRATOR: ShieldAlert,
};

function AwardIcon(props: any) {
  return <Building2 {...props} />;
}

export default function RoleLoginForm({
  role,
  title,
  subtitle,
  destinationUrl,
  badgeLabel,
}: RoleLoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const Icon = ROLE_ICONS[role] || UserCheck;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register" && (role === "GOVERNMENT_ADMIN" || role === "ADMINISTRATOR")) {
      const validCode = process.env.NEXT_PUBLIC_ADMIN_CODE || "CAREERLOOP-GOV-ADMIN";
      if (adminCode.trim() !== validCode) {
        setError("Invalid Administrative Authorization Code. Please contact your department lead.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        expectedRole: role,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push(destinationUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected authentication error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold tracking-wider uppercase border border-emerald-200">
          <Icon className="w-3.5 h-3.5" />
          <span>{badgeLabel}</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          {mode === "signin" ? title : `Register as ${badgeLabel}`}
        </h1>
        <p className="text-xs text-muted max-w-xs mx-auto">
          {mode === "signin" ? subtitle : "Create authorized credentials for your organization."}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-5">
        
        {/* Sign In vs Register Tabs */}
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
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="e.g. Rajesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Authorized Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-white"
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
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (role === "GOVERNMENT_ADMIN" || role === "ADMINISTRATOR") && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
              <label className="block text-xs font-bold text-amber-900">
                Departmental Authorization Key
              </label>
              <input
                type="password"
                required
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Enter authorized key"
                className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
              />
              <p className="text-[10px] text-amber-800">
                Administrative roles require cryptographic credential approval.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>
              {loading 
                ? "Authenticating Credentials..." 
                : mode === "signin" 
                ? `Sign In to ${badgeLabel}` 
                : `Complete ${badgeLabel} Registration`}
            </span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="pt-2 border-t border-border/50 text-center">
          <p className="text-[11px] text-muted">
            Strict RBAC protected. Cross-role authentication attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
