import React from "react";
import RoleLoginForm from "@/components/RoleLoginForm";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function GovernmentLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-border/60">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-sm">
            CL
          </span>
          <span className="font-display font-bold text-xl text-charcoal-800">
            careerloop<span className="text-emerald-700 font-extrabold">.ai</span>
          </span>
        </Link>
        <span className="text-xs text-muted">Government Outcome Intelligence Authorization</span>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <RoleLoginForm
          role="GOVERNMENT_ADMIN"
          title="Government Administration Portal"
          subtitle="Macro skilling ecosystem oversight, district heatmaps, course ROI benchmarks, and evidence-backed policy directives."
          destinationUrl="/admin"
          badgeLabel="Government Admin"
        />
      </main>

      <Footer />
    </div>
  );
}
