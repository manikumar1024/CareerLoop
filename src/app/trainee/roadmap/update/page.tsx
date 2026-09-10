import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface Props {
  searchParams: { itemId?: string; status?: string };
}

/**
 * /trainee/roadmap/update — server-side handler for roadmap item status updates.
 * Processes via searchParams then redirects back to /trainee/roadmap.
 */
export default async function RoadmapUpdatePage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const { itemId, status } = searchParams;
  const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

  if (itemId && status && validStatuses.includes(status)) {
    const trainee = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
      include: { roadmap: { include: { items: true } } },
    });

    if (trainee?.roadmap) {
      const item = trainee.roadmap.items.find((i) => i.id === itemId);
      if (item) {
        await prisma.roadmapItem.update({
          where: { id: itemId },
          data: {
            status,
            completedAt: status === "COMPLETED" ? new Date() : null,
            updatedAt: new Date(),
          },
        });
      }
    }
  }

  redirect("/trainee/roadmap");
}
