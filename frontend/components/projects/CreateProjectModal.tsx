"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { projectsApi, usersApi, getApiErrorMessage } from "@/lib/api";
import { X } from "lucide-react";

/**
 * Props for the {@link CreateProjectModal} component.
 */
interface CreateProjectModalProps {
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired upon successful project creation. */
  onSuccess: () => void;
}

/**
 * Modal dialog for initiating new Research & Development projects with code, lead engineer, and schedule dates.
 */
export function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    objective: "",
    description: "",
    responsibleId: undefined as number | undefined,
    startDate: new Date().toISOString().split("T")[0],
    targetDate: "",
    status: "PENDING",
    remarks: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const { data: employees } = useQuery({
    queryKey: ["active-employees-select"],
    queryFn: async () => {
      const res = await usersApi.getActiveEmployees();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => projectsApi.create(formData),
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => {
      setErrorMsg(getApiErrorMessage(err, "Failed to create project"));
    },
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Initiate New R&D Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Project Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. PRJ-TX-01"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono uppercase focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Responsible Lead</label>
            <select
              value={formData.responsibleId || ""}
              onChange={(e) => setFormData({ ...formData, responsibleId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            >
              <option value="">Select an employee...</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-slate-600 mb-1 font-bold">Project Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. High-Tenacity Recycled Filament Development"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-600 mb-1 font-bold">Core Objective</label>
            <textarea
              rows={2}
              placeholder="Key goal, technical targets, or commercial intent..."
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Target Date</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
            Cancel
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15"
          >
            {createMutation.isPending ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
