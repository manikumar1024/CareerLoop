import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import Footer from "@/components/Footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin?role=GOVERNMENT_ADMIN&callbackUrl=/admin");
  }

  // Check if role is government admin or authorized
  if (user.role !== "GOVERNMENT_ADMIN") {
    redirect("/signin?role=GOVERNMENT_ADMIN&callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
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
