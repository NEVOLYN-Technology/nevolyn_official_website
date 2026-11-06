"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { trainingApi, getApiErrorMessage } from "@/lib/api";
import { X } from "lucide-react";

/**
 * Props for the {@link CreateSessionModal} component.
 */
interface CreateSessionModalProps {
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired when training session is recorded. */
  onSuccess: () => void;
}

/**
 * Modal dialog for logging internal workshops, client conferences, and project reviews.
 */
export function CreateSessionModal({ onClose, onSuccess }: CreateSessionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "Training",
    sessionDate: new Date().toISOString().split("T")[0],
    trainerPresenter: "",
    participants: "",
    durationMinutes: 60,
    notes: "",
    outcome: "",
    remarks: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      if (!formData.title.trim()) throw new Error("Title is required.");
      return trainingApi.create(formData);
    },
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => setErrorMsg(getApiErrorMessage(err, "Failed to record session")),
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Record Training / Meeting</h2>
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
            <label className="block text-slate-400 mb-1">Session Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Synthetic Polymer Dyeing Techniques"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Session Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            >
              <option value="Training">Training</option>
              <option value="Meeting">Meeting</option>
              <option value="Technical Review">Technical Review</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Session Date</label>
            <input
              type="date"
              value={formData.sessionDate}
              onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Trainer / Presenter</label>
            <input
              type="text"
              placeholder="Name of presenter"
              value={formData.trainerPresenter}
              onChange={(e) => setFormData({ ...formData, trainerPresenter: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Duration (Minutes)</label>
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-400 mb-1">Attendees / Participants</label>
            <input
              type="text"
              placeholder="Comma-separated or list of participants"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-400 mb-1">Topics & Discussion Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-400 mb-1">Outcomes & Key Learnings</label>
            <textarea
              rows={2}
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
          >
            {mutation.isPending ? "Saving..." : "Record Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
