"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { usersApi, getApiErrorMessage } from "@/lib/api";
import { User } from "@/types";
import {
  ShieldCheck,
  UserPlus,
  Power,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

// ── Create Admin Modal ────────────────────────────────────────────

function CreateAdminModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    employeeId: "",
    username: "",
    password: "",
    fullName: "",
    designation: "",
    joiningDate: new Date().toISOString().split("T")[0],
    phone: "",
    role: "admin",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const isAutoEmployeeId =
    !formData.employeeId ||
    formData.employeeId.startsWith("nev_");

  const buildEmployeeId = (username: string, joiningDate: string) => {
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (!cleanUser) return "";
    return `nev_${cleanUser}_${joiningDate || new Date().toISOString().split("T")[0]}`;
  };

  const createMutation = useMutation({
    mutationFn: () => usersApi.create(formData),
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => {
      setErrorMsg(getApiErrorMessage(err, "Failed to create administrator account"));
    },
  });

  const field = (
    label: string,
    key: keyof typeof formData,
    type = "text",
    placeholder = "",
    required = true
  ) => (
    <div>
      <label className="block text-slate-400 mb-1 text-xs font-medium">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={formData[key]}
        onChange={(e) => {
          const val = e.target.value;
          if (key === "username") {
            setFormData({
              ...formData,
              username: val,
              employeeId: isAutoEmployeeId ? buildEmployeeId(val, formData.joiningDate) : formData.employeeId,
            });
          } else if (key === "joiningDate") {
            setFormData({
              ...formData,
              joiningDate: val,
              employeeId: isAutoEmployeeId ? buildEmployeeId(formData.username, val) : formData.employeeId,
            });
          } else {
            setFormData({ ...formData, [key]: val });
          }
        }}
        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-900/50 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-purple-900/20">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-bold text-white">Create Administrator Account</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
          <strong>⚠️ Privileged Operation:</strong> This creates an <strong>ADMIN</strong> account with full office management access. Only create accounts for trusted personnel.
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs">
          {field("Employee ID", "employeeId", "text", "nev_<username>_<YYYY-MM-DD>")}
          {field("Username", "username", "text", "Enter username")}
          <div className="col-span-2">
            {field("Full Name", "fullName", "text", "e.g. John Doe")}
          </div>
          {field("Password (min 6)", "password", "password", "")}
          {field("Designation", "designation", "text", "e.g. Office Manager", false)}
          {field("Joining Date", "joiningDate", "date", "", false)}
          <div className="col-span-2">
            {field("Phone Number", "phone", "text", "+880...", false)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
            Cancel
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !formData.employeeId || !formData.username || !formData.password || !formData.fullName}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-2"
          >
            {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            {createMutation.isPending ? "Creating..." : "Create Administrator"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Admin Password Modal ────────────────────────────────────

function ResetPasswordModal({ admin, onClose, onSuccess }: { admin: User; onClose: () => void; onSuccess: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const resetMutation = useMutation({
    mutationFn: () => usersApi.resetPassword(admin.id, newPassword),
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => {
      setErrorMsg(getApiErrorMessage(err, "Failed to reset password"));
    },
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-900/50 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-sm">Reset Administrator Password</h3>
        </div>
        <p className="text-slate-400 text-xs">
          Resetting password for <strong className="text-white">{admin.fullName}</strong> ({admin.username})
        </p>

        {errorMsg && (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{errorMsg}</div>
        )}

        <input
          type="password"
          placeholder="New password (min 6 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
        />

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
            Cancel
          </button>
          <button
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending || newPassword.length < 6}
            className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold"
          >
            {resetMutation.isPending ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Management Page ────────────────────────────────────

export default function AdminManagementPage() {
  const { isSuperAdmin } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect non-super-admins
  React.useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/office/dashboard");
    }
  }, [isSuperAdmin, router]);

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const res = await usersApi.getAll(0, 100);
      return res.data?.content ?? [];
    },
    enabled: isSuperAdmin,
  });

  const adminUsers: User[] = (allUsers ?? []).filter(
    (u: User) => u.role === "admin" || u.role === "super_admin"
  );

  const toggleMutation = useMutation({
    mutationFn: (userId: number) => usersApi.toggleStatus(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      setSuccessMsg("Account status updated.");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const handleSuccess = (msg: string) => {
    void queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    setShowCreateModal(false);
    setResetTarget(null);
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (!isSuperAdmin) return null;

  const roleBadge = (role: string) => {
    if (role === "super_admin")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
          <Crown className="w-2.5 h-2.5" /> SUPER ADMIN
        </span>
      );
    return (
      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
        ADMIN
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            Admin Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage administrator accounts — Super Admin access only
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Create Administrator
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-purple-300 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
        <div>
          <strong>Security Policy:</strong> SUPER_ADMIN accounts cannot be deactivated or have their passwords reset via this panel.
          Maximum 2 active Super Administrator accounts are permitted. ADMIN accounts can only be managed by Super Administrators.
        </div>
      </div>

      {/* Admin accounts table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">
            Administrator Accounts ({adminUsers.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading administrators...
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No administrator accounts found.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {adminUsers.map((admin) => {
              const isSA = admin.role === "super_admin";
              return (
                <div
                  key={admin.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar */}
                    <EmployeeAvatar user={admin} size="md" shape="circle" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{admin.fullName}</span>
                        {roleBadge(admin.role)}
                        {!admin.isActive && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/25">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        @{admin.username} · {admin.employeeId}
                        {admin.designation && ` · ${admin.designation}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions — only for ADMIN (not SUPER_ADMIN) */}
                  {!isSA && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setResetTarget(admin)}
                        title="Reset password"
                        className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleMutation.mutate(admin.id)}
                        disabled={toggleMutation.isPending}
                        title={admin.isActive ? "Deactivate account" : "Activate account"}
                        className={`p-2 rounded-lg transition-colors ${
                          admin.isActive
                            ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* SUPER_ADMIN: protected badge instead of action buttons */}
                  {isSA && (
                    <span className="text-[10px] text-purple-400 border border-purple-700/50 rounded-lg px-2 py-1 shrink-0">
                      Protected Account
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => handleSuccess("Administrator account created successfully.")}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          admin={resetTarget}
          onClose={() => setResetTarget(null)}
          onSuccess={() => handleSuccess("Password reset successfully.")}
        />
      )}
    </div>
  );
}
