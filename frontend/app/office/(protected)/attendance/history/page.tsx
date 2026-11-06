"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Employee historical attendance archive page.
 *
 * <p>Presents a tabular historical ledger of all previous check-ins, check-outs,
 * punctuality markers, and calculated duration hours.</p>
 */
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
          <NextLink href="/attendance" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Attendance Station
          </NextLink>
          <h1 className="text-2xl font-bold text-white tracking-tight">Full Attendance Log Archive</h1>
          <p className="text-xs text-slate-400 mt-1">Complete historical record of all your check-ins and working hours.</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Total Hours</th>
                <th className="py-3 px-4">Punctuality</th>
                <th className="py-3 px-4">Early Departure</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    Loading records...
                  </td>
                </tr>
              ) : !records || records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-bold text-white font-sans">{r.date}</td>
                    <td className="py-3 px-4">{r.checkInTime || "--:--"}</td>
                    <td className="py-3 px-4">{r.checkOutTime || "--:--"}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{r.totalHours ? `${r.totalHours} hrs` : "-"}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.lateStatus === "Late" ? "bg-rose-500/15 text-rose-400 border border-rose-500/20" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {r.lateStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.earlyCheckout === "Yes" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "bg-slate-800 text-slate-400"
                      }`}>
                        {r.earlyCheckout === "Yes" ? "Early" : "Normal"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/20 text-[10px] font-semibold">
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
