import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import RoleHeader from "@/components/RoleHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import Footer from "@/components/Footer";

export default async function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login/student");
  }

  // Strict role check: Trainee/Student only
  if (user.role !== "TRAINEE") {
    const roleRedirects: Record<string, string> = {
      TRAINER: "/trainer",
      TRAINING_PROVIDER: "/provider",
      EMPLOYER: "/employer",
      GOVERNMENT_ADMIN: "/admin",
      ADMINISTRATOR: "/admin",
    };
    redirect(roleRedirects[user.role] || "/login/student");
  }

  // If the user has no trainee profile yet, auto-provision one so they can access their workspace
  let traineeProfile = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!traineeProfile) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    traineeProfile = await prisma.traineeProfile.create({
      data: {
        userId: user.id,
        traineeId: `CLP-2026-${randomSuffix}`,
        district: "National",
        state: "National",
      },
      select: { id: true },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RoleHeader
        portalName="Student & Trainee Portal"
        roleBadge="Student / Trainee"
        userName={user.name}
        userEmail={user.email}
      />
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row">
        <DashboardSidebar
          role="TRAINEE"
          title={user.name || "Student Workspace"}
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
