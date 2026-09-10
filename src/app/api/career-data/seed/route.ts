import { NextResponse } from "next/server";
import { seedCareerData } from "@/lib/seed-career-data";

export async function POST() {
  try {
    const result = await seedCareerData();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
