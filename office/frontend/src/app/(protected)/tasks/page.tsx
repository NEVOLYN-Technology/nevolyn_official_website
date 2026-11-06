"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api";
import { Task } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Edit2 } from "lucide-react";
import { CreateTaskModal, UpdateTaskModal } from "@/components/tasks";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";

/**
 * TasksPage component.
 *
 * Provides a responsive task tracking and delegation board with:
 * - Full-text search across titles, project codes, and assignee names.
 * - Multi-criteria status (TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED) and priority filters.
 * - Task creation and editing dialog integrations with automatic TanStack Query cache invalidation.
 *
 * @returns {React.ReactElement} The rendered task management table and control bar.
 */
export default function TasksPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks-list"],
    queryFn: async () => {
      const res = await tasksApi.getAll();
      return res.data;
    },
  });

  const filteredTasks = (tasks || []).filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.projectCode && t.projectCode.toLowerCase().includes(search.toLowerCase())) ||
      (t.assignedToName && t.assignedToName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tasks Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin ? "Global task delegation, milestone tracking, and workload allocation." : "Tasks delegated to you across R&D initiatives."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, code, assignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {isAdmin && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Delegate Task
            </button>
          )}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading task registry...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No tasks matching your current filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{t.title}</div>
                      {t.description && <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{t.description}</div>}
                    </td>
                    <td className="py-3 px-4">
                      {t.projectCode ? (
                        <span className="font-mono text-cyan-400 font-semibold text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {t.projectCode}
                        </span>
                      ) : (
                        <span className="text-slate-500">General</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">{t.assignedToName}</td>
                    <td className="py-3 px-4 font-mono">{t.deadline || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.priority === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : t.priority === "HIGH"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.status === "COMPLETED"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : t.status === "IN_PROGRESS"
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{t.progressPct}%</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingTask(t)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Edit2 className="w-3 h-3" /> Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            queryClient.invalidateQueries({ queryKey: ["tasks-list"] });
          }}
        />
      )}

      {/* Update Task Status Modal */}
      {editingTask && (
        <UpdateTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null);
            queryClient.invalidateQueries({ queryKey: ["tasks-list"] });
          }}
        />
      )}
    </div>
  );
}
