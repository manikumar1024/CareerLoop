import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import ProviderProgramsClient from "./ProviderProgramsClient";

export const revalidate = 0;

export default async function ProviderProgramsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let provider = await prisma.trainingProviderProfile.findUnique({
    where: { userId: user.id },
    include: {
      programs: {
        include: {
          batches: {
            include: {
              enrollments: {
                include: {
                  trainee: {
                    include: {
                      user: { select: { id: true, name: true, email: true } },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          enrollments: {
            include: {
              trainee: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
              assessments: true,
            },
            orderBy: { enrollmentDate: "desc" },
          },
          certifications: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!provider) {
    provider = await prisma.trainingProviderProfile.create({
      data: {
        userId: user.id,
        institutionName: user.name || "Vocational Training Center",
        contactEmail: user.email,
        district: "National",
        state: "National",
        centerType: "Vocational Skill Center",
      },
      include: {
        programs: {
          include: {
            batches: {
              include: {
                enrollments: {
                  include: {
                    trainee: {
                      include: {
                        user: { select: { id: true, name: true, email: true } },
                      },
                    },
                  },
                },
              },
            },
            enrollments: {
              include: {
                trainee: {
                  include: {
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
                assessments: true,
              },
            },
            certifications: true,
          },
        },
      },
    });
  }

  return (
    <ProviderProgramsClient
      initialPrograms={provider.programs as any}
      providerName={provider.institutionName}
    />
  );
}
