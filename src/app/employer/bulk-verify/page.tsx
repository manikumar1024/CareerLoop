"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Download, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function EmployerBulkVerifyPage() {
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleCsv = `TraineeId,Action,Notes\nCLP-2026-001,APPROVE,Verified full-time role\nCLP-2026-002,APPROVE,Joining confirmed in engineering\nCLP-2026-003,REJECT,Record does not match payroll`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "careerloop_bulk_verification_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length <= 1) return [];
    
    // Check header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const traineeIdIdx = headers.findIndex((h) => h.includes("trainee") || h.includes("id"));
    const actionIdx = headers.findIndex((h) => h.includes("action") || h.includes("status"));
    const notesIdx = headers.findIndex((h) => h.includes("note"));

    const items: Array<{ traineeId: string; action: "APPROVE" | "REJECT"; notes?: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < 2 || !cols[0]) continue;

      const traineeId = cols[traineeIdIdx !== -1 ? traineeIdIdx : 0];
      const rawAction = (cols[actionIdx !== -1 ? actionIdx : 1] || "APPROVE").toUpperCase();
      const action = rawAction.includes("REJECT") ? "REJECT" : "APPROVE";
      const notes = notesIdx !== -1 ? cols[notesIdx] : cols[2] || "";

      items.push({ traineeId, action, notes });
    }
    return items;
  };

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    const items = parseCsv(csvText);
    if (items.length === 0) {
      setError("Please enter valid CSV data with at least one record (TraineeId, Action).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/employer/bulk-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process bulk verification");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-800 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-700" />
            <span>Bulk Employment Verification</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Accelerate verification by uploading batch CSV or JSON files for large hiring cohorts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 rounded-xl bg-white border border-border text-charcoal-700 hover:bg-sage-50 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Download CSV Template</span>
          </button>
          <Link
            href="/employer/verifications"
            className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>Single Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & CSV Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Upload or Paste Batch File</span>
            </h3>

            <div className="border-2 border-dashed border-border/80 hover:border-emerald-600 rounded-2xl p-6 text-center transition bg-sage-50/30">
              <input
                type="file"
                accept=".csv,.txt"
                id="csvFileInput"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="csvFileInput"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <FileText className="w-8 h-8 text-emerald-700" />
                <span className="text-xs font-semibold text-charcoal-800">
                  Click to browse or drop CSV file here
                </span>
                <span className="text-[11px] text-muted">Supports comma-delimited .csv files</span>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal-700">
                  Or paste CSV raw data directly:
                </label>
                <button
                  type="button"
                  onClick={() => setCsvText(sampleCsv)}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold"
                >
                  Insert Sample Data
                </button>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="TraineeId,Action,Notes&#10;CLP-2026-001,APPROVE,Verified full-time&#10;CLP-2026-002,APPROVE,Confirmed"
                rows={6}
                className="w-full font-mono text-xs p-3.5 rounded-xl border border-border bg-charcoal-50 text-charcoal-800 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !csvText.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold text-xs tracking-wide transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Batch Verifications...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute Bulk Verification</span>
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          {result && (
            <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
              <h3 className="font-display font-bold text-base text-charcoal-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>Batch Processing Summary</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="font-display font-black text-xl text-charcoal-800">{result.processedCount}</div>
                  <div className="text-[11px] text-muted">Total Processed</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="font-display font-black text-xl text-emerald-700">{result.approvedCount}</div>
                  <div className="text-[11px] text-emerald-800 font-semibold">Approved</div>
                </div>
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                  <div className="font-display font-black text-xl text-red-700">{result.rejectedCount}</div>
                  <div className="text-[11px] text-red-800 font-semibold">Rejected</div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-bold text-charcoal-700">Skipped or Unmatched Records:</span>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {result.errors.map((e: any, idx: number) => (
                      <div key={idx} className="text-[11px] p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex justify-between">
                        <span className="font-mono font-bold">{e.identifier}</span>
                        <span>{e.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informational Guidance Sidebar */}
        <div className="space-y-4">
          <div className="bg-sage-50/70 rounded-3xl p-6 border border-sage-200 space-y-3">
            <h4 className="font-display font-bold text-sm text-charcoal-800">CSV Formatting Rules</h4>
            <ul className="text-xs text-charcoal-700 space-y-2 list-disc list-inside">
              <li>
                <strong>TraineeId:</strong> Unique National Trainee ID (e.g. <code>CLP-2026-XXXX</code>)
              </li>
              <li>
                <strong>Action:</strong> <code>APPROVE</code> or <code>REJECT</code>
              </li>
              <li>
                <strong>Notes:</strong> Optional HR internal auditing notes or payroll reference code
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-2">
            <h4 className="font-display font-bold text-sm text-charcoal-800">Compliance & Immutability</h4>
            <p className="text-xs text-muted leading-relaxed">
              Every approved record generates an unalterable audit log with timestamp and verified employer session signature in the national outcome registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
