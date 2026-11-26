"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import { AdminAttendanceRecord } from "@/types";
import {
  Calendar,
  Edit3,
  Search,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserX,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CorrectionModal } from "@/components/attendance";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

export default function AdminAttendancePage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingRecord, setEditingRecord] = useState<AdminAttendanceRecord | null>(null);

  const { data: rawRecords, isLoading } = useQuery<AdminAttendanceRecord[]>({
    queryKey: ["admin-attendance-date", selectedDate],
    queryFn: async () => {
      const res = await attendanceApi.getAdminDaily(selectedDate);
      const raw: any = res.data;
      const list = raw?.data ?? raw;
      return Array.isArray(list) ? list : [];
    },
  });

  const records = Array.isArray(rawRecords) ? rawRecords : [];

  // Filtered roster
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== "all") {
        if (statusFilter === "Present" && r.status !== "Present") return false;
        if (statusFilter === "Absent" && r.status !== "Absent") return false;
        if (statusFilter === "Late" && r.lateStatus !== "Late") return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          r.fullName.toLowerCase().includes(query) ||
          r.employeeId.toLowerCase().includes(query) ||
          (r.designation && r.designation.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [records, statusFilter, searchTerm]);

  // Executive KPI Aggregates for the selected date
  const totalEmployees = records.length;
  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const lateCount = records.filter((r) => r.lateStatus === "Late").length;
  const inHouseCount = records.filter(
    (r) => r.checkInTime && !r.checkOutTime && r.status === "Present"
  ).length;

  // Date references
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }, []);
  const twoDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().split("T")[0];
  }, []);
  const threeDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d.toISOString().split("T")[0];
  }, []);

  const isTodaySelected = selectedDate === todayStr;
  const isYesterdaySelected = selectedDate === yesterdayStr;
  const isTwoDaysAgoSelected = selectedDate === twoDaysAgoStr;
  const isThreeDaysAgoSelected = selectedDate === threeDaysAgoStr;

  // Day Stepper Helpers
  const handlePrevDay = () => {
    const parts = selectedDate.split("-");
    const current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    if (selectedDate >= todayStr) return;
    const parts = selectedDate.split("-");
    const current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const setDateOffset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const formattedDateLabel = useMemo(() => {
    try {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch {}
    return selectedDate;
  }, [selectedDate]);

  const exportRosterCsv = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      "Employee ID",
      "Full Name",
      "Designation",
      "Date",
      "Check-In",
      "Check-Out",
      "Total Hours",
      "Punctuality",
      "Early Checkout",
      "Status",
    ];
    const rows = filteredRecords.map((r) => [
      r.employeeId,
      r.fullName,
      r.designation || "Staff",
      r.date,
      r.checkInTime || "",
      r.checkOutTime || "",
      r.totalHours || 0,
      r.lateStatus || "On Time",
      r.earlyCheckout || "No",
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `staff_roster_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header and Date Selector Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              Supervisory Control
            </span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800">
              Live Workforce Attendance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-teal-600" />
            <span>Staff Attendance Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitor daily arrivals, workforce roster compliance, and execute audited corrections.
          </p>
        </div>

        {/* Dynamic Multi-Day Navigation Toolbar */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Day Stepper & Quick Preset Chips */}
          <div className="flex items-center rounded-2xl bg-white border border-slate-200/90 p-1 shadow-2xs">
            <button
              onClick={handlePrevDay}
              title="Previous Day"
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setDateOffset(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isTodaySelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Today
            </button>

            <button
              onClick={() => setDateOffset(-1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isYesterdaySelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Yesterday
            </button>

            <button
              onClick={() => setDateOffset(-2)}
              className={`hidden sm:inline-block px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isTwoDaysAgoSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              2d Ago
            </button>

            <button
              onClick={() => setDateOffset(-3)}
              className={`hidden md:inline-block px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isThreeDaysAgoSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              3d Ago
            </button>

            <button
              onClick={handleNextDay}
              disabled={isTodaySelected}
              title={isTodaySelected ? "Viewing Today" : "Next Day"}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Calendar Date Picker */}
          <div className="relative flex items-center gap-2 bg-white border border-slate-200/90 px-3 py-2 rounded-2xl shadow-2xs hover:border-slate-400 transition cursor-pointer group">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-xs font-mono font-bold text-slate-900 select-none">
              {formattedDateLabel}
            </span>
            <input
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Click to jump to any past date"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportRosterCsv}
            disabled={filteredRecords.length === 0}
            className="p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 transition cursor-pointer"
            title="Export Roster CSV"
          >
            <Download className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Workforce Compliance KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Staff */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block flex items-center justify-between">
            <span>Roster</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </span>
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900">
            {totalEmployees}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Active personnel</p>
        </div>

        {/* Present Today */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block flex items-center justify-between">
            <span>Present</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-700">
            {presentCount}
          </div>
          <p className="text-[10px] text-emerald-800 font-medium">
            {totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0}% turn-out
          </p>
        </div>

        {/* In-House Right Now */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block flex items-center justify-between">
            <span>In-House</span>
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          </span>
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-sky-700">
            {inHouseCount}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Currently on-site</p>
        </div>

        {/* Late Arrivals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block flex items-center justify-between">
            <span>Late</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </span>
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-rose-700">
            {lateCount}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Arrivals after cutoff</p>
        </div>

        {/* Absent */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block flex items-center justify-between">
            <span>Absent</span>
            <UserX className="w-3.5 h-3.5 text-slate-400" />
          </span>
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-700">
            {absentCount}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Unrecorded on date</p>
        </div>
      </div>

      {/* Roster Table Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] space-y-4">
        {/* Search, Filter & Date Indicator Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by employee name, ID or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex text-[11px] font-semibold text-slate-500">
              Roster for <span className="font-bold text-slate-800 ml-1">{formattedDateLabel}</span>
            </span>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Present">Present Only</option>
                <option value="Late">Late Arrivals</option>
                <option value="Absent">Absent Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile / Small Tablet Staff Card View (<768px) */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 font-medium text-xs">
              Loading staff attendance roster...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium text-xs">
              No records found matching criteria for {formattedDateLabel}.
            </div>
          ) : (
            filteredRecords.map((r) => (
              <div
                key={r.userId}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 text-xs"
              >
                {/* Employee Info Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <EmployeeAvatar
                      user={{ fullName: r.fullName, employeeId: r.employeeId }}
                      size="sm"
                      shape="circle"
                    />
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 truncate text-sm">
                        {r.fullName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {r.employeeId} &bull; {r.designation || "Staff"}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                      r.status === "Present"
                        ? r.checkOutTime
                          ? "bg-teal-50 text-teal-800 border-teal-200"
                          : "bg-sky-50 text-sky-800 border-sky-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {r.status === "Present" && !r.checkOutTime ? "In-House" : r.status}
                  </span>
                </div>

                {/* Timestamps & Hours */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Arrival</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {r.checkInTime || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Departure</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {r.checkOutTime || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Hours</span>
                    <span className="font-mono font-extrabold text-teal-700 text-xs">
                      {r.totalHours ? `${r.totalHours}h` : "0h"}
                    </span>
                  </div>
                </div>

                {/* Status Badges & Audit Action */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {r.lateStatus === "Late" && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-extrabold">
                        Late
                      </span>
                    )}
                    {r.lateStatus === "On Time" && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold">
                        On Time
                      </span>
                    )}
                    {r.earlyCheckout === "Yes" && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-extrabold">
                        Early Exit
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingRecord(r)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3 h-3 text-emerald-400" />
                    <span>Audit / Correct</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Tabular View: Streamlined 6-Column Layout (Never Cut Off) */}
        <div className="hidden md:block rounded-2xl border border-slate-200/80 overflow-x-auto bg-white">
          <table className="w-full min-w-[760px] text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 w-[28%]">Employee</th>
                <th className="py-3.5 px-3 w-[12%] whitespace-nowrap">Arrival</th>
                <th className="py-3.5 px-3 w-[12%] whitespace-nowrap">Departure</th>
                <th className="py-3.5 px-3 w-[12%] whitespace-nowrap">Hours</th>
                <th className="py-3.5 px-4 w-[20%]">Status &amp; Compliance</th>
                <th className="py-3.5 px-4 w-[16%] text-right whitespace-nowrap">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    Loading daily staff attendance roster...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    No records found matching criteria for {formattedDateLabel}.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.userId} className="hover:bg-slate-50/80 transition">
                    {/* Employee Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar
                          user={{ fullName: r.fullName, employeeId: r.employeeId }}
                          size="sm"
                          shape="circle"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 truncate">{r.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">
                            {r.employeeId} &bull; {r.designation || "Staff"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Check-In */}
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                      {r.checkInTime || "—"}
                    </td>

                    {/* Check-Out */}
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                      {r.checkOutTime || "—"}
                    </td>

                    {/* Total Hours */}
                    <td className="py-3.5 px-3 font-mono font-bold text-teal-700 whitespace-nowrap">
                      {r.totalHours ? `${r.totalHours} hrs` : "0.00 hrs"}
                    </td>

                    {/* Status & Compliance (Merged to eliminate horizontal overflow) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                            r.status === "Present"
                              ? r.checkOutTime
                                ? "bg-teal-50 text-teal-800 border-teal-200"
                                : "bg-sky-50 text-sky-800 border-sky-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {r.status === "Present" && !r.checkOutTime ? "In-House" : r.status}
                        </span>

                        {r.lateStatus === "Late" && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-extrabold shrink-0">
                            Late
                          </span>
                        )}
                        {r.lateStatus === "On Time" && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold shrink-0">
                            On Time
                          </span>
                        )}
                        {r.earlyCheckout === "Yes" && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-extrabold shrink-0">
                            Early Exit
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Audit Action Button (Always in-view, never clipped) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingRecord(r)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:shadow-md"
                        title="Audit & Correct Record"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Audit / Correct</span>
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
