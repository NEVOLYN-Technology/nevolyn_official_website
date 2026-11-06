"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { ShieldAlert, Search } from "lucide-react";

/**
 * AuditPage component.
 *
 * Provides an administrative security console for inspecting the immutable
 * system audit logs:
 * - Debounced full-text search by username, IP address, and details.
 * - Action category filtering (LOGIN, LOGOUT, CHECK_IN, ATTENDANCE_CORRECT, PROJECT_CREATE, etc.).
 * - Paginated tabular display with timestamps, target entities, and audit status.
 *
 * @returns {React.ReactElement} The rendered audit trail viewer.
 */
export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["audit-logs", actionFilter, debouncedSearch],
    queryFn: async () => {
      const res = await auditApi.getAll(0, 100, actionFilter || undefined, debouncedSearch || undefined);
      return res.data;
    },
  });

  const logs = pageData?.content || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <span>Immutable System Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security log tracking authentication, permission checks, attendance adjustments, and entity mutations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search username or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Action Types</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="CHECK_IN">CHECK_IN</option>
            <option value="CHECK_OUT">CHECK_OUT</option>
            <option value="ATTENDANCE_CORRECT">ATTENDANCE_CORRECT</option>
            <option value="CREATE_EMPLOYEE">CREATE_EMPLOYEE</option>
            <option value="EDIT_EMPLOYEE">EDIT_EMPLOYEE</option>
            <option value="TOGGLE_EMPLOYEE">TOGGLE_EMPLOYEE</option>
            <option value="RESET_PASSWORD">RESET_PASSWORD</option>
            <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
            <option value="CREATE_PROJECT">CREATE_PROJECT</option>
            <option value="CREATE_TASK">CREATE_TASK</option>
            <option value="UPDATE_TASK">UPDATE_TASK</option>
            <option value="FILE_UPLOAD">FILE_UPLOAD</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Operator</th>
              <th className="py-3 px-4">Action Code</th>
              <th className="py-3 px-4">Client IP</th>
              <th className="py-3 px-4">Target Resource</th>
              <th className="py-3 px-4">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                  Querying security audit store...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                  No audit logs found matching criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {log.username || "System"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.ipAddress || "LAN"}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {log.targetEntity ? `${log.targetEntity} #${log.targetId || ""}` : "-"}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300 max-w-md break-words">
                    {log.details || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
