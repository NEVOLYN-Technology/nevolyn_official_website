"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types";
import { UserPlus, Edit, Power, Search, Crown, ShieldCheck, Landmark, Mail, Phone, LayoutDashboard, LayoutGrid, List, Calendar, ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import { AddEmployeeModal, EditEmployeeModal } from "@/components/employees";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

/**
 * Staff directory and employee administration management page.
 *
 * <p>Enables full management of personnel accounts: searching, role provisioning,
 * profile editing, banking details, account activation toggling, and administrative password resets.</p>
 */
export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: pagedData, isLoading } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const res = await usersApi.getAll(0, 100);
      return res.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => usersApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees-list"] });
    },
  });

  const users = pagedData?.content || [];
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.employeeId.toLowerCase().includes(q) ||
      (u.designation && u.designation.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.bankName && u.bankName.toLowerCase().includes(q)) ||
      (u.secondaryBankName && u.secondaryBankName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employee Directory & Accounts</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage personnel, role assignments, contact &amp; banking details, security credentials, and access status.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, ID, email, bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 w-56 sm:w-64 shadow-xs"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15 flex items-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" /> Add Employee
          </button>
        </div>
      </div>

      {/* Directory Content: Cards (Grid) or Table */}
      {viewMode === "grid" ? (
        <div>
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200/90 shadow-xs">
              Loading personnel cards...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200/90 shadow-xs">
              No employees matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredUsers.map((u) => {
                const isTargetSuperAdmin = u.role === "super_admin";
                const isTargetAdmin = u.role === "admin";
                const isSelf = currentUser?.username === u.username;
                const canToggleStatus = !isTargetSuperAdmin && !isSelf && (isSuperAdmin || !isTargetAdmin);
                const hasPrimaryBank = !!(u.bankName || u.bankAccountNumber);
                const hasSecondaryBank = !!(u.secondaryBankName || u.secondaryBankAccountNumber);

                return (
                  <div
                    key={u.id}
                    className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_-10px_rgba(15,23,42,0.12)] hover:border-teal-500/40 transition-all flex flex-col justify-between p-5 relative overflow-hidden group"
                  >
                    {/* Subtle decorative glow */}
                    <div className="pointer-events-none absolute -top-16 -right-16 w-32 h-32 rounded-full bg-teal-400/10 blur-2xl group-hover:bg-teal-400/20 transition" />

                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div>
                          {isTargetSuperAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300/80">
                              <Crown className="w-2.5 h-2.5 text-amber-600" /> SUPER ADMIN
                            </span>
                          ) : isTargetAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-300/80">
                              <ShieldCheck className="w-2.5 h-2.5 text-teal-600" /> ADMIN
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              EMPLOYEE
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Profile Card Header */}
                      <div className="flex items-start gap-3.5 mb-4">
                        <EmployeeAvatar user={u} size="lg" shape="circle" className="ring-2 ring-slate-100 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate" title={u.fullName}>
                            {u.fullName}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/80">
                              @{u.username}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-1 truncate" title={u.designation || "Personnel"}>
                            {u.designation || "Personnel"}
                          </p>
                          <div className="mt-1.5">
                            <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50/80 px-2 py-0.5 rounded-md border border-teal-200/70 inline-block">
                              {u.employeeId}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1.5 mb-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        {u.email && (
                          <div className="flex items-center gap-2 truncate text-[11px]" title={u.email}>
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </div>
                        )}
                        {u.phone && (
                          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                        {u.joiningDate && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Joined: {u.joiningDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Banking Details */}
                      <div className="space-y-1.5 mb-5 border-t border-slate-100 pt-3">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Landmark className="w-3 h-3 text-slate-400" />
                          <span>Bank Accounts</span>
                        </div>

                        {hasPrimaryBank || hasSecondaryBank ? (
                          <div className="space-y-1.5">
                            {hasPrimaryBank && (
                              <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-200/70">
                                <div className="flex items-center justify-between gap-1 text-xs font-bold text-slate-900 truncate">
                                  <span className="truncate">{u.bankName || "Primary Bank"}</span>
                                  {u.bankBranch && (
                                    <span className="text-[10px] text-slate-500 font-normal shrink-0">
                                      ({u.bankBranch})
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono text-[10px] text-teal-800 font-semibold mt-0.5 space-y-0.5">
                                  <div>A/C: {u.bankAccountNumber || "—"}</div>
                                  {u.bankRoutingNumber && (
                                    <div className="text-slate-400 font-normal">RTN: {u.bankRoutingNumber}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            {hasSecondaryBank && (
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                                <div className="flex items-center justify-between gap-1 text-xs font-bold text-slate-800 truncate">
                                  <span className="truncate">{u.secondaryBankName || "Secondary Bank"}</span>
                                  {u.secondaryBankBranch && (
                                    <span className="text-[10px] text-slate-500 font-normal shrink-0">
                                      ({u.secondaryBankBranch})
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono text-[10px] text-slate-700 font-semibold mt-0.5 space-y-0.5">
                                  <div>A/C: {u.secondaryBankAccountNumber || "—"}</div>
                                  {u.secondaryBankRoutingNumber && (
                                    <div className="text-slate-400 font-normal">RTN: {u.secondaryBankRoutingNumber}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-center text-[11px] text-slate-400 italic">
                            No banking details added
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <NextLink
                        href={`/office/dashboard?username=${u.username}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/15 transition-all text-center"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>View Page</span>
                      </NextLink>

                      <button
                        type="button"
                        onClick={() => setEditingUser(u)}
                        title="Edit Employee Details"
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200/80 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {canToggleStatus && (
                        <button
                          type="button"
                          onClick={() => toggleMutation.mutate(u.id)}
                          title={u.isActive ? "Deactivate Account" : "Reactivate Account"}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            u.isActive
                              ? "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200 hover:border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Employees Table (Alternative Table View) */
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap">Employee ID</th>
                  <th className="py-3.5 px-4">Employee / Contact</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Designation</th>
                  <th className="py-3.5 px-4">Bank Accounts</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Role</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Loading personnel directory...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No employees matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isTargetSuperAdmin = u.role === "super_admin";
                    const isTargetAdmin = u.role === "admin";
                    const isSelf = currentUser?.username === u.username;
                    // Both ADMIN and SUPER_ADMIN can edit employee details (contact & bank info) for all personnel
                    const canToggleStatus = !isTargetSuperAdmin && !isSelf && (isSuperAdmin || !isTargetAdmin);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-teal-700 whitespace-nowrap text-xs">
                          {u.employeeId}
                        </td>
                        <td className="py-3.5 px-4 min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <EmployeeAvatar user={u} size="md" shape="circle" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm whitespace-nowrap">{u.fullName}</span>
                                <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/80">
                                  @{u.username}
                                </span>
                              </div>
                              {(u.email || u.phone) && (
                                <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                                  {u.email && (
                                    <span className="inline-flex items-center gap-1 text-slate-600 truncate max-w-[200px]" title={u.email}>
                                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                      {u.email}
                                    </span>
                                  )}
                                  {u.phone && (
                                    <span className="inline-flex items-center gap-1 font-mono text-slate-600 whitespace-nowrap">
                                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                      {u.phone}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {u.designation || "—"}
                        </td>
                        <td className="py-3.5 px-4 min-w-[230px] max-w-[280px]">
                          {u.bankName || u.bankAccountNumber || u.secondaryBankName || u.secondaryBankAccountNumber ? (
                            <div className="flex flex-col gap-1.5">
                              {(u.bankName || u.bankAccountNumber) && (
                                <div className="px-2.5 py-1.5 rounded-xl bg-teal-50/70 border border-teal-200/70">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs truncate" title={`${u.bankName || "Primary Bank"}${u.bankBranch ? ` (${u.bankBranch})` : ""}`}>
                                    <Landmark className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    <span className="truncate">{u.bankName || "Primary Bank"}</span>
                                    {u.bankBranch && <span className="text-[10px] text-slate-500 font-normal shrink-0">({u.bankBranch})</span>}
                                  </div>
                                  <div className="font-mono text-[11px] text-teal-800 font-semibold tracking-tight mt-0.5 space-y-0.5">
                                    <div>A/C: {u.bankAccountNumber || "—"}</div>
                                    {u.bankRoutingNumber && (
                                      <div className="text-slate-500 font-normal text-[10px]">RTN: {u.bankRoutingNumber}</div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {(u.secondaryBankName || u.secondaryBankAccountNumber) && (
                                <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs truncate" title={`${u.secondaryBankName || "Secondary Bank"}${u.secondaryBankBranch ? ` (${u.secondaryBankBranch})` : ""}`}>
                                    <Landmark className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span className="truncate">{u.secondaryBankName || "Secondary Bank"}</span>
                                    {u.secondaryBankBranch && <span className="text-[10px] text-slate-500 font-normal shrink-0">({u.secondaryBankBranch})</span>}
                                  </div>
                                  <div className="font-mono text-[11px] text-slate-700 font-semibold tracking-tight mt-0.5 space-y-0.5">
                                    <div>A/C: {u.secondaryBankAccountNumber || "—"}</div>
                                    {u.secondaryBankRoutingNumber && (
                                      <div className="text-slate-500 font-normal text-[10px]">RTN: {u.secondaryBankRoutingNumber}</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Not set</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isTargetSuperAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300/80">
                              <Crown className="w-2.5 h-2.5 text-amber-600" /> SUPER ADMIN
                            </span>
                          ) : isTargetAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-300/80">
                              <ShieldCheck className="w-2.5 h-2.5 text-teal-600" /> ADMIN
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              EMPLOYEE
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <NextLink
                              href={`/office/dashboard?username=${u.username}`}
                              title="Inspect Personal Workspace Dashboard"
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 transition"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5" />
                            </NextLink>
                            <button
                              onClick={() => setEditingUser(u)}
                              title="Edit Employee Details"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {canToggleStatus && (
                              <button
                                onClick={() => toggleMutation.mutate(u.id)}
                                title={u.isActive ? "Deactivate" : "Reactivate"}
                                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                  u.isActive
                                    ? "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200 hover:border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddOpen && (
        <AddEmployeeModal
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            queryClient.invalidateQueries({ queryKey: ["employees-list"] });
          }}
        />
      )}

      {/* Edit Employee Modal */}
      {editingUser && (
        <EditEmployeeModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ["employees-list"] });
          }}
        />
      )}
    </div>
  );
}
