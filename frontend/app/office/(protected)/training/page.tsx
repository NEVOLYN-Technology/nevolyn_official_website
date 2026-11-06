"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trainingApi } from "@/lib/api";
import { Plus } from "lucide-react";
import { CreateSessionModal } from "@/components/training";

/**
 * TrainingPage component.
 *
 * Renders the corporate and technical knowledge sharing catalogue:
 * - Filterable session cards by type (Training, Meeting, Technical Review).
 * - Detailed view of topics covered, trainer, date, attendee count, and action points.
 * - Interactive modal for recording new training sessions or team reviews.
 *
 * @returns {React.ReactElement} The rendered training and meetings directory.
 */
export default function TrainingPage() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["training-sessions"],
    queryFn: async () => {
      const res = await trainingApi.getAll();
      return res.data;
    },
  });

  const filteredSessions = (sessions || []).filter((s) => {
    if (typeFilter === "ALL") return true;
    return s.type === typeFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Training Sessions & Technical Meetings</h1>
          <p className="text-xs text-slate-400 mt-1">Knowledge sharing, technical workshops, and cross-departmental coordination.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Session Types</option>
            <option value="Training">Training</option>
            <option value="Meeting">Meeting</option>
            <option value="Technical Review">Technical Review</option>
          </select>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Record Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))
        ) : filteredSessions.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
            No training or meeting sessions recorded yet.
          </div>
        ) : (
          filteredSessions.map((s) => (
            <div key={s.id} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 font-semibold">
                    {s.type}
                  </span>
                  <h3 className="font-bold text-base text-white mt-1.5">{s.title}</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">{s.sessionDate}</span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                {s.trainerPresenter && (
                  <p><span className="text-slate-500">Trainer/Organizer:</span> {s.trainerPresenter}</p>
                )}
                {s.durationMinutes && (
                  <p><span className="text-slate-500">Duration:</span> {s.durationMinutes} mins</p>
                )}
                {s.participants && (
                  <p><span className="text-slate-500">Attendees:</span> {s.participants}</p>
                )}
                {s.notes && (
                  <p className="text-slate-300 pt-1 border-t border-slate-800/80">{s.notes}</p>
                )}
                {s.outcome && (
                  <p className="text-emerald-400 font-medium"><span className="text-slate-500">Outcome:</span> {s.outcome}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isScheduleOpen && (
        <CreateSessionModal
          onClose={() => setIsScheduleOpen(false)}
          onSuccess={() => {
            setIsScheduleOpen(false);
            queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
          }}
        />
      )}
    </div>
  );
}
