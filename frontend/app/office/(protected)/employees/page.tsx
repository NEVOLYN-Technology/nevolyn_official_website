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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employee Directory & Accounts</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage personnel, role assignments, contact &amp; banking details, security credentials, and access status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, ID, email, bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 w-64 shadow-xs"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15 flex items-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" /> Add Employee
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Full Name &amp; Contact</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Bank Details</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-700 whitespace-nowrap">
                        {u.employeeId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar user={u} size="sm" shape="circle" />
                          <div>
                            <div className="font-bold text-slate-900">{u.fullName}</div>
                            {(u.email || u.phone) && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                {u.email && (
                                  <span className="inline-flex items-center gap-1 truncate max-w-[200px]" title={u.email}>
                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                    {u.email}
                                  </span>
                                )}
                                {u.phone && <span className="font-mono text-slate-500">· {u.phone}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">@{u.username}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{u.designation || "-"}</td>
                      <td className="py-3.5 px-4">
                        {u.bankName || u.bankAccountNumber || u.secondaryBankName || u.secondaryBankAccountNumber ? (
                          <div className="space-y-2">
                            {(u.bankName || u.bankAccountNumber) && (
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-800 flex items-center gap-1">
                                  <Landmark className="w-3 h-3 text-teal-600 shrink-0" />
                                  <span>#1 {u.bankName || "Primary Bank"}</span>
                                  {u.bankBranch && <span className="text-slate-500 font-normal">({u.bankBranch})</span>}
                                </div>
                                <div className="font-mono text-[11px] text-teal-700 font-semibold">
                                  A/C: {u.bankAccountNumber || "Not set"}
                                  {u.bankRoutingNumber && (
                                    <span className="text-slate-500 font-normal"> · RTN: {u.bankRoutingNumber}</span>
                                  )}
                                </div>
                              </div>
                            )}
                            {(u.secondaryBankName || u.secondaryBankAccountNumber) && (
                              <div className="space-y-0.5 pt-1 border-t border-slate-200/80">
                                <div className="font-bold text-slate-800 flex items-center gap-1">
                                  <Landmark className="w-3 h-3 text-slate-600 shrink-0" />
                                  <span>#2 {u.secondaryBankName || "Secondary Bank"}</span>
                                  {u.secondaryBankBranch && (
                                    <span className="text-slate-500 font-normal">({u.secondaryBankBranch})</span>
                                  )}
                                </div>
                                <div className="font-mono text-[11px] text-slate-700 font-semibold">
                                  A/C: {u.secondaryBankAccountNumber || "Not set"}
                                  {u.secondaryBankRoutingNumber && (
                                    <span className="text-slate-500 font-normal"> · RTN: {u.secondaryBankRoutingNumber}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not added yet</span>
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
                          {(isSuperAdmin || u.role === "employee") && (
                            <NextLink
                              href={`/office/dashboard?username=${u.username}`}
                              title="Inspect Personal Workspace Dashboard"
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 transition"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5" />
                            </NextLink>
                          )}
                          <button
                            onClick={() => setEditingUser(u)}
                            title="Edit Profile & Bank Details"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {canResetPassword && (
                            <button
                              onClick={() => setPasswordResetUser(u)}
                              title="Reset Individual Employee Password"
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canToggleStatus && (
                            <button
                              onClick={() => toggleMutation.mutate(u.id)}
                              title={u.isActive ? "Deactivate" : "Reactivate"}
                              className={`p-1.5 rounded-lg border transition ${
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
