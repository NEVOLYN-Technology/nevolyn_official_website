"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { tasksApi, getApiErrorMessage } from "@/lib/api";
import { Task } from "@/types";
import { TASK_STATUSES } from "@/lib/constants";
import { X } from "lucide-react";

/**
 * Props for the {@link UpdateTaskModal} component.
 */
interface UpdateTaskModalProps {
  /** Target task entity being updated. */
  task: Task;
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired when task updates are persisted. */
  onSuccess: () => void;
}

/**
 * Modal dialog for updating task execution state (Pending, In Progress, Completed), progress %, and notes.
 */
export function UpdateTaskModal({ task, onClose, onSuccess }: UpdateTaskModalProps) {
  const [status, setStatus] = useState(task.status || "PENDING");
  const [progressPct, setProgressPct] = useState(task.progressPct || 0);
  const [remarks, setRemarks] = useState(task.remarks || "");
  const [errorMsg, setErrorMsg] = useState("");

  const updateMutation = useMutation({
    mutationFn: () => tasksApi.update(task.id, { status, progressPct, remarks }),
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => setErrorMsg(getApiErrorMessage(err, "Failed to update task")),
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Update Task Status</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            >
              {TASK_STATUSES.filter((s) => s.value !== "ALL").map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Progress Percentage ({progressPct}%)</label>
            <input
              type="range"
              min={0}
              max={100}
              value={progressPct}
              onChange={(e) => setProgressPct(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Progress Notes / Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
            Cancel
          </button>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15"
          >
            {updateMutation.isPending ? "Saving..." : "Save Progress"}
          </button>
        </div>
      </div>
    </div>
  );
}
