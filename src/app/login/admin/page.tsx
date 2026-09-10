import React from "react";
import RoleLoginForm from "@/components/RoleLoginForm";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function AdministratorLoginPage() {
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
        <span className="text-xs text-muted">Platform Root Administration</span>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <RoleLoginForm
          role="ADMINISTRATOR"
          title="System Administrator Console"
          subtitle="Platform-wide security governance, user moderation, audit logs, and institutional configurations."
          destinationUrl="/admin"
          badgeLabel="System Administrator"
        />
      </main>

      <Footer />
    </div>
  );
}
