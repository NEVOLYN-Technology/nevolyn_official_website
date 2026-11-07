"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types";
import {
  UserPlus,
  Edit,
  Power,
  Search,
  Crown,
  ShieldCheck,
  Landmark,
  Mail,
  Phone,
  LayoutDashboard,
  Calendar,
} from "lucide-react";
import NextLink from "next/link";
import { AddEmployeeModal, EditEmployeeModal } from "@/components/employees";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

/**
 * Staff directory and employee administration management page.
 * Displays personnel in a unified 2-column card grid with uniform card sizing.
 * Order: 1st line: Rahin, Nobo | 2nd line: Afzal, Nomrota
 */
export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [search, setSearch] = useState("");
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

  // Filter based on search query
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

  // Explicit priority ordering:
  // 1st line: Rahin, then Nobo
  // 2nd line: Afzal, then Nomrota
  const getEmployeePriority = (u: User) => {
    const uname = (u.username || "").toLowerCase();
    const fname = (u.fullName || "").toLowerCase();

    if (uname.includes("rahin") || fname.includes("rahin")) return 1;
    if (uname.includes("nobo") || uname.includes("mninad") || fname.includes("nobo") || fname.includes("ninad")) return 2;
    if (uname.includes("afzal") || fname.includes("afzal")) return 3;
    if (uname.includes("nomrota") || uname.includes("mehajabin") || fname.includes("nomrota") || fname.includes("mehajabin")) return 4;
    return 99;
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const pA = getEmployeePriority(a);
    const pB = getEmployeePriority(b);
    if (pA !== pB) return pA - pB;
    return a.fullName.localeCompare(b.fullName);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employee Directory &amp; Accounts</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage personnel, role assignments, organizational details, security credentials, and access status.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 w-56 sm:w-64 shadow-xs"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15 flex items-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" /> Add Employee
          </button>
        </div>
      </div>

      {/* Directory Content: Standardized 2-Column Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          Loading personnel cards...
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          No employees matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {sortedUsers.map((u) => {
            const isTargetSuperAdmin = u.role === "super_admin";
            const isTargetAdmin = u.role === "admin";
            const isSelf = currentUser?.username === u.username;
            const canToggleStatus = !isTargetSuperAdmin && !isSelf && (isSuperAdmin || !isTargetAdmin);
            const hasPrimaryBank = !!(u.bankName || u.bankAccountNumber);
            const hasSecondaryBank = !!(u.secondaryBankName || u.secondaryBankAccountNumber);

            return (
              <div
                key={u.id}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_-10px_rgba(15,23,42,0.12)] hover:border-teal-500/40 transition-all flex flex-col justify-between p-6 relative overflow-hidden group h-full"
              >
                {/* Subtle decorative glow */}
                <div className="pointer-events-none absolute -top-16 -right-16 w-32 h-32 rounded-full bg-teal-400/10 blur-2xl group-hover:bg-teal-400/20 transition" />

                <div className="flex flex-col flex-1">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4 h-6">
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
                  <div className="flex items-start gap-4 mb-4">
                    <EmployeeAvatar user={u} size="lg" shape="circle" className="ring-2 ring-slate-100 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug truncate" title={u.fullName}>
                        {u.fullName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
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

                  {/* Contact Info (Uniform 3-slot structure) */}
                  <div className="space-y-2 mb-4 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-[11px] h-5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {u.email ? (
                        <span className="truncate text-slate-700 font-medium" title={u.email}>{u.email}</span>
                      ) : (
                        <span className="text-slate-400 italic">No official email set</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] h-5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {u.phone ? (
                        <span className="font-mono text-slate-700">{u.phone}</span>
                      ) : (
                        <span className="text-slate-400 italic">No phone number recorded</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] h-5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {u.joiningDate ? (
                        <span className="text-slate-600">Joined: {u.joiningDate}</span>
                      ) : (
                        <span className="text-slate-400 italic">Joining date not recorded</span>
                      )}
                    </div>
                  </div>

                  {/* Banking Details (Equal-height slots across all cards) */}
                  <div className="space-y-2 mb-4 border-t border-slate-100 pt-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Landmark className="w-3 h-3 text-slate-400" />
                      <span>Direct Deposit Accounts</span>
                    </div>

                    <div className="space-y-2">
                      {/* Slot 1: Primary Bank */}
                      {hasPrimaryBank ? (
                        <div className="p-2.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 h-[68px] flex flex-col justify-between">
                          <div className="flex items-center justify-between gap-1 text-xs font-bold text-slate-900">
                            <div className="flex items-center gap-1.5 truncate">
                              <Landmark className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span className="truncate">{u.bankName || "Primary Bank"}</span>
                            </div>
                            {u.bankBranch && (
                              <span className="text-[10px] text-slate-500 font-normal shrink-0">
                                ({u.bankBranch})
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-teal-800 font-semibold flex items-center justify-between gap-2">
                            <span className="truncate">A/C: {u.bankAccountNumber || "—"}</span>
                            {u.bankRoutingNumber && (
                              <span className="text-slate-400 font-normal shrink-0">RTN: {u.bankRoutingNumber}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 h-[68px] flex flex-col justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Primary Payroll Account</span>
                          </div>
                          <div className="text-[10px] text-slate-400 italic">
                            Pending employee profile configuration
                          </div>
                        </div>
                      )}

                      {/* Slot 2: Secondary Bank */}
                      {hasSecondaryBank ? (
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 h-[68px] flex flex-col justify-between">
                          <div className="flex items-center justify-between gap-1 text-xs font-bold text-slate-800">
                            <div className="flex items-center gap-1.5 truncate">
                              <Landmark className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{u.secondaryBankName || "Secondary Bank"}</span>
                            </div>
                            {u.secondaryBankBranch && (
                              <span className="text-[10px] text-slate-500 font-normal shrink-0">
                                ({u.secondaryBankBranch})
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-slate-700 font-semibold flex items-center justify-between gap-2">
                            <span className="truncate">A/C: {u.secondaryBankAccountNumber || "—"}</span>
                            {u.secondaryBankRoutingNumber && (
                              <span className="text-slate-400 font-normal shrink-0">RTN: {u.secondaryBankRoutingNumber}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 h-[68px] flex flex-col justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <Landmark className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>Secondary Account (Optional)</span>
                          </div>
                          <div className="text-[10px] text-slate-400 italic">
                            Not configured
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Pinned to Bottom) */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center gap-2 mt-auto">
                  <NextLink
                    href={`/office/dashboard?username=${u.username}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/15 transition-all text-center cursor-pointer"
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
