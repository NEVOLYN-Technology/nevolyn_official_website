"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { developmentApi, getApiErrorMessage } from "@/lib/api";
import { X } from "lucide-react";

/**
 * Props for the {@link AddDevRecordModal} component.
 */
interface AddDevRecordModalProps {
  /** Target parent project ID receiving the development record. */
  projectId: number;
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired when development record is created. */
  onSuccess: () => void;
}

/**
 * Modal dialog for documenting product engineering milestones, versions, and stage progressions.
 */
export function AddDevRecordModal({ projectId, onClose, onSuccess }: AddDevRecordModalProps) {
  const [formData, setFormData] = useState({
    productName: "",
    stage: "Prototyping",
    version: "v1.0",
    result: "",
    issues: "",
    nextAction: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useMutation({
    mutationFn: () => developmentApi.create(projectId, formData),
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => setErrorMsg(getApiErrorMessage(err, "Failed to create development record")),
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Add Development Record</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="col-span-2">
            <label className="block text-slate-400 mb-1">Product / Formulation Name *</label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Stage</label>
            <input
              type="text"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Version</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-400 mb-1">Key Findings</label>
            <textarea
              rows={2}
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-400 mb-1">Next Action</label>
            <input
              type="text"
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
          >
            {mutation.isPending ? "Saving..." : "Save Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
