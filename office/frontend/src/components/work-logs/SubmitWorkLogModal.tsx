"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { workLogsApi, getApiErrorMessage } from "@/lib/api";
import { X } from "lucide-react";

/**
 * Props for the {@link SubmitWorkLogModal} component.
 */
interface SubmitWorkLogModalProps {
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired when daily work log is submitted. */
  onSuccess: () => void;
}

/**
 * Modal dialog for authoring and submitting daily work accomplishments, hours, blockers, and next steps.
 */
export function SubmitWorkLogModal({ onClose, onSuccess }: SubmitWorkLogModalProps) {
  const [formData, setFormData] = useState({
    logDate: new Date().toISOString().split("T")[0],
    workCompleted: "",
    timeSpentHours: 8,
    issues: "",
    nextAction: "",
    remarks: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!formData.workCompleted.trim()) throw new Error("Please summarize work completed today.");
      return workLogsApi.create(formData);
    },
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => setErrorMsg(getApiErrorMessage(err, "Failed to submit work log")),
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Submit Daily Work Log</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{errorMsg}</div>}

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Log Date</label>
              <input
                type="date"
                value={formData.logDate}
                onChange={(e) => setFormData({ ...formData, logDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Hours Spent</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.timeSpentHours}
                onChange={(e) => setFormData({ ...formData, timeSpentHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Tasks Completed Today *</label>
            <textarea
              rows={3}
              required
              placeholder="Detail specific tasks, experiments run, data analyzed..."
              value={formData.workCompleted}
              onChange={(e) => setFormData({ ...formData, workCompleted: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Blockers / Challenges Encountered</label>
            <textarea
              rows={2}
              placeholder="Any technical obstacles, supply constraints, machine downtime..."
              value={formData.issues}
              onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Next Day Plan</label>
            <textarea
              rows={2}
              placeholder="Key objectives planned for tomorrow..."
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
          <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">
            {submitMutation.isPending ? "Submitting..." : "Submit Log"}
          </button>
        </div>
      </div>
    </div>
  );
}
