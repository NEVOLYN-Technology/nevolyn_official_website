"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";
import { Calendar, CheckSquare, FlaskConical } from "lucide-react";

/**
 * ReportsPage component.
 *
 * Provides high-level operational intelligence and executive reporting across:
 * - Summary KPI cards (active staff, projects, task completion, ongoing experiments).
 * - Tabular views for monthly attendance audits by employee.
 * - Task delivery distribution across stages and priorities.
 * - R&D portfolio pipeline metrics with milestone completion ratios.
 *
 * @returns {React.ReactElement} The rendered enterprise analytics and reports dashboard.
 */
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"attendance" | "tasks" | "rnd">("attendance");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  const { data: summary } = useQuery({
    queryKey: ["reports-summary"],
    queryFn: async () => {
      const res = await reportsApi.getSummary();
      return res.data;
    },
  });

  const { data: attReport, isLoading: loadingAtt } = useQuery({
    queryKey: ["reports-attendance", selectedMonth],
    queryFn: async () => {
      const res = await reportsApi.getMonthlyAttendance(selectedMonth);
      return res.data;
    },
    enabled: activeTab === "attendance",
  });

  const { data: tasksReport, isLoading: loadingTasks } = useQuery({
    queryKey: ["reports-tasks"],
    queryFn: async () => {
      const res = await reportsApi.getTasks();
      return res.data;
    },
    enabled: activeTab === "tasks",
  });

  const { data: rndReport, isLoading: loadingRnd } = useQuery({
    queryKey: ["reports-rnd"],
    queryFn: async () => {
      const res = await reportsApi.getRnd();
      return res.data;
    },
    enabled: activeTab === "rnd",
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Analytics & Reports</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Aggregated operational intelligence across attendance, task delivery, and R&D pipelines.</p>
      </div>

      {/* Summary KPI Highlights */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Active Staff</span>
            <span className="text-xl font-extrabold text-slate-900">{summary.totalEmployees}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Active Projects</span>
            <span className="text-xl font-extrabold text-teal-700">{summary.activeProjects}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Total Tasks</span>
            <span className="text-xl font-extrabold text-slate-900">{summary.totalTasks}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Completed</span>
            <span className="text-xl font-extrabold text-emerald-700">{summary.completedTasks}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Experiments</span>
            <span className="text-xl font-extrabold text-teal-700">{summary.totalExperiments}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Trainings</span>
            <span className="text-xl font-extrabold text-amber-700">{summary.totalTrainings}</span>
          </div>
        </div>
      )}

      {/* Report Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "attendance" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4" /> Monthly Attendance
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "tasks" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900"
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Tasks Distribution
        </button>
        <button
          onClick={() => setActiveTab("rnd")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "rnd" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900"
          }`}
        >
          <FlaskConical className="w-4 h-4" /> R&D Portfolio Metrics
        </button>
      </div>

      {/* Tab 1: Monthly Attendance */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-bold">Select Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:border-slate-900 shadow-xs"
              />
              {attReport && (
                <span className="text-xs text-slate-500 font-mono">
                  Elapsed Work Days: <span className="font-bold text-slate-900">{attReport.elapsedDays}</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Present Days</th>
                  <th className="py-3.5 px-4">Late Arrivals</th>
                  <th className="py-3.5 px-4">Calculated Absences</th>
                  <th className="py-3.5 px-4 text-right">Total Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loadingAtt ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      Calculating monthly attendance aggregation...
                    </td>
                  </tr>
                ) : !attReport || attReport.employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No active employee attendance records found for this period.
                    </td>
                  </tr>
                ) : (
                  attReport.employees.map((emp) => (
                    <tr key={emp.userId} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                        <div>{emp.fullName}</div>
                        <div className="text-[10px] text-teal-700 font-mono font-semibold">{emp.employeeId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-600 font-medium">{emp.designation || "-"}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-bold">{emp.presentDays}</td>
                      <td className="py-3.5 px-4 text-amber-700 font-semibold">{emp.lateDays}</td>
                      <td className="py-3.5 px-4 text-rose-700 font-semibold">{emp.absentDays}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">{emp.totalHours} hrs</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks Report */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {tasksReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Status Distribution</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(tasksReport.countByStatus).map(([status, count]) => (
                    <div key={status} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                      <span className="text-slate-600 font-semibold capitalize">{status.replace("_", " ").toLowerCase()}</span>
                      <span className="font-mono font-bold text-slate-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Priority Distribution</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(tasksReport.countByPriority).map(([priority, count]) => (
                    <div key={priority} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                      <span className="text-slate-600 font-semibold capitalize">{priority.toLowerCase()}</span>
                      <span className="font-mono font-bold text-teal-700">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] overflow-x-auto">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Personnel Task Workload</h3>
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Assigned Total</th>
                  <th className="py-3.5 px-4">Completed</th>
                  <th className="py-3.5 px-4">In Progress</th>
                  <th className="py-3.5 px-4">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loadingTasks ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">Loading task analytics...</td>
                  </tr>
                ) : (
                  tasksReport?.employeeBreakdown.map((emp) => (
                    <tr key={emp.userId} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{emp.fullName} <span className="text-teal-700 font-mono text-[11px]">({emp.employeeId})</span></td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{emp.totalAssigned}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-bold">{emp.completed}</td>
                      <td className="py-3.5 px-4 text-teal-700 font-bold">{emp.inProgress}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">{emp.pending}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: R&D Portfolio */}
      {activeTab === "rnd" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Lead</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4">Tasks</th>
                <th className="py-3.5 px-4">Experiments</th>
                <th className="py-3.5 px-4">Dev Logs</th>
                <th className="py-3.5 px-4">Files</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingRnd ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">Loading portfolio metrics...</td>
                </tr>
              ) : (
                rndReport?.projects.map((p) => (
                  <tr key={p.projectId} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-teal-700 font-bold">{p.code}</div>
                      <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{p.responsibleName || "-"}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{p.status}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{p.progressPct}%</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{p.completedTasksCount}/{p.tasksCount}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{p.experimentsCount}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{p.developmentRecordsCount}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{p.filesCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
