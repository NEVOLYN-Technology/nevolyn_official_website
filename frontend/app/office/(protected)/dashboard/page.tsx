"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { AdminDashboard, EmployeeDashboard } from "@/components/dashboard";
import { EditEmployeeModal, ResetPasswordModal } from "@/components/employees";
import { User } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Crown } from "lucide-react";

/**
 * Inner component reading search params safely wrapped in Suspense.
 */
function DashboardContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUsernameQuery = searchParams.get("username");

  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [selectedUsername, setSelectedUsername] = useState<string | null>(
    targetUsernameQuery || null
  );
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

  useEffect(() => {
    if (targetUsernameQuery) {
      setSelectedUsername(targetUsernameQuery);
    }
  }, [targetUsernameQuery]);

  const { data: usersData } = useQuery({
    queryKey: ["staff-directory-switcher"],
    queryFn: async () => {
      const res = await usersApi.getAll(0, 100);
      return res.data?.content || [];
    },
    enabled: !!isAdmin,
  });

  const staffList = usersData || [];

  // Super Admin can inspect ANY personnel; Admin can only inspect EMPLOYEES
  const allowedStaff = staffList.filter((s) => {
    if (isSuperAdmin) return true;
    return s.role === "employee";
  });

  const activeTargetUser =
    staffList.find((s) => s.username === selectedUsername) || null;

  if (!isAdmin) {
    return <EmployeeDashboard username={user?.username || ""} />;
  }

  return (
    <div className="space-y-6">
      {/* Glossy Workspace Inspection Switcher Bar */}
      <div className="p-4 md:p-5 rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/95 ring-1 ring-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.1)]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            {isSuperAdmin ? (
              <Crown className="w-5 h-5" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                {isSuperAdmin ? "Super Admin Operations" : "Admin Operations"}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200">
                {selectedUsername
                  ? "Personal Workspace Mode"
                  : "Organization Mode"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {isSuperAdmin
                ? "Full control: View and edit any personnel or employee workspace."
                : "Manage and inspect assigned employee workspaces."}
            </p>
          </div>
        </div>

        {/* Switcher Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedUsername || ""}
            onChange={(e) => {
              const val = e.target.value || null;
              setSelectedUsername(val);
              if (val) {
                router.push(`/office/dashboard?username=${val}`);
              } else {
                router.push("/office/dashboard");
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/90 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition shadow-2xs cursor-pointer"
          >
            <option value="">⚡ Master Executive Overview</option>
            <optgroup
              label={
                isSuperAdmin
                  ? "All Personnel (Super Admin Access)"
                  : "Employees (Admin Access)"
              }
            >
              {allowedStaff.map((s) => (
                <option key={s.id} value={s.username}>
                  👤 {s.fullName} (@{s.username}) — {s.role.toUpperCase()}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Render Selected View */}
      {selectedUsername ? (
        <EmployeeDashboard
          username={selectedUsername}
          isInspecting={true}
          onEditProfile={() =>
            activeTargetUser && setEditingUser(activeTargetUser)
          }
          onResetPassword={() =>
            activeTargetUser && setResetPasswordUser(activeTargetUser)
          }
          onBackToOverview={() => {
            setSelectedUsername(null);
            router.push("/office/dashboard");
          }}
        />
      ) : (
        <AdminDashboard />
      )}

      {/* Modals for Direct Editing */}
      {editingUser && (
        <EditEmployeeModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            queryClient.invalidateQueries({
              queryKey: ["employee-dashboard", selectedUsername],
            });
            queryClient.invalidateQueries({
              queryKey: ["staff-directory-switcher"],
            });
          }}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onSuccess={() => setResetPasswordUser(null)}
        />
      )}
    </div>
  );
}

/**
 * Central dashboard route dispatcher with Suspense boundary.
 */
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-20 bg-white/80 rounded-3xl border border-slate-200/80" />
          <div className="h-44 bg-white/80 rounded-3xl border border-slate-200/80" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
