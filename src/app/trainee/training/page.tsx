import React from "react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { GraduationCap, Award, CheckCircle2, Calendar, BookOpen, Clock, ShieldCheck, ExternalLink } from "lucide-react";

export const revalidate = 0;

export default async function TraineeTrainingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId: user.id },
    include: {
      enrollments: {
        include: {
          program: { include: { provider: true } },
          assessments: true,
        },
      },
      certifications: {
        include: { program: true },
      },
    },
  });

  if (!trainee) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Training & Verifiable Certifications
        </h1>
        <p className="text-xs text-muted">
          Your accredited vocational curriculum, attendance history, practical assessment results, and digital credentials.
        </p>
      </div>

      {/* Visual Skilling Lifecycle Tracker */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
        <h3 className="font-display font-bold text-base text-charcoal-800">
          Curriculum & Progression Pathway
        </h3>

        {trainee.enrollments.length === 0 ? (
          <EmptyState
            title="No Training Programs Enrolled"
            description="You are not currently enrolled in any accredited training batches."
          />
        ) : (
          <div className="space-y-8">
            {trainee.enrollments.map((enrollment) => {
              const cert = trainee.certifications.find((c) => c.programId === enrollment.programId);
              const assessment = enrollment.assessments[0];

              return (
                <div
                  key={enrollment.id}
                  className="p-6 rounded-2xl bg-sage-50/50 border border-sage-200 space-y-6"
                >
                  {/* Program Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                        {enrollment.program.code} · {enrollment.program.sector}
                      </span>
                      <h4 className="font-display font-bold text-lg text-charcoal-800 mt-1">
                        {enrollment.program.title}
                      </h4>
                      <p className="text-xs text-muted">
                        Provider: {enrollment.program.provider.institutionName} ({enrollment.program.provider.district})
                      </p>
                    </div>

                    <StatusBadge status={enrollment.status} size="md" />
                  </div>

                  {/* 4-Step Visual Pathway */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    
                    {/* Step 1: Enrolled */}
                    <div className="p-3 rounded-xl bg-white border border-border space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>1. Enrolled</span>
                      </div>
                      <p className="text-[11px] text-muted">{formatDate(enrollment.enrollmentDate)}</p>
                      <p className="text-[10px] text-muted">{enrollment.program.durationWeeks} Weeks Duration</p>
                    </div>

                    {/* Step 2: Attended */}
                    <div className="p-3 rounded-xl bg-white border border-border space-y-1">
                      <div className={`flex items-center gap-1.5 font-bold ${enrollment.attendancePercentage !== null && enrollment.attendancePercentage !== undefined ? "text-emerald-800" : "text-muted"}`}>
                        {enrollment.attendancePercentage !== null && enrollment.attendancePercentage !== undefined
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : <Clock className="w-3.5 h-3.5" />
                        }
                        <span>2. Attended</span>
                      </div>
                      <p className="font-bold text-charcoal-800">
                        {enrollment.attendancePercentage !== null && enrollment.attendancePercentage !== undefined
                          ? `${enrollment.attendancePercentage}%`
                          : "Not recorded"}
                      </p>
                      <p className="text-[10px] text-muted">Min {enrollment.program.minHours} Practical Hours</p>
                    </div>

                    {/* Step 3: Assessed */}
                    <div className="p-3 rounded-xl bg-white border border-border space-y-1">
                      <div className={`flex items-center gap-1.5 font-bold ${assessment ? "text-emerald-800" : "text-muted"}`}>
                        {assessment ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>3. Assessed</span>
                      </div>
                      <p className="font-bold text-charcoal-800">
                        {assessment ? `${assessment.scoreObtained}/${assessment.maxScore}` : "Pending"}
                      </p>
                      <p className="text-[10px] text-muted">
                        {assessment
                          ? (assessment.passed ? "Passed" : "Did not pass")
                          : enrollment.grade ? `Grade: ${enrollment.grade}` : "Not yet assessed"}
                      </p>
                    </div>

                    {/* Step 4: Certified */}
                    <div className={`p-3 rounded-xl border space-y-1 ${cert ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-white border-border text-muted"}`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {cert ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>4. Certified</span>
                      </div>
                      <p className="font-mono text-[11px] truncate">{cert ? cert.certificateNumber : "In Progress"}</p>
                      <p className="text-[10px]">
                        {cert ? cert.verificationStatus.replace(/_/g, " ") : "Pending Exam"}
                      </p>
                    </div>

                  </div>

                  {/* Verifiable Certificate Banner */}
                  {cert && (
                    <div className="p-4 rounded-xl bg-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            Verifiable Digital Credential
                          </p>
                          <h5 className="font-display font-bold text-sm text-charcoal-800">
                            {cert.certificateNumber}
                          </h5>
                          <p className="text-[11px] text-muted">
                            Issued by {cert.issuingAuthority} on {formatDate(cert.issueDate)}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0 ${
                        cert.verificationStatus === "VERIFIED" ? "text-emerald-800 bg-emerald-50 border-emerald-200" :
                        cert.verificationStatus === "PROVIDER_VERIFIED" ? "text-blue-800 bg-blue-50 border-blue-200" :
                        "text-amber-800 bg-amber-50 border-amber-200"
                      }`}>
                        {cert.verificationStatus === "VERIFIED" || cert.verificationStatus === "PROVIDER_VERIFIED"
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : <Clock className="w-3.5 h-3.5" />
                        }
                        <span>{cert.verificationStatus.replace(/_/g, " ")}</span>
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
