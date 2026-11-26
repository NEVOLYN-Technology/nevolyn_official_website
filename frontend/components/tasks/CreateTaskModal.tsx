"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { tasksApi, projectsApi, usersApi, getApiErrorMessage } from "@/lib/api";
import { TASK_PRIORITIES } from "@/lib/constants";
import { X } from "lucide-react";

/**
 * Props for the {@link CreateTaskModal} component.
 */
interface CreateTaskModalProps {
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired upon successful task creation. */
  onSuccess: () => void;
}

/**
 * Modal dialog for assigning work tasks to employees under active R&D projects.
 */
export function CreateTaskModal({ onClose, onSuccess }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    projectId: undefined as number | undefined,
    title: "",
    description: "",
    assignedToId: undefined as number | undefined,
    startDate: new Date().toISOString().split("T")[0],
    deadline: "",
    priority: "MEDIUM",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const { data: projects } = useQuery({
    queryKey: ["projects-dropdown"],
    queryFn: async () => {
      const res = await projectsApi.getAll();
      return res.data.filter((p) => p.status !== "COMPLETED");
    },
  });

  const { data: employees } = useQuery({
    queryKey: ["employees-dropdown"],
    queryFn: async () => {
      const res = await usersApi.getActiveEmployees();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!formData.assignedToId) throw new Error("Please select an employee assignee.");
      return tasksApi.create({ ...formData, assignedToId: formData.assignedToId! });
    },
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => setErrorMsg(getApiErrorMessage(err, "Failed to delegate task")),
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Delegate New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="col-span-2">
            <label className="block text-slate-600 font-bold mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Project Link (Optional)</label>
            <select
              value={formData.projectId || ""}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            >
              <option value="">No Project (General Task)</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Assignee (Employee) *</label>
            <select
              value={formData.assignedToId || ""}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            >
              <option value="">Select Assignee...</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            >
              {TASK_PRIORITIES.filter((p) => p.value !== "ALL").map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-600 font-bold mb-1">Task Instructions / Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
            Cancel
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15"
          >
            {createMutation.isPending ? "Assigning..." : "Assign Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
