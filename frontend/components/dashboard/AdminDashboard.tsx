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
  QrCode,
  UserPlus,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

/**
 * Executive administrator dashboard component — Light Glassmorphism 2.0 Edition.
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
        <div className="h-24 bg-white/80 rounded-3xl border border-slate-200/80 shadow-xs" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white/80 rounded-2xl border border-slate-200/80 shadow-xs" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 text-rose-600" />
        <span className="font-semibold text-sm">Failed to load admin dashboard metrics.</span>
      </div>
    );
  }

  const kpis = [
    { title: "Total Employees", value: data.totalEmployees, icon: Users, color: "from-blue-500 to-indigo-600", link: "/office/employees" },
    { title: "Present Today", value: data.presentToday, icon: UserCheck, color: "from-emerald-500 to-teal-600", link: "/office/attendance/admin" },
    { title: "Late Check-Ins", value: data.lateToday, icon: Clock, color: "from-amber-500 to-orange-600", link: "/office/attendance/admin" },
    { title: "Currently In-House", value: data.currentlyInside, icon: Building2, color: "from-cyan-500 to-blue-600", link: "/office/attendance/admin" },
    { title: "Absent Today", value: data.absentToday, icon: UserX, color: "from-rose-500 to-red-600", link: "/office/attendance/admin" },
    { title: "Active R&D Projects", value: data.activeProjects, icon: FlaskConical, color: "from-violet-500 to-purple-600", link: "/office/projects" },
    { title: "Pending Tasks", value: data.pendingTasks, icon: CheckSquare, color: "from-amber-500 to-yellow-600", link: "/office/tasks" },
    { title: "Completed Tasks", value: data.completedTasks, icon: Trophy, color: "from-emerald-500 to-green-600", link: "/office/tasks" },
  ];

  return (
    <div className="space-y-7">
      {/* Executive Hero Header Card */}
      <div className="p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_32px_-10px_rgba(15,23,42,0.06)] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-teal-600 to-emerald-600 absolute top-0 left-0" />
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Executive Operations Center
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Monitor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            NEVOLYN Office Management &bull; Department of Research &amp; Development &bull; Real-time Workforce Telemetry
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <NextLink
            href="/office/attendance/qr"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition shadow-2xs flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-teal-600" />
            <span>Entrance QR</span>
          </NextLink>
          <NextLink
            href="/office/employees"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs font-bold hover:from-slate-800 hover:to-slate-700 shadow-md shadow-slate-900/15 transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Manage Staff</span>
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
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between mb-5 border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>📋</span>
                <span>Today&apos;s Staff Presence</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                All registered active employees and their real-time check-in status
              </p>
            </div>
            <NextLink
              href="/office/attendance/admin"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1"
            >
              Full Attendance Monitor →
            </NextLink>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/95 text-slate-600 uppercase border-b border-slate-200/80 text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Punctuality</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {data.todayAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No employee attendance records found for today.
                    </td>
                  </tr>
                ) : (
                  data.todayAttendance.map((rec) => (
                    <tr key={rec.userId} className="hover:bg-slate-50/80 transition duration-150">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <EmployeeAvatar
                            user={{ fullName: rec.fullName, employeeId: rec.employeeId }}
                            size="xs"
                            shape="circle"
                          />
                          <div>
                            <div>{rec.fullName}</div>
                            <div className="text-[10px] text-slate-500 font-mono font-normal">
                              {rec.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {rec.checkInTime || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {rec.checkOutTime || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                        {rec.totalHours ? `${rec.totalHours}h` : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {rec.lateStatus === "Late" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            Late
                          </span>
                        ) : rec.lateStatus === "On Time" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            On Time
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {rec.status === "Present" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold">
                            Present
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
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
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.06)] flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/80 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              <span>Recent Activity</span>
            </h2>
            <NextLink
              href="/office/audit"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
            >
              All Logs →
            </NextLink>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {data.recentAuditLogs.slice(0, 8).map((audit) => (
              <div
                key={audit.id}
                className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 text-xs transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-extrabold text-slate-900">{audit.username}</span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {new Date(audit.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-slate-700 font-medium line-clamp-2">
                  {audit.details || audit.action}
                </p>
                <div className="mt-1.5 text-[10px] text-slate-500 font-mono flex items-center gap-2">
                  <span>IP: {audit.ipAddress || "Local"}</span>
                  <span>•</span>
                  <span className="font-bold text-slate-700">{audit.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
