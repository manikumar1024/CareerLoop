import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RoleHeader from "@/components/RoleHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import Footer from "@/components/Footer";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login/employer");
  }

  // Strict role check: Employer only
  if (user.role !== "EMPLOYER") {
    const roleRedirects: Record<string, string> = {
      TRAINEE: "/trainee",
      TRAINER: "/trainer",
      TRAINING_PROVIDER: "/provider",
      GOVERNMENT_ADMIN: "/admin",
      ADMINISTRATOR: "/admin",
    };
    redirect(roleRedirects[user.role] || "/login/employer");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RoleHeader
        portalName="Employer Hiring Portal"
        roleBadge="Verified Employer"
        userName={user.name}
        userEmail={user.email}
      />
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row">
        <DashboardSidebar
          role="EMPLOYER"
          title={user.name || "Employer Workspace"}
          userEmail={user.email}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
