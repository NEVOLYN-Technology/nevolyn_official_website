"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import NextLink from "next/link";
import { History, Clock, CheckCircle2, LogOut } from "lucide-react";

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
      queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => attendanceApi.checkOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-history"] });
      queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
    },
  });

  const hasCheckedIn = !!today?.checkInTime;
  const hasCheckedOut = !!today?.checkOutTime;

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-teal-600" />
            <span>Daily Attendance Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Authorized R&amp;D network check-in and personal punctuality records.
          </p>
        </div>
        <NextLink
          href="/office/attendance/history"
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold shadow-2xs inline-flex items-center gap-2 transition"
        >
          <History className="w-3.5 h-3.5 text-teal-600" />
          <span>Full History Archive</span>
        </NextLink>
      </div>

      {/* Today's Attendance Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.06)] relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-teal-600 to-emerald-600 absolute top-0 left-0" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-teal-700 uppercase tracking-widest block">
              Today: {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
            <div className="flex items-center gap-6 flex-wrap pt-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Check-In</span>
                <span className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5 block">
                  {today?.checkInTime || "--:--"}
                </span>
                {today?.lateStatus && (
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 border ${
                      today.lateStatus === "Late"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {today.lateStatus}
                  </span>
                )}
              </div>
              <div className="w-px h-12 bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Check-Out</span>
                <span className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5 block">
                  {today?.checkOutTime || "--:--"}
                </span>
                {today?.earlyCheckout && (
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 border ${
                      today.earlyCheckout === "Yes"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {today.earlyCheckout === "Yes" ? "Early" : "Standard"}
                  </span>
                )}
              </div>
              <div className="w-px h-12 bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Working Hours</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-700 mt-0.5 block">
                  {today?.totalHours ? `${today.totalHours} hrs` : "0.00 hrs"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => checkInMutation.mutate()}
              disabled={hasCheckedIn || checkInMutation.isPending}
              className={`px-6 py-3 rounded-2xl font-bold text-xs tracking-wide transition flex items-center gap-2 ${
                hasCheckedIn
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{hasCheckedIn ? "Checked In ✓" : "Check In (Arrival)"}</span>
            </button>
            <button
              onClick={() => checkOutMutation.mutate()}
              disabled={!hasCheckedIn || hasCheckedOut || checkOutMutation.isPending}
              className={`px-6 py-3 rounded-2xl font-bold text-xs tracking-wide transition flex items-center gap-2 ${
                !hasCheckedIn || hasCheckedOut
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-md shadow-slate-900/20 cursor-pointer"
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>{hasCheckedOut ? "Checked Out ✓" : "Check Out (Departure)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <span>Recent Attendance Records</span>
          </h2>
          <NextLink href="/office/attendance/history" className="text-xs font-bold text-teal-700 hover:underline">
            Full History Archive →
          </NextLink>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Punctuality</th>
                <th className="py-3 px-4">Early Checkout</th>
                <th className="py-3 px-4">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-mono">
              {!history || history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans font-medium">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                history.slice(0, 10).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">{r.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{r.checkInTime || "—"}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{r.checkOutTime || "—"}</td>
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
                        {r.earlyCheckout}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">{r.totalHours ? `${r.totalHours}h` : "—"}</td>
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
