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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Record Training / Meeting</h2>
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
            <label className="block text-slate-600 font-bold mb-1">Session Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Synthetic Polymer Dyeing Techniques"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Session Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            >
              <option value="Training">Training</option>
              <option value="Meeting">Meeting</option>
              <option value="Technical Review">Technical Review</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Session Date</label>
            <input
              type="date"
              value={formData.sessionDate}
              onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Trainer / Presenter</label>
            <input
              type="text"
              placeholder="Name of presenter"
              value={formData.trainerPresenter}
              onChange={(e) => setFormData({ ...formData, trainerPresenter: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Duration (Minutes)</label>
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-600 font-bold mb-1">Attendees / Participants</label>
            <input
              type="text"
              placeholder="Comma-separated or list of participants"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-600 font-bold mb-1">Topics & Discussion Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-600 font-bold mb-1">Outcomes & Key Learnings</label>
            <textarea
              rows={2}
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
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
            {mutation.isPending ? "Saving..." : "Record Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
