import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { revalidatePath } from "next/cache";
import { Building2, MapPin, Mail, Globe, Users, ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default async function EmployerProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer) return null;

  async function updateEmployerAction(formData: FormData) {
    "use server";
    const userSession = await getCurrentUser();
    if (!userSession) return;

    const companyName = formData.get("companyName") as string;
    const industry = formData.get("industry") as string;
    const district = formData.get("district") as string;
    const companySize = formData.get("companySize") as string;
    const website = formData.get("website") as string;
    const contactEmail = formData.get("contactEmail") as string;

    await prisma.employerProfile.update({
      where: { userId: userSession.id },
      data: {
        companyName,
        industry,
        district,
        companySize,
        website,
        contactEmail,
      },
    });

    revalidatePath("/employer/profile");
    revalidatePath("/employer");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Organization Profile
        </h1>
        <p className="text-xs text-muted">
          Manage your enterprise profile, verified business domains, and contact credentials.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <form action={updateEmployerAction} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Company / Organization Name</label>
              <input
                type="text"
                name="companyName"
                defaultValue={employer.companyName}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Primary Industry Sector</label>
              <input
                type="text"
                name="industry"
                defaultValue={employer.industry}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Headquarters District</label>
              <input
                type="text"
                name="district"
                defaultValue={employer.district}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Company Size</label>
              <select
                name="companySize"
                defaultValue={employer.companySize || "100-250"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white"
              >
                <option value="1-50">1-50 Employees</option>
                <option value="50-100">50-100 Employees</option>
                <option value="100-250">100-250 Employees</option>
                <option value="250-500">250-500 Employees</option>
                <option value="500+">500+ Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Official Website</label>
              <input
                type="url"
                name="website"
                defaultValue={employer.website || ""}
                placeholder="https://company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={employer.contactEmail}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm"
            >
              Update Organization Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
