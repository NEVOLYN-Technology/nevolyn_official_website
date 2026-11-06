"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types";
import { UserPlus, Edit, KeyRound, Power, Search, Crown, ShieldCheck, Landmark, Mail, LayoutDashboard } from "lucide-react";
import NextLink from "next/link";
import { AddEmployeeModal, EditEmployeeModal, ResetPasswordModal } from "@/components/employees";
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Employee Directory & Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage personnel, role assignments, contact &amp; banking details, security credentials, and access status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, ID, email, bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Full Name &amp; Contact</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Bank Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading personnel directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No employees matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isTargetSuperAdmin = u.role === "super_admin";
                  const isTargetAdmin = u.role === "admin";
                  const isSelf = currentUser?.username === u.username;
                  // Both ADMIN and SUPER_ADMIN can edit employee details (contact & bank info) for all personnel
                  const canResetPassword = !isTargetSuperAdmin && (isSuperAdmin || !isTargetAdmin);
                  const canToggleStatus = !isTargetSuperAdmin && !isSelf && (isSuperAdmin || !isTargetAdmin);

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {u.employeeId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar user={u} size="sm" shape="circle" />
                          <div>
                            <div className="font-bold text-white">{u.fullName}</div>
                            {(u.email || u.phone) && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                {u.email && (
                                  <span className="inline-flex items-center gap-1 truncate max-w-[200px]" title={u.email}>
                                    <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                                    {u.email}
                                  </span>
                                )}
                                {u.phone && <span className="font-mono text-slate-500">· {u.phone}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">@{u.username}</td>
                      <td className="py-3 px-4">{u.designation || "-"}</td>
                      <td className="py-3 px-4">
                        {u.bankName || u.bankAccountNumber || u.secondaryBankName || u.secondaryBankAccountNumber ? (
                          <div className="space-y-2">
                            {(u.bankName || u.bankAccountNumber) && (
                              <div className="space-y-0.5">
                                <div className="font-semibold text-slate-200 flex items-center gap-1">
                                  <Landmark className="w-3 h-3 text-cyan-400 shrink-0" />
                                  <span>#1 {u.bankName || "Primary Bank"}</span>
                                  {u.bankBranch && <span className="text-slate-500 font-normal">({u.bankBranch})</span>}
                                </div>
                                <div className="font-mono text-[11px] text-cyan-300">
                                  A/C: {u.bankAccountNumber || "Not set"}
                                  {u.bankRoutingNumber && (
                                    <span className="text-slate-500"> · RTN: {u.bankRoutingNumber}</span>
                                  )}
                                </div>
                              </div>
                            )}
                            {(u.secondaryBankName || u.secondaryBankAccountNumber) && (
                              <div className="space-y-0.5 pt-1 border-t border-slate-800/70">
                                <div className="font-semibold text-slate-200 flex items-center gap-1">
                                  <Landmark className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span>#2 {u.secondaryBankName || "Secondary Bank"}</span>
                                  {u.secondaryBankBranch && (
                                    <span className="text-slate-500 font-normal">({u.secondaryBankBranch})</span>
                                  )}
                                </div>
                                <div className="font-mono text-[11px] text-indigo-300">
                                  A/C: {u.secondaryBankAccountNumber || "Not set"}
                                  {u.secondaryBankRoutingNumber && (
                                    <span className="text-slate-500"> · RTN: {u.secondaryBankRoutingNumber}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Not added yet</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isTargetSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <Crown className="w-2.5 h-2.5" /> SUPER ADMIN
                          </span>
                        ) : isTargetAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            EMPLOYEE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.isActive
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {(isSuperAdmin || u.role === "employee") && (
                            <NextLink
                              href={`/office/dashboard?username=${u.username}`}
                              title="Inspect Personal Workspace Dashboard"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5" />
                            </NextLink>
                          )}
                          <button
                            onClick={() => setEditingUser(u)}
                            title="Edit Profile & Bank Details"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {canResetPassword && (
                            <button
                              onClick={() => setPasswordResetUser(u)}
                              title="Reset Individual Employee Password"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canToggleStatus && (
                            <button
                              onClick={() => toggleMutation.mutate(u.id)}
                              title={u.isActive ? "Deactivate" : "Reactivate"}
                              className={`p-1.5 rounded-lg transition ${
                                u.isActive
                                  ? "bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                                  : "bg-emerald-500/20 text-emerald-400"
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

      {/* Reset Password Modal */}
      {passwordResetUser && (
        <ResetPasswordModal
          user={passwordResetUser}
          onClose={() => setPasswordResetUser(null)}
          onSuccess={() => {
            setPasswordResetUser(null);
          }}
        />
      )}
    </div>
  );
}
