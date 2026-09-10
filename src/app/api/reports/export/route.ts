import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "GOVERNMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainees = await prisma.traineeProfile.findMany({
      include: {
        user: true,
        enrollments: { include: { program: true } },
        certifications: true,
        employmentRecords: true,
        selfEmployments: true,
        apprenticeships: true,
        followUps: { where: { isCompleted: true } },
      },
    });

    const rows = [
      [
        "Trainee ID",
        "Candidate Name",
        "Email",
        "District",
        "Current Status",
        "Training Program",
        "Certified",
        "Certificate ID",
        "Employer / Business",
        "Monthly Salary (INR)",
        "Verification Status",
        "Completed Followups",
      ].join(","),
    ];

    trainees.forEach((t) => {
      const prog = t.enrollments[0]?.program?.title || "N/A";
      const cert = t.certifications[0]?.certificateNumber || "None";
      const emp = t.employmentRecords[0];
      const selfBiz = t.selfEmployments[0];
      const appr = t.apprenticeships[0];

      const employer = emp ? emp.companyName : selfBiz ? selfBiz.businessName : appr ? appr.hostOrganization : "None";
      const salary = emp ? emp.monthlySalary : selfBiz ? selfBiz.monthlyNetIncome : appr ? appr.stipendAmount : 0;
      const verStatus = emp ? emp.verificationStatus : "SELF_REPORTED";

      rows.push(
        [
          `"${t.traineeId}"`,
          `"${t.user.name || ""}"`,
          `"${t.user.email}"`,
          `"${t.district}"`,
          `"${t.currentStatus}"`,
          `"${prog}"`,
          `"${t.certifications.length > 0 ? "YES" : "NO"}"`,
          `"${cert}"`,
          `"${employer}"`,
          `"${salary}"`,
          `"${verStatus}"`,
          `"${t.followUps.length}"`,
        ].join(",")
      );
    });

    const csvContent = rows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="careerloop_national_outcomes_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 });
  }
}
