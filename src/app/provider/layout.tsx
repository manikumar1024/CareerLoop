import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RoleHeader from "@/components/RoleHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import Footer from "@/components/Footer";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login/provider");
  }

  // Strict role check: Training Provider only
  if (user.role !== "TRAINING_PROVIDER") {
    const roleRedirects: Record<string, string> = {
      TRAINEE: "/trainee",
      TRAINER: "/trainer",
      EMPLOYER: "/employer",
      GOVERNMENT_ADMIN: "/admin",
      ADMINISTRATOR: "/admin",
    };
    redirect(roleRedirects[user.role] || "/login/provider");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RoleHeader
        portalName="Training Provider Portal"
        roleBadge="Training Center"
        userName={user.name}
        userEmail={user.email}
      />
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row">
        <DashboardSidebar
          role="TRAINING_PROVIDER"
          title={user.name || "Provider Workspace"}
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
