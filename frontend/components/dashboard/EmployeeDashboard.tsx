"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi, attendanceApi } from "@/lib/api";
import NextLink from "next/link";
import { CheckSquare, FlaskConical } from "lucide-react";

/**
 * Props for the {@link EmployeeDashboard} component.
 */
interface EmployeeDashboardProps {
  /** Username of the authenticated employee. */
  username: string;
}

/**
 * Employee workspace dashboard component.
 *
 * <p>Displays time-of-day greeting, interactive check-in/out attendance controls,
 * urgent assigned task queue, responsible projects, and recent submitted work logs.</p>
 */
export function EmployeeDashboard({ username }: EmployeeDashboardProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["employee-dashboard", username],
    queryFn: async () => {
      const res = await dashboardApi.getEmployee();
      return res.data;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => attendanceApi.checkOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-800 rounded-xl" />
        <div className="h-44 bg-slate-900 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
        Failed to load employee dashboard.
      </div>
    );
  }

  const att = data.todayAttendance;
  const hasCheckedIn = !!att?.checkInTime;
  const hasCheckedOut = !!att?.checkOutTime;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Greeting Banner with Signature Red Top Accent */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#111827] border-t-4 border-red-500 border-x border-b border-[#374151] shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{data.greeting}, {data.fullName}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              {data.designation || "R&D Staff Member"} &bull; Employee ID:{" "}
              <span className="font-mono text-red-400 font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                {data.employeeId}
              </span>
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Daily Schedule</span>
            <span className="text-xs text-emerald-400 font-medium">Standard Shift 09:00 - 17:00</span>
          </div>
        </div>
      </div>

      {/* Prominent Daily Attendance Station */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#111827] border border-[#374151] shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#374151] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>⏱️</span>
              <span>Daily Attendance Station</span>
            </span>
          </div>
          <div>
            {hasCheckedIn ? (
              hasCheckedOut ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  COMPLETED TODAY
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 animate-pulse">
                  IN HOUSE (ACTIVE)
                </span>
              )
            ) : (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                NOT CHECKED IN
              </span>
            )}
          </div>
        </div>

        {/* 3 Metric Stat Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#1f2937] border border-[#374151] text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Checked In</span>
            <span className="text-xl font-extrabold text-white font-mono mt-1 block">
              {att?.checkInTime || "—"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#1f2937] border border-[#374151] text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Checked Out</span>
            <span className="text-xl font-extrabold text-white font-mono mt-1 block">
              {att?.checkOutTime || "—"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#1f2937] border border-[#374151] text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Logged Hours</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono mt-1 block">
              {att?.totalHours ? `${att.totalHours} hrs` : "0.00 hrs"}
            </span>
          </div>
        </div>

        {/* Big Action Buttons */}
        <div>
          {!hasCheckedIn ? (
            <button
              onClick={() => checkInMutation.mutate()}
              disabled={checkInMutation.isPending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-600/30 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {checkInMutation.isPending ? "REGISTERING PUNCH..." : "🟢 CHECK IN NOW"}
            </button>
          ) : !hasCheckedOut ? (
            <button
              onClick={() => checkOutMutation.mutate()}
              disabled={checkOutMutation.isPending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-amber-600/30 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {checkOutMutation.isPending ? "REGISTERING CHECK-OUT..." : "🔴 CHECK OUT NOW"}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-emerald-300 font-bold text-sm">
              ✅ Attendance Completed for Today &bull;{" "}
              <NextLink href="/office/attendance/history" className="underline hover:text-white ml-1">
                View Full History →
              </NextLink>
            </div>
          )}
        </div>
      </div>

      {/* 4 Interactive Quick Action Tiles (Classic Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NextLink
          href="/office/tasks"
          className="p-5 rounded-2xl bg-[#111827] border border-[#374151] hover:border-slate-500 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden action-tile-top-red flex flex-col justify-between h-32 group"
        >
          <div>
            <span className="text-xl">📋</span>
            <h3 className="font-extrabold text-white text-base mt-2 group-hover:text-red-400 transition-colors">My Tasks</h3>
            <p className="text-xs text-slate-400 mt-0.5">{data.myTasks.length} Assigned Items</p>
          </div>
          <span className="text-xs text-red-400 font-bold self-end flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Open →
          </span>
        </NextLink>

        <NextLink
          href="/office/work-logs"
          className="p-5 rounded-2xl bg-[#111827] border border-[#374151] hover:border-slate-500 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden action-tile-top-warning flex flex-col justify-between h-32 group"
        >
          <div>
            <span className="text-xl">✍️</span>
            <h3 className="font-extrabold text-white text-base mt-2 group-hover:text-amber-400 transition-colors">Daily Log</h3>
            <p className="text-xs text-slate-400 mt-0.5">Submit Work Summary</p>
          </div>
          <span className="text-xs text-amber-400 font-bold self-end flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Log Now →
          </span>
        </NextLink>

        <NextLink
          href="/office/projects"
          className="p-5 rounded-2xl bg-[#111827] border border-[#374151] hover:border-slate-500 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden action-tile-top-blue flex flex-col justify-between h-32 group"
        >
          <div>
            <span className="text-xl">🔬</span>
            <h3 className="font-extrabold text-white text-base mt-2 group-hover:text-sky-400 transition-colors">R&D Projects</h3>
            <p className="text-xs text-slate-400 mt-0.5">{data.myProjects.length} Lead Initiatives</p>
          </div>
          <span className="text-xs text-sky-400 font-bold self-end flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Explore →
          </span>
        </NextLink>

        <NextLink
          href="/office/attendance/history"
          className="p-5 rounded-2xl bg-[#111827] border border-[#374151] hover:border-slate-500 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden action-tile-top-green flex flex-col justify-between h-32 group"
        >
          <div>
            <span className="text-xl">📅</span>
            <h3 className="font-extrabold text-white text-base mt-2 group-hover:text-emerald-400 transition-colors">History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Punctuality & Records</p>
          </div>
          <span className="text-xs text-emerald-400 font-bold self-end flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Audit →
          </span>
        </NextLink>
      </div>

      {/* Grid: Tasks & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Active Tasks */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              <span>Assigned Tasks</span>
            </h2>
            <NextLink href="/office/tasks" className="text-xs text-cyan-400 hover:underline">
              View All Tasks →
            </NextLink>
          </div>

          <div className="space-y-3">
            {data.myTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active tasks assigned to you right now.</p>
            ) : (
              data.myTasks.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-white">{t.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {t.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Deadline: {t.deadline || "No deadline"}</span>
                    <span>{t.progressPct}% done</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Projects */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Responsible Projects</span>
            </h2>
            <NextLink href="/office/projects" className="text-xs text-cyan-400 hover:underline">
              All Projects →
            </NextLink>
          </div>

          <div className="space-y-3">
            {data.myProjects.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No projects where you are the lead responsible.</p>
            ) : (
              data.myProjects.map((p) => (
                <NextLink
                  key={p.id}
                  href={`/office/projects/${p.id}`}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 block hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{p.code}</span>
                    <span className="text-[10px] text-slate-400">{p.status}</span>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1">{p.name}</p>
                  <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
                    <span>Target: {p.targetDate || "N/A"}</span>
                    <span>{p.progressPct}%</span>
                  </div>
                </NextLink>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
