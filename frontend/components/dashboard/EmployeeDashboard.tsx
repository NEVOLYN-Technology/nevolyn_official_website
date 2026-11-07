"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import NextLink from "next/link";
import { CheckSquare, FlaskConical, FileText, Eye, Edit, KeyRound, ArrowLeft } from "lucide-react";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

/**
 * Props for the {@link EmployeeDashboard} component.
 */
interface EmployeeDashboardProps {
  /** Username of the authenticated employee or inspected personnel. */
  username: string;
  /** Whether an administrator is inspecting this personal dashboard. */
  isInspecting?: boolean;
  /** Callback to trigger profile/banking edit modal. */
  onEditProfile?: () => void;
  /** Callback to trigger password reset modal. */
  onResetPassword?: () => void;
  /** Callback to return to executive master dashboard. */
  onBackToOverview?: () => void;
}

/**
 * Employee workspace dashboard component — Light Glassmorphism 2.0 Edition.
 */
export function EmployeeDashboard({
  username,
  isInspecting = false,
  onEditProfile,
  onResetPassword,
  onBackToOverview,
}: EmployeeDashboardProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["employee-dashboard", username, isInspecting],
    queryFn: async () => {
      const res = await dashboardApi.getEmployee(isInspecting ? username : undefined);
      const raw = (res.data as unknown as { data?: typeof res.data })?.data ?? res.data;
      return raw;
    },
    enabled: !isInspecting || Boolean(username),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-24 bg-white/80 rounded-3xl border border-slate-200/80 shadow-xs" />
        <div className="h-48 bg-white/80 rounded-3xl border border-slate-200/80 shadow-xs" />
      </div>
    );
  }

  if (error || !data) {
    const errMsg =
      (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
      (error as { message?: string })?.message ||
      "Failed to load employee dashboard.";
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-sm flex items-center justify-between gap-4">
        <span>{errMsg}</span>
        <button
          onClick={() => refetch()}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer shrink-0"
        >
          Retry
        </button>
      </div>
    );
  }

  const myTasks = data.myTasks ?? [];
  const myProjects = data.myProjects ?? [];
  const myWorkLogs = data.myWorkLogs ?? [];

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      {/* Administrative Inspection Banner */}
      {isInspecting && (
        <div className="p-4 md:p-5 rounded-3xl bg-white border border-slate-200/90 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_8px_28px_-8px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/15 shrink-0">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>Inspecting Personnel Workspace:</span>
                <span className="text-teal-700">{data.fullName}</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                  @{username}
                </span>
              </p>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                Authorized administrative inspection mode. Review tasks, attendance status, and edit profile/banking records directly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-slate-900/15 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Profile &amp; Banking</span>
              </button>
            )}
            {onResetPassword && (
              <button
                onClick={onResetPassword}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition border border-slate-200/90 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset Password</span>
              </button>
            )}
            {onBackToOverview && (
              <button
                onClick={onBackToOverview}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition border border-slate-200/90 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Welcome Greeting Banner */}
      <div className="p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_32px_-10px_rgba(15,23,42,0.06)] relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-teal-600 to-emerald-600 absolute top-0 left-0" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <EmployeeAvatar
            user={{ fullName: data.fullName, username, employeeId: data.employeeId }}
            size="lg"
            shape="rounded"
          />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-teal-700 tracking-tight break-words leading-tight">
              {data.fullName}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 font-medium flex items-center gap-x-2 gap-y-1 flex-wrap">
              <span>{data.designation || "R&D Staff Member"}</span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="font-mono text-teal-800 font-bold px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[10px] sm:text-[11px] break-all">
                {data.employeeId}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 4 Interactive Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NextLink
          href="/office/tasks"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-300 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden action-tile-top-blue flex flex-col justify-between h-32 group"
        >
          <div>
            <span className="text-xl">📋</span>
            <h3 className="font-extrabold text-slate-900 text-base mt-2 group-hover:text-teal-700 transition-colors">
              My Tasks
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {myTasks.length} Assigned Items
            </p>
          </div>
          <span className="text-xs text-teal-700 font-bold self-end flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Open →
          </span>
        </NextLink>

        <NextLink
          href="/office/work-logs"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden action-tile-top-warning flex flex-col justify-between h-32 group"
        >
          <div>
            <span className="text-xl">✍️</span>
            <h3 className="font-extrabold text-slate-900 text-base mt-2 group-hover:text-amber-700 transition-colors">
              Daily Log
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Submit Work Summary
            </p>
          </div>
          <span className="text-xs text-amber-700 font-bold self-end flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Log Now →
          </span>
        </NextLink>

        <NextLink
          href="/office/projects"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden action-tile-top-red flex flex-col justify-between h-32 group"
        >
          <div>
            <span className="text-xl">🔬</span>
            <h3 className="font-extrabold text-slate-900 text-base mt-2 group-hover:text-slate-800 transition-colors">
              R&amp;D Projects
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {myProjects.length} Lead Initiatives
            </p>
          </div>
          <span className="text-xs text-slate-700 font-bold self-end flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Explore →
          </span>
        </NextLink>

        <NextLink
          href="/office/attendance"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden action-tile-top-green flex flex-col justify-between h-32 group"
        >
          <div>
            <span className="text-xl">⏱️</span>
            <h3 className="font-extrabold text-slate-900 text-base mt-2 group-hover:text-emerald-700 transition-colors">
              Attendance
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              My Records &amp; Status
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-bold self-end flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View →
          </span>
        </NextLink>
      </div>

      {/* Grid: Tasks & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* My Active Tasks */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/70 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-600" />
              <span>Assigned Tasks</span>
            </h2>
            <NextLink href="/office/tasks" className="text-xs font-bold text-teal-700 hover:underline">
              View All Tasks →
            </NextLink>
          </div>

          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-medium">
                No active tasks assigned right now.
              </p>
            ) : (
              myTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 hover:border-teal-200 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900">{t.title}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                      {t.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Deadline: {t.deadline || "No deadline"}</span>
                    <span className="font-bold text-emerald-700">{t.progressPct}% done</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Projects */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/70 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-slate-800" />
              <span>Responsible Projects</span>
            </h2>
            <NextLink href="/office/projects" className="text-xs font-bold text-slate-700 hover:underline">
              All Projects →
            </NextLink>
          </div>

          <div className="space-y-3">
            {myProjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-medium">
                No projects where this staff member is lead responsible.
              </p>
            ) : (
              myProjects.map((p) => (
                <NextLink
                  key={p.id}
                  href={`/office/projects/${p.id}`}
                  className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 block hover:border-slate-300 hover:bg-slate-100/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-teal-800 font-extrabold text-xs">
                      {p.code}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1">{p.name}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Target: {p.targetDate || "TBD"}</span>
                    <span className="font-bold text-teal-700">{p.progressPct}%</span>
                  </div>
                </NextLink>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Work Logs */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/95 ring-1 ring-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200/70 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Recent Work Logs</span>
          </h2>
          <NextLink href="/office/work-logs" className="text-xs font-bold text-emerald-600 hover:underline">
            All Work Logs →
          </NextLink>
        </div>

        {myWorkLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center font-medium">
            No work logs submitted recently.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myWorkLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-slate-700">{log.logDate}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                    {log.timeSpentHours} hrs
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium line-clamp-2">
                  {log.workCompleted}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
