import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  const roleRedirects: Record<string, string> = {
    TRAINEE: "/trainee",
    STUDENT: "/trainee",
    TRAINER: "/trainer",
    TRAINING_PROVIDER: "/provider",
    PROVIDER: "/provider",
    EMPLOYER: "/employer",
    GOVERNMENT_ADMIN: "/admin",
    ADMINISTRATOR: "/admin",
    ADMIN: "/admin",
  };

  redirect(roleRedirects[user.role] || "/trainee");
}
