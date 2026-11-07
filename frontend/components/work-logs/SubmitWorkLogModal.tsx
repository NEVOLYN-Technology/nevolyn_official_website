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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Submit Daily Work Log</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        {errorMsg && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{errorMsg}</div>}

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Log Date</label>
              <input
                type="date"
                value={formData.logDate}
                onChange={(e) => setFormData({ ...formData, logDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Hours Spent</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.timeSpentHours}
                onChange={(e) => setFormData({ ...formData, timeSpentHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Tasks Completed Today *</label>
            <textarea
              rows={3}
              required
              placeholder="Detail specific tasks, experiments run, data analyzed..."
              value={formData.workCompleted}
              onChange={(e) => setFormData({ ...formData, workCompleted: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Blockers / Challenges Encountered</label>
            <textarea
              rows={2}
              placeholder="Any technical obstacles, supply constraints, machine downtime..."
              value={formData.issues}
              onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Next Day Plan</label>
            <textarea
              rows={2}
              placeholder="Key objectives planned for tomorrow..."
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">Cancel</button>
          <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15">
            {submitMutation.isPending ? "Submitting..." : "Submit Log"}
          </button>
        </div>
      </div>
    </div>
  );
}
