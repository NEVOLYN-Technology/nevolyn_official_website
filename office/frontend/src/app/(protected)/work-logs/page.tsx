"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workLogsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Calendar, Clock } from "lucide-react";
import { SubmitWorkLogModal } from "@/components/work-logs";

/**
 * WorkLogsPage component.
 *
 * Displays a chronological feed of daily employee activity reports, hours logged,
 * key accomplishments, roadblocks, and next-day agendas. Provides employee
 * submission workflows and admin visibility.
 *
 * @returns {React.ReactElement} The rendered work logs feed and submission interface.
 */
export default function WorkLogsPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["work-logs-list"],
    queryFn: async () => {
      const res = await workLogsApi.getAll();
      return res.data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Daily Work Logs & Progress</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin ? "Chronological registry of all staff operational logs and daily outputs." : "Submit your daily operational accomplishments and next-day plans."}
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Submit Work Log
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading daily logs...</div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
            No work logs recorded yet.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm">{log.fullName}</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {log.employeeId}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {log.logDate}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-400" /> {log.timeSpentHours} hrs</span>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Tasks Accomplished</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">{log.workCompleted}</p>
                </div>
                {log.issues && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-amber-500/80 block mb-0.5">Blockers & Challenges</span>
                    <p className="text-amber-200/90 leading-relaxed">{log.issues}</p>
                  </div>
                )}
                {log.nextAction && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-500/80 block mb-0.5">Next Day Plan</span>
                    <p className="text-cyan-200/90 leading-relaxed">{log.nextAction}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isSubmitOpen && (
        <SubmitWorkLogModal
          onClose={() => setIsSubmitOpen(false)}
          onSuccess={() => {
            setIsSubmitOpen(false);
            queryClient.invalidateQueries({ queryKey: ["work-logs-list"] });
          }}
        />
      )}
    </div>
  );
}
