"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import { AdminAttendanceRecord } from "@/types";
import { Calendar, Edit3 } from "lucide-react";
import { CorrectionModal } from "@/components/attendance";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Attendance Control</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Review live daily attendance records and execute audit-backed corrections.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-white border border-slate-300 px-3.5 py-2 rounded-xl shadow-2xs">
          <Calendar className="w-4 h-4 text-teal-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-slate-900 text-xs font-mono font-bold focus:outline-none border-none"
          />
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)]">
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Hours</th>
                <th className="py-3.5 px-4">Late Status</th>
                <th className="py-3.5 px-4">Early Departure</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans font-medium">
                    Loading daily roster...
                  </td>
                </tr>
              ) : !records || records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans font-medium">
                    No records found for {selectedDate}.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.userId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar
                          user={{ fullName: r.fullName, employeeId: r.employeeId }}
                          size="xs"
                          shape="circle"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{r.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {r.employeeId} &bull; {r.designation || "Staff"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{r.checkInTime || "—"}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{r.checkOutTime || "—"}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {r.totalHours ? `${r.totalHours} hrs` : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {r.lateStatus === "Late" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                          Late
                        </span>
                      ) : r.lateStatus === "On Time" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          On Time
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {r.earlyCheckout === "Yes" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          Early
                        </span>
                      ) : r.earlyCheckout === "No" ? (
                        <span className="text-slate-600 font-mono text-[10px] font-semibold">No</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.status === "Present"
                            ? "bg-teal-50 text-teal-800 border-teal-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingRecord(r)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3 h-3 text-emerald-400" /> Correct
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
