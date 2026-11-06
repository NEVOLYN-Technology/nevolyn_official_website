"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi, filesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import NextLink from "next/link";
import {
  FlaskConical,
  CheckSquare,
  FileCode,
  Paperclip,
  ArrowLeft,
  Plus,
  Upload,
  Download,
  Edit,
} from "lucide-react";
import {
  AddExperimentModal,
  AddDevRecordModal,
  UploadFileModal,
  UpdateStatusModal,
} from "@/components/projects";

/**
 * ProjectDetailPage component.
 *
 * Provides a comprehensive R&D project workspace view with dynamic tabs:
 * - Tasks tab: Assigned action items, priorities, and statuses.
 * - Experiments tab: Lab formulation, trials, outcomes, and research records.
 * - Development Records tab: Engineering milestones and version logs.
 * - Files tab: Project attachments and multipart document management.
 *
 * @returns {React.ReactElement} The rendered project workspace dashboard.
 */
export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"tasks" | "experiments" | "dev" | "files">("tasks");
  const [isExpOpen, setIsExpOpen] = useState(false);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const { data: detail, isLoading, error } = useQuery({
    queryKey: ["project-detail", projectId],
    queryFn: async () => {
      const res = await projectsApi.getDetail(projectId);
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="p-8 text-slate-400 text-sm">Loading project workspace...</div>;
  }

  if (error || !detail) {
    return <div className="p-8 text-rose-400 text-sm">Failed to load project details.</div>;
  }

  const p = detail.project;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button & Title Header */}
      <div>
        <NextLink href="/office/projects" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects Portfolio
        </NextLink>

        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-cyan-400 font-extrabold text-sm px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  {p.code}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                  {p.status}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{p.name}</h1>
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                {p.objective || p.description || "No objective documented."}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsStatusOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-2 transition"
              >
                <Edit className="w-3.5 h-3.5" /> Update Status
              </button>
            )}
          </div>

          {/* Project Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Responsible Lead</span>
              <span className="font-semibold text-white mt-0.5 block">{p.responsibleName || "Unassigned"}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Start Date</span>
              <span className="font-mono text-slate-300 mt-0.5 block">{p.startDate || "-"}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Date</span>
              <span className="font-mono text-slate-300 mt-0.5 block">{p.targetDate || "-"}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Overall Progress</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${p.progressPct}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-white">{p.progressPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "tasks" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks ({detail.tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("experiments")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "experiments" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white"
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Experiments ({detail.experiments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("dev")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "dev" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Dev Records ({detail.developmentRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("files")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "files" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white"
          }`}
        >
          <Paperclip className="w-4 h-4" />
          <span>Files ({detail.files.length})</span>
        </button>
      </div>

      {/* Tab 1: Tasks */}
      {activeTab === "tasks" && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Project Tasks</h2>
            {isAdmin && (
              <NextLink
                href="/office/tasks"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Assign Task
              </NextLink>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {detail.tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No tasks assigned under this project yet.
                    </td>
                  </tr>
                ) : (
                  detail.tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-white">{t.title}</td>
                      <td className="py-3 px-3">{t.assignedToName}</td>
                      <td className="py-3 px-3 font-mono">{t.deadline || "-"}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-semibold">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">{t.progressPct}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Experiments */}
      {activeTab === "experiments" && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Laboratory Experiments</h2>
            <button
              onClick={() => setIsExpOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Record Experiment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detail.experiments.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                No experiments recorded yet for this project.
              </div>
            ) : (
              detail.experiments.map((exp) => (
                <div key={exp.id} className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-white text-sm">{exp.title}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{exp.experimentDate}</span>
                  </div>
                  <p className="text-xs text-slate-400"><span className="text-slate-500">Researcher:</span> {exp.researcherName}</p>
                  {exp.objective && <p className="text-xs text-slate-300"><span className="text-slate-500">Objective:</span> {exp.objective}</p>}
                  {exp.result && <p className="text-xs text-slate-300"><span className="text-slate-500">Result:</span> {exp.result}</p>}
                  {exp.conclusion && <p className="text-xs text-emerald-400"><span className="text-slate-500">Conclusion:</span> {exp.conclusion}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Development Records */}
      {activeTab === "dev" && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Development Records</h2>
            <button
              onClick={() => setIsDevOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Dev Record
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detail.developmentRecords.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                No development records found.
              </div>
            ) : (
              detail.developmentRecords.map((dev) => (
                <div key={dev.id} className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{dev.productName}</h3>
                      <span className="text-[10px] text-cyan-400 font-mono">Stage: {dev.stage} {dev.version && `(${dev.version})`}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{dev.recordDate}</span>
                  </div>
                  {dev.result && <p className="text-xs text-slate-300"><span className="text-slate-500">Findings:</span> {dev.result}</p>}
                  {dev.issues && <p className="text-xs text-amber-400"><span className="text-slate-500">Challenges:</span> {dev.issues}</p>}
                  {dev.nextAction && <p className="text-xs text-slate-400"><span className="text-slate-500">Next Step:</span> {dev.nextAction}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: File Attachments */}
      {activeTab === "files" && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Document Attachments</h2>
            <button
              onClick={() => setIsFileOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Document
            </button>
          </div>

          <div className="space-y-2">
            {detail.files.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No files attached to this project.</p>
            ) : (
              detail.files.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="font-semibold text-white">{f.originalFilename}</p>
                      <p className="text-[10px] text-slate-500">
                        {(f.fileSize / 1024).toFixed(1)} KB • Uploaded by {f.uploadedByName}
                      </p>
                    </div>
                  </div>
                  <a
                    href={filesApi.downloadUrl(f.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {isExpOpen && (
        <AddExperimentModal
          projectId={projectId}
          onClose={() => setIsExpOpen(false)}
          onSuccess={() => {
            setIsExpOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-detail", projectId] });
          }}
        />
      )}

      {isDevOpen && (
        <AddDevRecordModal
          projectId={projectId}
          onClose={() => setIsDevOpen(false)}
          onSuccess={() => {
            setIsDevOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-detail", projectId] });
          }}
        />
      )}

      {isFileOpen && (
        <UploadFileModal
          entityType="project"
          entityId={projectId}
          onClose={() => setIsFileOpen(false)}
          onSuccess={() => {
            setIsFileOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-detail", projectId] });
          }}
        />
      )}

      {isStatusOpen && (
        <UpdateStatusModal
          project={p}
          onClose={() => setIsStatusOpen(false)}
          onSuccess={() => {
            setIsStatusOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-detail", projectId] });
          }}
        />
      )}
    </div>
  );
}
