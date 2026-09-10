"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Sparkles, 
  Plus, 
  Briefcase, 
  GraduationCap, 
  Code, 
  User 
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SkillItem {
  name: string;
  category?: string;
  proficiencyLevel?: string;
}

interface ProjectItem {
  title: string;
  description?: string;
  techStack?: string;
}

interface ExtractedData {
  name?: string;
  age?: number | null;
  gender?: string | null;
  educationLevel?: string | null;
  skills: SkillItem[];
  projects: ProjectItem[];
  experienceYears?: number;
  summary?: string;
}

interface ResumeUploadManagerProps {
  initialFileName?: string | null;
  initialUploadedAt?: string | null;
  initialParsedData?: string | null;
}

export default function ResumeUploadManager({
  initialFileName,
  initialUploadedAt,
  initialParsedData,
}: ResumeUploadManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(initialFileName || null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(initialUploadedAt || null);

  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(() => {
    if (initialParsedData) {
      try {
        return JSON.parse(initialParsedData);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // New Skill Input in Modal
  const [newSkillText, setNewSkillText] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processResumeUpload(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processResumeUpload(file);
  };

  const processResumeUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/trainee/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload resume.");
      }

      setFileName(data.fileName);
      setUploadedAt(new Date().toISOString());
      setExtractedData(data.extractedData);
      setIsModalOpen(true);
    } catch (err: any) {
      setUploadError(err.message || "An error occurred during resume parsing.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddSkill = () => {
    if (!newSkillText.trim() || !extractedData) return;
    setExtractedData({
      ...extractedData,
      skills: [...extractedData.skills, { name: newSkillText.trim(), proficiencyLevel: "INTERMEDIATE" }],
    });
    setNewSkillText("");
  };

  const handleRemoveSkill = (index: number) => {
    if (!extractedData) return;
    const updated = [...extractedData.skills];
    updated.splice(index, 1);
    setExtractedData({ ...extractedData, skills: updated });
  };

  const handleRemoveProject = (index: number) => {
    if (!extractedData) return;
    const updated = [...extractedData.projects];
    updated.splice(index, 1);
    setExtractedData({ ...extractedData, projects: updated });
  };

  const handleConfirmSync = async () => {
    if (!extractedData) return;
    setIsSyncing(true);
    setUploadError(null);

    try {
      const res = await fetch("/api/trainee/resume/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extractedData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to synchronize profile.");
      }

      setSuccessMessage(data.message);
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setUploadError(err.message || "Failed to synchronize profile.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Box / Existing Status */}
      <div className="p-5 rounded-2xl bg-white border border-border/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-charcoal-800">
                AI Resume Synchronization
              </h4>
              <p className="text-[11px] text-muted">
                Upload your resume (PDF, DOCX, TXT) to automatically extract and verify your skills and projects.
              </p>
            </div>
          </div>
          {fileName && (
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              PARSED & ATTACHED
            </span>
          )}
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {fileName ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-sage-50/60 border border-sage-200">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-emerald-800 flex-shrink-0" />
              <div>
                <p className="font-semibold text-xs text-charcoal-800 truncate max-w-xs">{fileName}</p>
                <p className="text-[10px] text-muted">
                  Uploaded {uploadedAt ? new Date(uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {extractedData && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition"
                >
                  Review Extracted Data
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-900 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Replace Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-border hover:border-emerald-600/60 bg-sage-50/40 rounded-2xl p-6 text-center cursor-pointer transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin" />
                <p className="font-semibold text-xs text-charcoal-800">Analyzing document structure & competencies...</p>
                <p className="text-[11px] text-muted">Extracting education, technical capabilities, and projects</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-semibold text-xs text-charcoal-800">
                  Click or drag and drop your resume here
                </p>
                <p className="text-[11px] text-muted">
                  Supports PDF, DOCX, or TXT up to 5MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extraction Review & Sync Modal */}
      {isModalOpen && extractedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-charcoal-800">
                    Review Extracted Resume Data
                  </h3>
                  <p className="text-xs text-muted">
                    Confirm or adjust the details detected by the CareerLoop parser before syncing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-charcoal-800 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Core Fields */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                Detected Identity & Education
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={extractedData.name || ""}
                    onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    placeholder="Candidate Name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={extractedData.age || ""}
                    onChange={(e) => setExtractedData({ ...extractedData, age: e.target.value ? parseInt(e.target.value, 10) : null })}
                    className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    placeholder="e.g. 23"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                    Highest Education
                  </label>
                  <input
                    type="text"
                    value={extractedData.educationLevel || ""}
                    onChange={(e) => setExtractedData({ ...extractedData, educationLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    placeholder="e.g. B.Tech Computer Science"
                  />
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-700" />
                  Identified Skills ({extractedData.skills.length})
                </h4>
              </div>

              <div className="flex flex-wrap gap-2 p-3 bg-sage-50/50 rounded-2xl border border-sage-200 min-h-[60px]">
                {extractedData.skills.length === 0 ? (
                  <p className="text-xs text-muted italic">No skills extracted. You can add them below.</p>
                ) : (
                  extractedData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-medium border border-emerald-200 shadow-2xs"
                    >
                      <span>{skill.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="hover:text-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Skill Row */}
              <div className="flex gap-2 text-xs">
                <input
                  type="text"
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
                  placeholder="Add skill manually (e.g., Docker, SQL, Welding)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-sage-100 hover:bg-sage-200 text-charcoal-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Projects Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                Detected Projects ({extractedData.projects.length})
              </h4>

              <div className="space-y-2">
                {extractedData.projects.length === 0 ? (
                  <p className="text-xs text-muted italic p-3 bg-sage-50/40 rounded-xl">
                    No distinct project entries parsed.
                  </p>
                ) : (
                  extractedData.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-border flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-charcoal-800">{proj.title}</p>
                        {proj.description && <p className="text-muted text-[11px]">{proj.description}</p>}
                        {proj.techStack && (
                          <p className="text-[10px] font-mono text-emerald-800">
                            Tech: {proj.techStack}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-muted hover:text-red-600 p-1 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-charcoal-700 hover:bg-sage-50 text-xs font-semibold"
              >
                Discard / Cancel
              </button>

              <button
                type="button"
                disabled={isSyncing}
                onClick={handleConfirmSync}
                className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-sm flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Sync to Profile</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
