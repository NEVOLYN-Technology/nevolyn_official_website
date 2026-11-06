"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import { AdminAttendanceRecord } from "@/types";
import { Calendar, Edit3 } from "lucide-react";
import { CorrectionModal } from "@/components/attendance";

/**
 * Administrative attendance supervision and manual correction page.
 *
 * <p>Renders full daily employee roster (present, late, early checkout, absent),
 * interactive date-picker filter, and launches the {@link CorrectionModal}.</p>
 */
export default function AdminAttendancePage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [editingRecord, setEditingRecord] = useState<AdminAttendanceRecord | null>(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ["admin-attendance-date", selectedDate],
    queryFn: async () => {
      const res = await attendanceApi.getAdminDaily(selectedDate);
      return res.data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Staff Attendance Control</h1>
          <p className="text-xs text-slate-400 mt-1">Review live daily attendance records and execute audit-backed corrections.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-white text-xs font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Late Status</th>
                <th className="py-3 px-4">Early Departure</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    Loading daily roster...
                  </td>
                </tr>
              ) : !records || records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No records found for {selectedDate}.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.userId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{r.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.employeeId} • {r.designation || "Staff"}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{r.checkInTime || "-"}</td>
                    <td className="py-3 px-4 font-mono">{r.checkOutTime || "-"}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                      {r.totalHours ? `${r.totalHours} hrs` : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {r.lateStatus === "Late" ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                          Late
                        </span>
                      ) : r.lateStatus === "On Time" ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          On Time
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {r.earlyCheckout === "Yes" ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                          Early
                        </span>
                      ) : r.earlyCheckout === "No" ? (
                        <span className="text-slate-400 font-mono text-[10px]">No</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        r.status === "Present"
                          ? "bg-teal-500/15 text-teal-400 border-teal-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingRecord(r)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3 h-3" /> Correct
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {editingRecord && (
        <CorrectionModal
          record={editingRecord}
          date={selectedDate}
          onClose={() => setEditingRecord(null)}
          onSuccess={() => {
            setEditingRecord(null);
            queryClient.invalidateQueries({ queryKey: ["admin-attendance-date", selectedDate] });
          }}
        />
      )}
    </div>
  );
}
