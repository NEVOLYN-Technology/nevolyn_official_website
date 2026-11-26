"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { experimentsApi, getApiErrorMessage } from "@/lib/api";
import { X } from "lucide-react";

/**
 * Props for the {@link AddExperimentModal} component.
 */
interface AddExperimentModalProps {
  /** Target parent project ID receiving the experiment record. */
  projectId: number;
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired when experiment is recorded. */
  onSuccess: () => void;
}

/**
 * Modal dialog for logging a scientific experiment, test protocol, and empirical findings.
 */
export function AddExperimentModal({ projectId, onClose, onSuccess }: AddExperimentModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    objective: "",
    procedure: "",
    result: "",
    observation: "",
    conclusion: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useMutation({
    mutationFn: () => experimentsApi.create(projectId, formData),
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => setErrorMsg(getApiErrorMessage(err, "Failed to record experiment")),
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Record R&D Experiment</h2>
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
            <label className="block text-slate-600 font-bold mb-1">Experiment Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Objective</label>
            <textarea
              rows={2}
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Procedure / Methodology</label>
            <textarea
              rows={2}
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Results & Conclusion</label>
            <textarea
              rows={2}
              value={formData.conclusion}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15"
          >
            {mutation.isPending ? "Saving..." : "Save Experiment"}
          </button>
        </div>
      </div>
    </div>
  );
}
