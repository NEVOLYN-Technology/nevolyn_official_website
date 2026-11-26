"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workLogsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Calendar, Clock } from "lucide-react";
import { SubmitWorkLogModal } from "@/components/work-logs";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Work Logs & Progress</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isAdmin ? "Chronological registry of all staff operational logs and daily outputs." : "Submit your daily operational accomplishments and next-day plans."}
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4 text-emerald-400" /> Submit Work Log
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading daily logs...</div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200/90 shadow-xs">
            No work logs recorded yet.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <EmployeeAvatar
                    user={{ fullName: log.fullName, employeeId: log.employeeId }}
                    size="sm"
                    shape="circle"
                  />
                  <span className="font-bold text-slate-900 text-sm">{log.fullName}</span>
                  <span className="text-[10px] font-mono text-teal-800 font-bold px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200">
                    {log.employeeId}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 font-mono font-semibold">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {log.logDate}</span>
                  <span className="flex items-center gap-1 text-emerald-700"><Clock className="w-3.5 h-3.5 text-emerald-600" /> {log.timeSpentHours} hrs</span>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">Tasks Accomplished</span>
                  <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-line">{log.workCompleted}</p>
                </div>
                {log.issues && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block mb-0.5">Blockers & Challenges</span>
                    <p className="text-amber-900 font-medium leading-relaxed">{log.issues}</p>
                  </div>
                )}
                {log.nextAction && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block mb-0.5">Next Day Plan</span>
                    <p className="text-teal-900 font-medium leading-relaxed">{log.nextAction}</p>
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
