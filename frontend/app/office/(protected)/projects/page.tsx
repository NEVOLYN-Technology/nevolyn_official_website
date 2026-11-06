"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import NextLink from "next/link";
import { Plus, Search, User as UserIcon, ArrowRight } from "lucide-react";
import { CreateProjectModal } from "@/components/projects";
import { PROJECT_STATUSES } from "@/lib/constants";

/**
 * ProjectsPage component.
 *
 * Renders the central R&D project portfolio catalogue with full-text search,
 * status lifecycle filtering (ACTIVE, ON_HOLD, COMPLETED, CANCELLED), and
 * role-guarded project creation modals.
 *
 * @returns {React.ReactElement} The rendered projects directory view.
 */
export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const res = await projectsApi.getAll();
      return res.data;
    },
  });

  const filteredProjects = (projects || []).filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">R&D Projects Portfolio</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Research initiatives, textile innovation pipelines, and technical milestones.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 w-56 shadow-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-900 shadow-xs"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {isAdmin && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-3xl bg-white border border-slate-200 animate-pulse" />
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">
            No projects found matching your criteria.
          </div>
        ) : (
          filteredProjects.map((p) => (
            <NextLink
              key={p.id}
              href={`/office/projects/${p.id}`}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] hover:shadow-[0_14px_34px_-10px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-teal-800 font-bold text-xs px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200">
                    {p.code}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {p.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-700 transition line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {p.objective || p.description || "No objective documented."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold">Progress</span>
                    <span className="font-mono font-bold text-slate-900">{p.progressPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full"
                      style={{ width: `${p.progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[120px]">{p.responsibleName || "Unassigned"}</span>
                  </span>
                  <span className="text-slate-600 font-bold flex items-center gap-1 group-hover:text-teal-700 transition">
                    Open Project <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </NextLink>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            queryClient.invalidateQueries({ queryKey: ["projects-list"] });
          }}
        />
      )}
    </div>
  );
}
