import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CertificationWalletClient from "./CertificationWalletClient";

export const revalidate = 0;

export default async function CertificationWalletPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      certifications: {
        include: {
          program: {
            include: {
              provider: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!trainee) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    trainee = await prisma.traineeProfile.create({
      data: {
        userId: user.id,
        traineeId: `CLP-2026-${randomSuffix}`,
        district: "National",
        state: "National",
      },
      include: {
        certifications: {
          include: {
            program: {
              include: {
                provider: true,
              },
            },
          },
        },
      },
    });
  }

  const providers = await prisma.trainingProviderProfile.findMany({
    select: {
      id: true,
      institutionName: true,
      accreditationNumber: true,
      programs: {
        select: {
          id: true,
          title: true,
          code: true,
        },
      },
    },
    orderBy: { institutionName: "asc" },
  });

  return (
    <CertificationWalletClient
      initialCertifications={trainee.certifications}
      providers={providers}
    />
  );
}
