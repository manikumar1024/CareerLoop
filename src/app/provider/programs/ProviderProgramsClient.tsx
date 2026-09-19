"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Users,
  GraduationCap,
  Clock,
  Award,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";

interface TraineeUser {
  id: string;
  name: string | null;
  email: string;
}

interface TraineeProfileData {
  id: string;
  traineeId: string;
  district: string;
  state: string;
  currentStatus: string;
  user: TraineeUser;
}

interface EnrollmentItem {
  id: string;
  traineeId: string;
  programId: string;
  batchId: string | null;
  enrollmentDate: string | Date;
  status: string;
  attendancePercentage: number | null;
  grade: string | null;
  trainee: TraineeProfileData;
  assessments?: any[];
}

interface BatchItem {
  id: string;
  programId: string;
  name: string;
  batchCode: string;
  startDate: string | Date;
  endDate: string | Date | null;
  status: string;
  maxCapacity: number;
  enrollments: EnrollmentItem[];
  createdAt: string | Date;
}

interface ProgramItem {
  id: string;
  providerId: string;
  title: string;
  code: string;
  sector: string;
  description: string;
  durationWeeks: number;
  minHours: number;
  skillsOffered: string | null;
  status: string;
  batches: BatchItem[];
  enrollments: EnrollmentItem[];
  certifications: any[];
  createdAt: string | Date;
}

interface ProviderProgramsClientProps {
  initialPrograms: ProgramItem[];
  providerName: string;
}

