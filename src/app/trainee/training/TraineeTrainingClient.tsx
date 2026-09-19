"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  Clock,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronRight,
  UserCheck,
  Check,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";

interface ProviderInfo {
  id: string;
  institutionName: string;
  accreditationNumber: string | null;
  district: string;
  state: string;
  contactEmail: string;
}

interface BatchInfo {
  id: string;
  name: string;
  batchCode: string;
  startDate: string | Date;
  endDate: string | Date | null;
  status: string;
  maxCapacity: number;
  enrolledCount: number;
  availableSeats: number;
  isUserInBatch?: boolean;
}

interface AvailableProgram {
  id: string;
  title: string;
  code: string;
  sector: string;
  description: string;
  durationWeeks: number;
  minHours: number;
  skillsOffered: string | null;
  status: string;
  provider: ProviderInfo;
  totalEnrolled: number;
  isEnrolled: boolean;
  userEnrollment?: any;
  batches: BatchInfo[];
}

interface EnrolledProgramItem {
  id: string;
  traineeId: string;
  programId: string;
  batchId: string | null;
  enrollmentDate: string | Date;
  status: string;
  attendancePercentage: number | null;
  grade: string | null;
  program: {
    id: string;
    title: string;
    code: string;
    sector: string;
    description: string;
    durationWeeks: number;
    minHours: number;
    provider: ProviderInfo;
  };
  batch?: BatchInfo | null;
  assessments: any[];
}

interface TraineeTrainingClientProps {
  initialEnrolled: EnrolledProgramItem[];
  availablePrograms: AvailableProgram[];
  certifications: any[];
}

