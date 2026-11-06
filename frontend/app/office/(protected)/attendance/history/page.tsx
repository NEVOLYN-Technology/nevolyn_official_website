"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import NextLink from "next/link";
import { ArrowLeft, History } from "lucide-react";

export default function AttendanceHistoryPage() {
  const { data: records, isLoading } = useQuery({
    queryKey: ["attendance-full-history"],
    queryFn: async () => {
      const res = await attendanceApi.getHistory();
      return res.data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <NextLink
            href="/office/attendance"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Attendance Station
          </NextLink>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-teal-600" />
            <span>Full Attendance Log Archive</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Complete historical record of all your check-ins and working hours.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)]">
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Total Hours</th>
                <th className="py-3.5 px-4">Punctuality</th>
                <th className="py-3.5 px-4">Early Departure</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans font-medium">
                    Loading records...
                  </td>
                </tr>
              ) : !records || records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans font-medium">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">{r.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{r.checkInTime || "--:--"}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{r.checkOutTime || "--:--"}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">{r.totalHours ? `${r.totalHours} hrs` : "—"}</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.lateStatus === "Late"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {r.lateStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.earlyCheckout === "Yes"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {r.earlyCheckout === "Yes" ? "Early" : "Normal"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
