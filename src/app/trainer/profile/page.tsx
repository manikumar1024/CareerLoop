import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { User, Building2, Mail, Phone, Award, ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default async function TrainerProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: user.id },
    include: {
      provider: true,
      batches: { include: { program: true } },
    },
  });

  if (!trainer) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Trainer Credentials & Profile
        </h1>
        <p className="text-xs text-muted">
          Your authorized vocational instructor identity and affiliated institution details.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border/50">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl">
            {trainer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl text-charcoal-800">{trainer.name}</h2>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {trainer.status}
              </span>
            </div>
            <p className="text-xs text-muted">{trainer.specialization || "Vocational Instructor"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-muted block">Affiliated Institution</span>
            <div className="font-semibold text-charcoal-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>{trainer.provider.institutionName}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-muted block">Official Email</span>
            <div className="font-semibold text-charcoal-800 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-700" />
              <span>{trainer.email}</span>
            </div>
          </div>

          {trainer.phone && (
            <div className="space-y-1">
              <span className="text-muted block">Phone</span>
              <div className="font-semibold text-charcoal-800 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>{trainer.phone}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-muted block">Accreditation Center Type</span>
            <div className="font-semibold text-charcoal-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{trainer.provider.centerType} ({trainer.provider.district})</span>
            </div>
          </div>
        </div>

        {trainer.bio && (
          <div className="pt-4 border-t border-border/50 space-y-1">
            <span className="text-xs font-bold text-charcoal-800 block">Instructor Biography</span>
            <p className="text-xs text-muted leading-relaxed">{trainer.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
