import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TraineeTrainingClient from "./TraineeTrainingClient";

export const revalidate = 0;

export default async function TraineeTrainingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      enrollments: {
        include: {
          program: {
            include: {
              provider: {
                select: {
                  id: true,
                  institutionName: true,
                  accreditationNumber: true,
                  district: true,
                  state: true,
                  contactEmail: true,
                },
              },
            },
          },
          batch: true,
          assessments: true,
        },
        orderBy: { enrollmentDate: "desc" },
      },
      certifications: {
        include: { program: true },
        orderBy: { issueDate: "desc" },
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
        enrollments: {
          include: {
            program: {
              include: {
                provider: {
                  select: {
                    id: true,
                    institutionName: true,
                    accreditationNumber: true,
                    district: true,
                    state: true,
                    contactEmail: true,
                  },
                },
              },
            },
            batch: true,
            assessments: true,
          },
        },
        certifications: {
          include: { program: true },
        },
      },
    });
  }

  // Fetch all active training programs created by training providers
  const allPrograms = await prisma.trainingProgram.findMany({
    where: { status: "ACTIVE" },
    include: {
      provider: {
        select: {
          id: true,
          institutionName: true,
          accreditationNumber: true,
          district: true,
          state: true,
          contactEmail: true,
        },
      },
      batches: {
        include: {
          _count: { select: { enrollments: true } },
        },
        orderBy: { startDate: "asc" },
      },
      enrollments: {
        select: {
          id: true,
          traineeId: true,
          batchId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedAvailable = allPrograms.map((p) => {
    const isEnrolled = trainee.enrollments.some((e) => e.programId === p.id);
    const userEnrollment = trainee.enrollments.find((e) => e.programId === p.id) || null;

    return {
      id: p.id,
      title: p.title,
      code: p.code,
      sector: p.sector,
      description: p.description,
      durationWeeks: p.durationWeeks,
      minHours: p.minHours,
      skillsOffered: p.skillsOffered,
      status: p.status,
      provider: p.provider,
      totalEnrolled: p.enrollments.length,
      isEnrolled,
      userEnrollment,
      batches: p.batches.map((b) => ({
        id: b.id,
        name: b.name,
        batchCode: b.batchCode,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
        maxCapacity: b.maxCapacity,
        enrolledCount: b._count.enrollments,
        availableSeats: Math.max(0, b.maxCapacity - b._count.enrollments),
        isUserInBatch: userEnrollment?.batchId === b.id,
      })),
    };
  });

  return (
    <TraineeTrainingClient
      initialEnrolled={trainee.enrollments as any}
      availablePrograms={formattedAvailable as any}
      certifications={trainee.certifications}
    />
  );
}
