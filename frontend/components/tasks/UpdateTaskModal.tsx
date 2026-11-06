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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Update Task Status</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            >
              {TASK_STATUSES.filter((s) => s.value !== "ALL").map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Progress Percentage ({progressPct}%)</label>
            <input
              type="range"
              min={0}
              max={100}
              value={progressPct}
              onChange={(e) => setProgressPct(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Progress Notes / Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">
            Cancel
          </button>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
          >
            {updateMutation.isPending ? "Saving..." : "Save Progress"}
          </button>
        </div>
      </div>
    </div>
  );
}
