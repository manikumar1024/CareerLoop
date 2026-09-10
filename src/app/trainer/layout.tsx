import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RoleHeader from "@/components/RoleHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import Footer from "@/components/Footer";

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login/trainer");
  }

  // Strict role check: Trainer only
  if (user.role !== "TRAINER") {
    const roleRedirects: Record<string, string> = {
      TRAINEE: "/trainee",
      TRAINING_PROVIDER: "/provider",
      EMPLOYER: "/employer",
      GOVERNMENT_ADMIN: "/admin",
      ADMINISTRATOR: "/admin",
    };
    redirect(roleRedirects[user.role] || "/login/trainer");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RoleHeader
        portalName="Vocational Trainer Workspace"
        roleBadge="Trainer"
        userName={user.name}
        userEmail={user.email}
      />
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row">
        <DashboardSidebar
          role="TRAINER"
          title={user.name || "Trainer Workspace"}
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