export default function ProviderProgramsClient({
  initialPrograms,
  providerName,
}: ProviderProgramsClientProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState<ProgramItem[]>(initialPrograms);
  const [activeTab, setActiveTab] = useState<"programs" | "create_program" | "roster">("programs");
  
  // Expanded programs state for batch/roster view
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(
    initialPrograms[0]?.id || null
  );

  // New Program Form State
  const [programForm, setProgramForm] = useState({
    title: "",
    code: "",
    sector: "",
    description: "",
    durationWeeks: 12,
    minHours: 360,
    skillsOffered: "",
  });
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [programError, setProgramError] = useState<string | null>(null);

  // Batch Modal State
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedProgramForBatch, setSelectedProgramForBatch] = useState<ProgramItem | null>(null);
  const [batchForm, setBatchForm] = useState({
    name: "",
    batchCode: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    maxCapacity: 30,
    status: "ACTIVE",
  });
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  // Success Notification
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgramError(null);
    setIsCreatingProgram(true);

    try {
      const res = await fetch("/api/provider/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(programForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create program");
      }

      // Add new program to state
      const created: ProgramItem = {
        ...data.program,
        batches: [],
        enrollments: [],
        certifications: [],
      };

      setPrograms([created, ...programs]);
      setExpandedProgramId(created.id);
      setActiveTab("programs");

      // Reset form
      setProgramForm({
        title: "",
        code: "",
        sector: "",
        description: "",
        durationWeeks: 12,
        minHours: 360,
        skillsOffered: "",
      });

      showToast("Training program published successfully!");
      router.refresh();
    } catch (err: any) {
      setProgramError(err.message || "Failed to create program");
    } finally {
      setIsCreatingProgram(false);
    }
  };

  const openBatchModal = (program: ProgramItem) => {
    setSelectedProgramForBatch(program);
    const randomCode = Math.floor(10 + Math.random() * 90);
    setBatchForm({
      name: `${program.title.split(" ")[0]} Batch 2026-Alpha`,
      batchCode: `BCH-${program.code.replace(/[^A-Z0-9]/g, "").slice(0, 6)}-${randomCode}`,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      maxCapacity: 30,
      status: "ACTIVE",
    });
    setBatchError(null);
    setBatchModalOpen(true);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramForBatch) return;

    setBatchError(null);
    setIsCreatingBatch(true);

    try {
      const res = await fetch("/api/provider/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: selectedProgramForBatch.id,
          ...batchForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create batch");
      }

      // Update state
      const updatedPrograms = programs.map((p) => {
        if (p.id === selectedProgramForBatch.id) {
          return {
            ...p,
            batches: [data.batch, ...p.batches],
          };
        }
        return p;
      });

      setPrograms(updatedPrograms);
      setBatchModalOpen(false);
      showToast(`Batch '${data.batch.batchCode}' added successfully!`);
      router.refresh();
    } catch (err: any) {
      setBatchError(err.message || "Failed to create batch");
    } finally {
      setIsCreatingBatch(false);
    }
  };

  // Calculations
  const totalPrograms = programs.length;
  const allBatches = programs.flatMap((p) => p.batches);
  const totalBatches = allBatches.length;
  const allEnrollments = programs.flatMap((p) => p.enrollments);
  const totalEnrolled = allEnrollments.length;
  const totalCertified = programs.reduce((acc, p) => acc + p.certifications.length, 0);

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-800 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Provider Portal
            </span>
            <span className="text-xs text-muted font-medium">{providerName}</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight">
            Programs, Curricula & Batches
          </h1>
          <p className="text-xs text-muted">
            Create accredited vocational training programs, configure student batches, and track enrolled candidates in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("create_program")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Program</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Programs</span>
            <BookOpen className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-display font-bold text-2xl text-charcoal-800">{totalPrograms}</p>
          <p className="text-[11px] text-muted">Accredited modules</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Batches</span>
            <Layers className="w-4 h-4 text-blue-700" />
          </div>
          <p className="font-display font-bold text-2xl text-charcoal-800">{totalBatches}</p>
          <p className="text-[11px] text-muted">Active & upcoming cohorts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Trainees</span>
            <Users className="w-4 h-4 text-purple-700" />
          </div>
          <p className="font-display font-bold text-2xl text-charcoal-800">{totalEnrolled}</p>
          <p className="text-[11px] text-muted">Shared database records</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Certified</span>
            <GraduationCap className="w-4 h-4 text-amber-700" />
          </div>
          <p className="font-display font-bold text-2xl text-charcoal-800">{totalCertified}</p>
          <p className="text-[11px] text-muted">Verified credentials</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("programs")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "programs"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-charcoal-600 hover:bg-sage-50"
          }`}
        >
          Programs & Batches ({totalPrograms})
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "roster"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-charcoal-600 hover:bg-sage-50"
          }`}
        >
          Enrolled Trainees Roster ({totalEnrolled})
        </button>

        <button
          onClick={() => setActiveTab("create_program")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "create_program"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-charcoal-600 hover:bg-sage-50"
          }`}
        >
          + Create Program Form
        </button>
      </div>

      {/* TAB 1: PROGRAMS & BATCHES LIST */}
      {activeTab === "programs" && (
        <div className="space-y-6">
          {programs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-border text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sage-50 text-emerald-800 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-charcoal-800">
                  No Programs Created Yet
                </h3>
                <p className="text-xs text-muted max-w-sm mx-auto mt-1">
                  Publish your institution&apos;s first accredited vocational training program to begin admitting student cohorts.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("create_program")}
                className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition"
              >
                Create Program Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {programs.map((program) => {
                const isExpanded = expandedProgramId === program.id;
                const batchCount = program.batches.length;
                const enrolledCount = program.enrollments.length;

                return (
                  <div
                    key={program.id}
                    className="bg-white rounded-3xl border border-border shadow-card overflow-hidden transition-all"
                  >
                    {/* Program Header */}
                    <div className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 uppercase">
                            {program.code}
                          </span>
                          <span className="text-[10px] font-semibold text-charcoal-600 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                            {program.sector}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {program.durationWeeks} Weeks ({program.minHours} Practical Hours)
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-xl text-charcoal-800">
                          {program.title}
                        </h3>

                        <p className="text-xs text-muted leading-relaxed max-w-3xl">
                          {program.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {enrolledCount} Students Enrolled
                        </span>

                        <button
                          onClick={() => openBatchModal(program)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Batch</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedProgramId(isExpanded ? null : program.id)
                          }
                          className="p-2 rounded-xl border border-border hover:bg-sage-50 text-charcoal-700 transition cursor-pointer"
                          title={isExpanded ? "Collapse Details" : "Expand Details"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Section: Batches & Enrolled Students */}
                    {isExpanded && (
                      <div className="border-t border-border/60 bg-sage-50/30 p-6 sm:p-7 space-y-6">
                        {/* Batches Sub-section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display font-bold text-sm text-charcoal-800 flex items-center gap-2">
                              <Layers className="w-4 h-4 text-emerald-700" />
                              <span>Program Batches ({batchCount})</span>
                            </h4>

                            <button
                              onClick={() => openBatchModal(program)}
                              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Create Batch for this Program
                            </button>
                          </div>

                          {batchCount === 0 ? (
                            <div className="p-5 rounded-2xl bg-white border border-dashed border-border text-center space-y-2">
                              <p className="text-xs text-muted">
                                No specific cohort batches configured yet for this program.
                              </p>
                              <button
                                onClick={() => openBatchModal(program)}
                                className="px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition"
                              >
                                Create First Batch
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {program.batches.map((batch) => {
                                const enrolledInBatch = program.enrollments.filter(
                                  (e) => e.batchId === batch.id
                                ).length;
                                const capacityPercent = Math.min(
                                  100,
                                  Math.round((enrolledInBatch / batch.maxCapacity) * 100)
                                );

                                return (
                                  <div
                                    key={batch.id}
                                    className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                                          {batch.batchCode}
                                        </span>
                                        <h5 className="font-display font-bold text-sm text-charcoal-800 mt-1">
                                          {batch.name}
                                        </h5>
                                      </div>
                                      <span
                                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                          batch.status === "ACTIVE" || batch.status === "OPEN"
                                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                            : "bg-amber-50 text-amber-800 border-amber-200"
                                        }`}
                                      >
                                        {batch.status}
                                      </span>
                                    </div>

                                    {/* Dates */}
                                    <div className="text-[11px] text-muted space-y-1">
                                      <p className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-muted" />
                                        <span>Starts: {formatDate(batch.startDate)}</span>
                                      </p>
                                      {batch.endDate && (
                                        <p className="flex items-center gap-1.5">
                                          <Calendar className="w-3.5 h-3.5 text-muted" />
                                          <span>Ends: {formatDate(batch.endDate)}</span>
                                        </p>
                                      )}
                                    </div>

                                    {/* Capacity Meter */}
                                    <div className="space-y-1 pt-2 border-t border-border/40">
                                      <div className="flex justify-between text-[11px] font-medium text-charcoal-700">
                                        <span>Capacity Roster</span>
                                        <span className="font-bold">
                                          {enrolledInBatch} / {batch.maxCapacity} seats
                                        </span>
                                      </div>
                                      <div className="w-full h-2 bg-sage-100 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            capacityPercent >= 90
                                              ? "bg-red-500"
                                              : capacityPercent >= 60
                                              ? "bg-amber-500"
                                              : "bg-emerald-600"
                                          }`}
                                          style={{ width: `${capacityPercent}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Enrolled Students Roster */}
                        <div className="space-y-3 pt-4 border-t border-border/60">
                          <h4 className="font-display font-bold text-sm text-charcoal-800 flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-700" />
                            <span>Enrolled Students ({enrolledCount})</span>
                          </h4>

                          {enrolledCount === 0 ? (
                            <p className="text-xs text-muted">
                              No candidates currently enrolled in this program. Available to students in their portal.
                            </p>
                          ) : (
                            <div className="overflow-x-auto bg-white rounded-2xl border border-border">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-sage-50/60 border-b border-border text-[10px] uppercase font-bold text-muted">
                                  <tr>
                                    <th className="p-3">Trainee Name</th>
                                    <th className="p-3">Trainee ID</th>
                                    <th className="p-3">Batch</th>
                                    <th className="p-3">Enrolled Date</th>
                                    <th className="p-3">Attendance</th>
                                    <th className="p-3">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                  {program.enrollments.map((enr) => {
                                    const batchObj = program.batches.find(
                                      (b) => b.id === enr.batchId
                                    );
                                    return (
                                      <tr key={enr.id} className="hover:bg-sage-50/30">
                                        <td className="p-3 font-semibold text-charcoal-800">
                                          {enr.trainee.user.name || "Student"}
                                          <span className="block text-[10px] text-muted font-normal">
                                            {enr.trainee.user.email}
                                          </span>
                                        </td>
                                        <td className="p-3 font-mono text-[11px] text-emerald-800 font-bold">
                                          {enr.trainee.traineeId}
                                        </td>
                                        <td className="p-3 font-medium text-charcoal-700">
                                          {batchObj ? batchObj.batchCode : "General Program"}
                                        </td>
                                        <td className="p-3 text-muted">
                                          {formatDate(enr.enrollmentDate)}
                                        </td>
                                        <td className="p-3 font-medium">
                                          {enr.attendancePercentage !== null
                                            ? `${enr.attendancePercentage}%`
                                            : "Pending tracking"}
                                        </td>
                                        <td className="p-3">
                                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            {enr.status}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROSTER VIEW */}
      {activeTab === "roster" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-800">
                All Enrolled Trainees Roster ({totalEnrolled})
              </h3>
              <p className="text-xs text-muted">
                Direct live database roster of students enrolled across all of your programs and cohorts.
              </p>
            </div>
          </div>

          {totalEnrolled === 0 ? (
            <EmptyState
              title="No Enrolled Students"
              description="Candidates will appear here as soon as they enroll in your programs from the Student Portal."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-sage-50 border-b border-border text-[10px] uppercase font-bold text-muted">
                  <tr>
                    <th className="p-3.5">Student / Trainee</th>
                    <th className="p-3.5">Trainee ID</th>
                    <th className="p-3.5">Program</th>
                    <th className="p-3.5">Batch Code</th>
                    <th className="p-3.5">District</th>
                    <th className="p-3.5">Enrollment Date</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {programs.flatMap((p) =>
                    p.enrollments.map((enr) => {
                      const batch = p.batches.find((b) => b.id === enr.batchId);
                      return (
                        <tr key={enr.id} className="hover:bg-sage-50/40 transition">
                          <td className="p-3.5">
                            <span className="font-semibold text-charcoal-800 text-sm">
                              {enr.trainee.user.name || "Student"}
                            </span>
                            <span className="block text-[11px] text-muted">
                              {enr.trainee.user.email}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] font-bold text-emerald-800">
                            {enr.trainee.traineeId}
                          </td>
                          <td className="p-3.5 font-medium text-charcoal-800">
                            {p.title}
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-blue-800 font-bold">
                            {batch ? batch.batchCode : "—"}
                          </td>
                          <td className="p-3.5 text-muted">{enr.trainee.district}</td>
                          <td className="p-3.5 text-muted">{formatDate(enr.enrollmentDate)}</td>
                          <td className="p-3.5">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {enr.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREATE PROGRAM FORM */}
      {activeTab === "create_program" && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-card max-w-3xl space-y-6">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-2xl text-charcoal-800">
              Publish New Vocational Program
            </h2>
            <p className="text-xs text-muted mt-1">
              Add accredited curriculum modules. Once published, this course will immediately appear in the Student Portal for enrollment.
            </p>
          </div>

          {programError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{programError}</span>
            </div>
          )}

          <form onSubmit={handleCreateProgram} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1 uppercase tracking-wider text-[11px]">
                Program / Course Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Full Stack Web Development / Solar PV Technician"
                value={programForm.title}
                onChange={(e) =>
                  setProgramForm({ ...programForm, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1 uppercase tracking-wider text-[11px]">
                  Standard Program Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRG-FSW-2026"
                  value={programForm.code}
                  onChange={(e) =>
                    setProgramForm({ ...programForm, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white font-mono uppercase text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1 uppercase tracking-wider text-[11px]">
                  Sector / Industry Domain *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Information Technology / Green Energy"
                  value={programForm.sector}
                  onChange={(e) =>
                    setProgramForm({ ...programForm, sector: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1 uppercase tracking-wider text-[11px]">
                  Duration (Weeks)
                </label>
                <input
                  type="number"
                  min={1}
                  value={programForm.durationWeeks}
                  onChange={(e) =>
                    setProgramForm({
                      ...programForm,
                      durationWeeks: parseInt(e.target.value) || 12,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1 uppercase tracking-wider text-[11px]">
                  Min Practical / Lab Hours
                </label>
                <input
                  type="number"
                  min={10}
                  value={programForm.minHours}
                  onChange={(e) =>
                    setProgramForm({
                      ...programForm,
                      minHours: parseInt(e.target.value) || 360,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1 uppercase tracking-wider text-[11px]">
                Skills Covered (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, PostgreSQL, REST APIs, TypeScript"
                value={programForm.skillsOffered}
                onChange={(e) =>
                  setProgramForm({ ...programForm, skillsOffered: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1 uppercase tracking-wider text-[11px]">
                Curriculum Scope & Program Description *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe practical modules, laboratory competencies, target industry job roles..."
                value={programForm.description}
                onChange={(e) =>
                  setProgramForm({ ...programForm, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm leading-relaxed"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("programs")}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-sage-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingProgram}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isCreatingProgram ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Publish Training Program</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      {batchModalOpen && selectedProgramForBatch && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-border animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {selectedProgramForBatch.code}
                </span>
                <h3 className="font-display font-bold text-lg text-charcoal-800 mt-1">
                  Create Cohort Batch
                </h3>
              </div>
              <button
                onClick={() => setBatchModalOpen(false)}
                className="text-muted hover:text-charcoal-800 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {batchError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                {batchError}
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch 2026-Alpha (Morning)"
                  value={batchForm.name}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">
                  Unique Batch Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BCH-DEV-01"
                  value={batchForm.batchCode}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, batchCode: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border font-mono uppercase text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchForm.startDate}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={batchForm.endDate}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    Max Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={batchForm.maxCapacity}
                    onChange={(e) =>
                      setBatchForm({
                        ...batchForm,
                        maxCapacity: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    Status
                  </label>
                  <select
                    value={batchForm.status}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white"
                  >
                    <option value="ACTIVE">ACTIVE (Open)</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-sage-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingBatch ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Batch"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
