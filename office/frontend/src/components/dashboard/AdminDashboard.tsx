"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import NextLink from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  Building2,
  UserX,
  FlaskConical,
  CheckSquare,
  Trophy,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "./StatCard";

/**
 * Executive administrator dashboard component.
 *
 * <p>Presents high-level organizational KPIs: headcount, present/absent/late workforce counts,
 * active in-house personnel, active R&D projects, and task backlogs.
 * Automatically polls every 30 seconds for live updates.</p>
 */
export function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await dashboardApi.getAdmin();
      return res.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load admin dashboard metrics.</span>
      </div>
    );
  }

  const kpis = [
    { title: "Total Employees", value: data.totalEmployees, icon: Users, color: "from-blue-500 to-indigo-600", link: "/employees" },
    { title: "Present Today", value: data.presentToday, icon: UserCheck, color: "from-emerald-500 to-teal-600", link: "/attendance/admin" },
    { title: "Late Check-Ins", value: data.lateToday, icon: Clock, color: "from-amber-500 to-orange-600", link: "/attendance/admin" },
    { title: "Currently In-House", value: data.currentlyInside, icon: Building2, color: "from-cyan-500 to-blue-600", link: "/attendance/admin" },
    { title: "Absent Today", value: data.absentToday, icon: UserX, color: "from-rose-500 to-red-600", link: "/attendance/admin" },
    { title: "Active R&D Projects", value: data.activeProjects, icon: FlaskConical, color: "from-violet-500 to-purple-600", link: "/projects" },
    { title: "Pending Tasks", value: data.pendingTasks, icon: CheckSquare, color: "from-amber-500 to-yellow-600", link: "/tasks" },
    { title: "Completed Tasks", value: data.completedTasks, icon: Trophy, color: "from-emerald-500 to-green-600", link: "/tasks" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Actions with Signature Classic Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border-t-4 border-red-500 border-x border-b border-[#374151] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span className="text-red-500 text-xl">⚡</span>
            <span>Master Control Dashboard</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider">
              Live Monitor
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Nevolyn Office Management &bull; Department of Research & Development &bull; Real-time Operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NextLink
            href="/attendance/qr"
            className="px-4 py-2.5 rounded-xl bg-[#1f2937] border border-[#374151] text-slate-200 text-xs font-bold hover:bg-slate-700 transition shadow-sm flex items-center gap-2"
          >
            <span>📱</span> Entrance QR
          </NextLink>
          <NextLink
            href="/employees"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/30 transition flex items-center gap-2"
          >
            <span>➕</span> Manage Staff
          </NextLink>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
            link={kpi.link}
          />
        ))}
      </div>

      {/* Tables Section: Live Attendance & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Roster (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111827] border border-[#374151] shadow-xl">
          <div className="flex items-center justify-between mb-5 border-b border-[#374151] pb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>📋</span>
                <span>Today&apos;s Staff Presence</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">All registered active employees and their check-in status</p>
            </div>
            <NextLink href="/attendance/admin" className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1">
              Full Attendance Monitor →
            </NextLink>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#374151]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1f2937] text-slate-300 uppercase border-b border-[#374151] text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Employee</th>
                  <th className="py-3 px-3.5">Check-In</th>
                  <th className="py-3 px-3.5">Check-Out</th>
                  <th className="py-3 px-3.5">Hours</th>
                  <th className="py-3 px-3.5">Punctuality</th>
                  <th className="py-3 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#374151]">
                {data.todayAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                      No employee attendance records found for today.
                    </td>
                  </tr>
                ) : (
                  data.todayAttendance.map((rec) => (
                    <tr key={rec.userId} className="hover:bg-[#1f2937] transition duration-150">
                      <td className="py-3 px-3.5 font-medium text-white">
                        <div>{rec.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rec.employeeId}</div>
                      </td>
                      <td className="py-3 px-3.5 font-mono">{rec.checkInTime || "—"}</td>
                      <td className="py-3 px-3.5 font-mono">{rec.checkOutTime || "—"}</td>
                      <td className="py-3 px-3.5 font-mono font-bold text-emerald-400">{rec.totalHours ? `${rec.totalHours}h` : "—"}</td>
                      <td className="py-3 px-3.5">
                        {rec.lateStatus === "Late" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
                            Late
                          </span>
                        ) : rec.lateStatus === "On Time" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            On Time
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        {rec.status === "Present" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30 text-[10px] font-bold">
                            Present
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#1f2937] text-slate-400 border border-[#374151] text-[10px] font-bold">
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Audit Stream (1 Col) */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#374151] shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-[#374151] pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Recent Activity</span>
            </h2>
            <NextLink href="/audit" className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline">
              All Logs →
            </NextLink>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {data.recentAuditLogs.slice(0, 8).map((audit) => (
              <div key={audit.id} className="p-3.5 rounded-xl bg-[#1f2937] border border-[#374151] text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-red-400">{audit.username}</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(audit.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-slate-200 line-clamp-2">{audit.details || audit.action}</p>
                <div className="mt-1.5 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  <span>IP: {audit.ipAddress || "Local"}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-300">{audit.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
