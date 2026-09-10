"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  GraduationCap, 
  Building2, 
  Award, 
  Landmark, 
  ArrowRight,
  ShieldCheck,
  AlertCircle 
} from "lucide-react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("TRAINEE");
  const [district, setDistrict] = useState("Pune");
  const [orgName, setOrgName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (selectedRole === "GOVERNMENT_ADMIN" && adminCode.trim() !== (process.env.NEXT_PUBLIC_ADMIN_CODE || "CAREERLOOP-GOV-ADMIN")) {
      setError("Invalid Government Admin Authorization Code.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          district,
          orgName,
          adminCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete onboarding.");
      }

      await update({ role: selectedRole });

      switch (selectedRole) {
        case "TRAINEE": router.push("/trainee"); break;
        case "EMPLOYER": router.push("/employer"); break;
        case "TRAINING_PROVIDER": router.push("/provider"); break;
        case "GOVERNMENT_ADMIN": router.push("/admin"); break;
        default: router.push("/");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during onboarding.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="amra-ambient-top" />
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto px-4 sm:px-8 py-12 w-full z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
          
          <div className="space-y-1 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Step 2: Profile Selection</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-charcoal-800">
              Welcome to CareerLoop AI
            </h1>
            <p className="text-xs text-muted">
              Select your organization role to customize your workspace.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">
            
            <div className="space-y-2">
              <label className="block font-semibold text-charcoal-700">
                I am participating as:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "TRAINEE", label: "Trainee / Candidate", icon: GraduationCap, desc: "Track my certifications & employment" },
                  { id: "EMPLOYER", label: "Industry Employer", icon: Building2, desc: "Verify candidate hires & skills" },
                  { id: "TRAINING_PROVIDER", label: "Training Provider", icon: Award, desc: "Manage cohorts & course outcomes" },
                  { id: "GOVERNMENT_ADMIN", label: "Government Admin", icon: Landmark, desc: "Macro district & outcome intelligence" },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                        selectedRole === r.id
                          ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                          : "bg-white text-charcoal-800 hover:bg-sage-50 border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-4 h-4" />
                        <span className="font-bold text-xs">{r.label}</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${selectedRole === r.id ? "text-emerald-100" : "text-muted"}`}>
                        {r.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role specific inputs */}
            {selectedRole === "TRAINEE" && (
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Home District
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Pune, Varanasi, Jaipur, Coimbatore"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}

            {(selectedRole === "EMPLOYER" || selectedRole === "TRAINING_PROVIDER") && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Organization / Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Apex InfoSolutions / Pune Skill Hub"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Headquarters District
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            {selectedRole === "GOVERNMENT_ADMIN" && (
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
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs tracking-wide shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Setting up workspace..." : "Continue to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
