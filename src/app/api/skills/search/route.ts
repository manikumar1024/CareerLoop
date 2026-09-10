import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }
  if (category) {
    where.category = category;
  }

  const skills = await prisma.skill.findMany({
    where,
    orderBy: { name: "asc" },
    take: limit,
    select: { id: true, name: true, category: true, description: true },
  });

  return NextResponse.json({ skills });
}