export default function TraineeTrainingClient({
  initialEnrolled,
  availablePrograms: initialAvailable,
  certifications,
}: TraineeTrainingClientProps) {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState<EnrolledProgramItem[]>(initialEnrolled);
  const [available, setAvailable] = useState<AvailableProgram[]>(initialAvailable);
  const [activeTab, setActiveTab] = useState<"available" | "enrolled">(
    initialEnrolled.length > 0 ? "enrolled" : "available"
  );

  // Selected batch mapping: programId -> batchId
  const [selectedBatches, setSelectedBatches] = useState<Record<string, string>>({});
  const [enrollingProgramId, setEnrollingProgramId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const handleSelectBatch = (programId: string, batchId: string) => {
    setSelectedBatches((prev) => ({ ...prev, [programId]: batchId }));
  };

  const handleEnroll = async (programId: string) => {
    setError(null);
    setEnrollingProgramId(programId);
    const batchId = selectedBatches[programId] || null;

    try {
      const res = await fetch("/api/trainee/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, batchId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process enrollment");
      }

      // Update enrolled programs list
      const newEnrollment: EnrolledProgramItem = {
        ...data.enrollment,
        assessments: [],
      };

      setEnrolled([newEnrollment, ...enrolled]);

      // Mark program as enrolled in available list
      setAvailable((prev) =>
        prev.map((p) =>
          p.id === programId
            ? { ...p, isEnrolled: true, userEnrollment: newEnrollment }
            : p
        )
      );

      showToast(data.message || "Enrollment confirmed! View your progression tracker.");
      setActiveTab("enrolled");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to enroll");
    } finally {
      setEnrollingProgramId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-800 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
          Training Programs & Accredited Batches
        </h1>
        <p className="text-xs text-muted">
          Browse verified opportunities published by authorized Training Providers, join cohort batches, and track your accredited curriculum progression.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === "available"
              ? "bg-emerald-800 text-white shadow-xs font-bold"
              : "text-charcoal-600 hover:bg-sage-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Available Training Programs ({available.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("enrolled")}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === "enrolled"
              ? "bg-emerald-800 text-white shadow-xs font-bold"
              : "text-charcoal-600 hover:bg-sage-50"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>My Enrolled Programs ({enrolled.length})</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE TRAINING PROGRAMS */}
      {activeTab === "available" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              Explore vocational courses created by accredited institutions. Select an open batch to enroll directly.
            </p>
          </div>

          {available.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-border text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sage-50 text-emerald-800 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal-800">
                No training programs are currently available.
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Authorized training providers have not posted active public programs in your region yet. Please check back soon or consult with your district coordinator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {available.map((program) => {
                const isAlreadyEnrolled =
                  program.isEnrolled || enrolled.some((e) => e.programId === program.id);
                const isEnrolling = enrollingProgramId === program.id;
                const activeBatchId = selectedBatches[program.id] || program.batches[0]?.id;

                return (
                  <div
                    key={program.id}
                    className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-card space-y-5 hover:shadow-elevated transition-all"
                  >
                    {/* Top Row: Code, Sector, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 uppercase">
                            {program.code}
                          </span>
                          <span className="text-[10px] font-semibold text-charcoal-600 bg-sage-50 px-2.5 py-0.5 rounded border border-sage-200">
                            {program.sector}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                            {program.durationWeeks} Weeks ({program.minHours} Practical Hours)
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-xl text-charcoal-800 mt-1">
                          {program.title}
                        </h3>

                        <p className="text-xs text-charcoal-600 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>
                            Provided by <strong>{program.provider.institutionName}</strong> ({program.provider.district}, {program.provider.state})
                          </span>
                          {program.provider.accreditationNumber && (
                            <span className="text-[10px] text-muted">
                              · {program.provider.accreditationNumber}
                            </span>
                          )}
                        </p>
                      </div>

                      {isAlreadyEnrolled ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Enrolled</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEnroll(program.id)}
                          disabled={isEnrolling}
                          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 shrink-0 cursor-pointer"
                        >
                          {isEnrolling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>Enroll in Program</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-charcoal-700 leading-relaxed">
                      {program.description}
                    </p>

                    {/* Skills Badge List */}
                    {program.skillsOffered && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          Competencies Taught:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {program.skillsOffered.split(",").map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-sage-50 text-charcoal-700 border border-sage-200"
                            >
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Batches Section */}
                    <div className="space-y-3 pt-3 border-t border-border/40">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-xs text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-blue-700" />
                          <span>Available Batches & Schedules ({program.batches.length})</span>
                        </h4>
                      </div>

                      {program.batches.length === 0 ? (
                        <div className="p-3.5 rounded-xl bg-sage-50/50 border border-sage-200 text-xs text-muted flex items-center justify-between">
                          <span>Open Cohort Admission — Batch assignment upon registration.</span>
                          {!isAlreadyEnrolled && (
                            <button
                              onClick={() => handleEnroll(program.id)}
                              disabled={isEnrolling}
                              className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                            >
                              Apply Directly
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {program.batches.map((batch) => {
                            const isSelected = activeBatchId === batch.id;
                            const isFull = batch.availableSeats <= 0;

                            return (
                              <div
                                key={batch.id}
                                onClick={() =>
                                  !isAlreadyEnrolled && !isFull && handleSelectBatch(program.id, batch.id)
                                }
                                className={`p-4 rounded-2xl border transition-all text-xs space-y-2 relative ${
                                  isAlreadyEnrolled
                                    ? "bg-sage-50/50 border-border opacity-90"
                                    : isSelected
                                    ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs cursor-pointer"
                                    : isFull
                                    ? "bg-sage-50/30 border-border opacity-60 cursor-not-allowed"
                                    : "bg-white border-border hover:border-emerald-300 cursor-pointer shadow-xs"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div>
                                    <span className="font-mono text-[9px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                                      {batch.batchCode}
                                    </span>
                                    <h5 className="font-bold text-charcoal-800 mt-1">
                                      {batch.name}
                                    </h5>
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                      batch.status === "ACTIVE" || batch.status === "OPEN"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : "bg-amber-50 text-amber-800 border-amber-200"
                                    }`}
                                  >
                                    {batch.status}
                                  </span>
                                </div>

                                <div className="text-[11px] text-muted space-y-0.5">
                                  <p>Starts: {formatDate(batch.startDate)}</p>
                                  {batch.endDate && <p>Ends: {formatDate(batch.endDate)}</p>}
                                </div>

                                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                                  <span className="text-muted font-medium">
                                    {batch.enrolledCount} / {batch.maxCapacity} Seats
                                  </span>
                                  <span
                                    className={`font-bold ${
                                      isFull ? "text-red-600" : "text-emerald-700"
                                    }`}
                                  >
                                    {isFull ? "Batch Full" : `${batch.availableSeats} Available`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ENROLLED PROGRAMS PROGRESSION */}
      {activeTab === "enrolled" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              Live progression status, attendance tracking, practical assessments, and digital certificates for your active courses.
            </p>
          </div>

          {enrolled.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-border text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sage-50 text-emerald-800 flex items-center justify-center mx-auto">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-charcoal-800">
                  No Training Programs Enrolled Yet
                </h3>
                <p className="text-xs text-muted max-w-md mx-auto mt-1">
                  You are not currently enrolled in any accredited training batches. Explore available programs to get started.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("available")}
                className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition"
              >
                Browse Available Programs
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {enrolled.map((enrollment) => {
                const cert = certifications.find((c) => c.programId === enrollment.programId);
                const assessment = enrollment.assessments?.[0];

                return (
                  <div
                    key={enrollment.id}
                    className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                            {enrollment.program.code} · {enrollment.program.sector}
                          </span>
                          {enrollment.batch && (
                            <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                              Batch: {enrollment.batch.batchCode}
                            </span>
                          )}
                        </div>
                        <h4 className="font-display font-bold text-lg text-charcoal-800 mt-1">
                          {enrollment.program.title}
                        </h4>
                        <p className="text-xs text-muted">
                          Training Provider: {enrollment.program.provider.institutionName} ({enrollment.program.provider.district})
                        </p>
                      </div>

                      <StatusBadge status={enrollment.status} size="md" />
                    </div>

                    {/* 4-Step Visual Pathway */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      {/* Step 1: Enrolled */}
                      <div className="p-3.5 rounded-xl bg-sage-50/50 border border-sage-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>1. Enrolled</span>
                        </div>
                        <p className="text-[11px] text-muted">{formatDate(enrollment.enrollmentDate)}</p>
                        <p className="text-[10px] text-muted">{enrollment.program.durationWeeks} Weeks Duration</p>
                      </div>

                      {/* Step 2: Attended */}
                      <div className="p-3.5 rounded-xl bg-white border border-border space-y-1">
                        <div
                          className={`flex items-center gap-1.5 font-bold ${
                            enrollment.attendancePercentage !== null
                              ? "text-emerald-800"
                              : "text-muted"
                          }`}
                        >
                          {enrollment.attendancePercentage !== null ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>2. Attended</span>
                        </div>
                        <p className="font-bold text-charcoal-800">
                          {enrollment.attendancePercentage !== null
                            ? `${enrollment.attendancePercentage}%`
                            : "Attendance active"}
                        </p>
                        <p className="text-[10px] text-muted">
                          Min {enrollment.program.minHours} Practical Hours
                        </p>
                      </div>

                      {/* Step 3: Assessed */}
                      <div className="p-3.5 rounded-xl bg-white border border-border space-y-1">
                        <div
                          className={`flex items-center gap-1.5 font-bold ${
                            assessment ? "text-emerald-800" : "text-muted"
                          }`}
                        >
                          {assessment ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>3. Assessed</span>
                        </div>
                        <p className="font-bold text-charcoal-800">
                          {assessment
                            ? `${assessment.scoreObtained}/${assessment.maxScore}`
                            : "Curriculum assessment"}
                        </p>
                        <p className="text-[10px] text-muted">
                          {assessment
                            ? assessment.passed
                              ? "Passed"
                              : "Review required"
                            : enrollment.grade
                            ? `Grade: ${enrollment.grade}`
                            : "Pending assessment"}
                        </p>
                      </div>

                      {/* Step 4: Certified */}
                      <div
                        className={`p-3.5 rounded-xl border space-y-1 ${
                          cert
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            : "bg-white border-border text-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          {cert ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>4. Certified</span>
                        </div>
                        <p className="font-mono text-[11px] truncate">
                          {cert ? cert.certificateNumber : "In Progress"}
                        </p>
                        <p className="text-[10px]">
                          {cert ? cert.verificationStatus.replace(/_/g, " ") : "Pending Certification"}
                        </p>
                      </div>
                    </div>

                    {/* Verifiable Certificate Banner */}
                    {cert && (
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
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

                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0 text-emerald-800 bg-emerald-100 border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
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
      )}
    </div>
  );
}
