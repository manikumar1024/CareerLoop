import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RoleHeader from "@/components/RoleHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import Footer from "@/components/Footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login/admin");
  }

  // Strict role check: Government Admin or Platform Administrator only
  if (user.role !== "GOVERNMENT_ADMIN" && user.role !== "ADMINISTRATOR") {
    const roleRedirects: Record<string, string> = {
      TRAINEE: "/trainee",
      TRAINER: "/trainer",
      TRAINING_PROVIDER: "/provider",
      EMPLOYER: "/employer",
    };
    redirect(roleRedirects[user.role] || "/login/admin");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RoleHeader
        portalName="Government Outcome Intelligence & Administration"
        roleBadge="Government Admin"
        userName={user.name}
        userEmail={user.email}
      />
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row">
        <DashboardSidebar
          role="GOVERNMENT_ADMIN"
          title="Govt Intelligence"
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
