import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const careerPaths = await prisma.careerPath.findMany({
    orderBy: [{ demandLevel: "desc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      avgSalaryMin: true,
      avgSalaryMax: true,
      demandLevel: true,
      _count: { select: { requirements: true } },
    },
  });
  return NextResponse.json({ careerPaths });
}
