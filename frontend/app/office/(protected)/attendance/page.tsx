"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import NextLink from "next/link";
import { History } from "lucide-react";

/**
 * Employee personal attendance punch-clock page.
 *
 * <p>Enables staff to check in and check out, viewing today's calculated work hours,
 * late arrival indicators, and recent punch records.</p>
 */
export default function AttendancePage() {
  const queryClient = useQueryClient();

  const { data: today } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: async () => {
      const res = await attendanceApi.getToday();
      return res.data;
    },
  });

  const { data: history } = useQuery({
    queryKey: ["attendance-history"],
    queryFn: async () => {
      const res = await attendanceApi.getHistory();
      return res.data;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-history"] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => attendanceApi.checkOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-history"] });
    },
  });

  const hasCheckedIn = !!today?.checkInTime;
  const hasCheckedOut = !!today?.checkOutTime;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Daily Attendance Center</h1>
        <p className="text-sm text-slate-400 mt-1">
          Authorized R&D network check-in and personal punctuality records.
        </p>
      </div>

      {/* Today's Attendance Card */}
      <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest block">
              Today: {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
            <div className="flex items-center gap-6 mt-4">
              <div>
                <span className="text-xs text-slate-500 block">Check-In</span>
                <span className="text-xl font-bold font-mono text-white">{today?.checkInTime || "--:--"}</span>
                {today?.lateStatus && (
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                    today.lateStatus === "Late"
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {today.lateStatus}
                  </span>
                )}
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div>
                <span className="text-xs text-slate-500 block">Check-Out</span>
                <span className="text-xl font-bold font-mono text-white">{today?.checkOutTime || "--:--"}</span>
                {today?.earlyCheckout && (
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                    today.earlyCheckout === "Yes"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {today.earlyCheckout === "Yes" ? "Early" : "Standard"}
                  </span>
                )}
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div>
                <span className="text-xs text-slate-500 block">Total Working Hours</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {today?.totalHours ? `${today.totalHours} hrs` : "0.00 hrs"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => checkInMutation.mutate()}
              disabled={hasCheckedIn || checkInMutation.isPending}
              className={`px-6 py-3 rounded-2xl font-bold text-xs tracking-wide transition shadow-lg ${
                hasCheckedIn
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
              }`}
            >
              {hasCheckedIn ? "Checked In ✓" : "Check In (Arrival)"}
            </button>
            <button
              onClick={() => checkOutMutation.mutate()}
              disabled={!hasCheckedIn || hasCheckedOut || checkOutMutation.isPending}
              className={`px-6 py-3 rounded-2xl font-bold text-xs tracking-wide transition shadow-lg ${
                !hasCheckedIn || hasCheckedOut
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
              }`}
            >
              {hasCheckedOut ? "Checked Out ✓" : "Check Out (Departure)"}
            </button>
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Recent Attendance Records</span>
          </h2>
          <NextLink href="/attendance/history" className="text-xs text-cyan-400 hover:underline">
            Full History Archive →
          </NextLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Check-In</th>
                <th className="py-3 px-3">Check-Out</th>
                <th className="py-3 px-3">Punctuality</th>
                <th className="py-3 px-3">Early Checkout</th>
                <th className="py-3 px-3">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {!history || history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                history.slice(0, 10).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-3 font-semibold text-white font-sans">{r.date}</td>
                    <td className="py-3 px-3">{r.checkInTime || "-"}</td>
                    <td className="py-3 px-3">{r.checkOutTime || "-"}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.lateStatus === "Late" ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {r.lateStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.earlyCheckout === "Yes" ? "bg-amber-500/15 text-amber-400" : "bg-slate-800 text-slate-400"
                      }`}>
                        {r.earlyCheckout}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">{r.totalHours ? `${r.totalHours}h` : "-"}</td>
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
