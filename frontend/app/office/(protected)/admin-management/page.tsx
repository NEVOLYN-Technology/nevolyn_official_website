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
      <label className="block text-slate-600 mb-1 text-xs font-bold">
        {label} {required && <span className="text-rose-500">*</span>}
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
        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-slate-900 focus:outline-none"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-extrabold text-slate-900">Create Administrator Account</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <strong>⚠️ Privileged Operation:</strong> This creates an <strong>ADMIN</strong> account with full office management access. Only create accounts for trusted personnel.
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
            Cancel
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !formData.employeeId || !formData.username || !formData.password || !formData.fullName}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-slate-900/15 flex items-center gap-2"
          >
            {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5 text-emerald-400" />}
            {createMutation.isPending ? "Creating..." : "Create Administrator"}
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
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (!isSuperAdmin) return null;

  const roleBadge = (role: string) => {
    if (role === "super_admin")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300/80 text-amber-800 text-[10px] font-bold">
          <Crown className="w-2.5 h-2.5 text-amber-600" /> SUPER ADMIN
        </span>
      );
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-300/80 text-teal-800 text-[10px] font-bold">
        ADMIN
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            Admin Management
          </h1>
          <p className="text-slate-500 font-medium text-xs mt-1">
            Manage administrator accounts — Super Admin access only
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15 transition-all"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          Create Administrator
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <strong>Security Policy:</strong> Passwords, banking credentials, and phone numbers are protected personal data maintained exclusively by account holders via the Profile &amp; Security portal. Maximum 2 active Super Administrator accounts are permitted. ADMIN accounts can be activated or deactivated by Super Administrators.
        </div>
      </div>

      {/* Admin accounts table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">
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
          <div className="divide-y divide-slate-100">
            {adminUsers.map((admin) => {
              const isSA = admin.role === "super_admin";
              return (
                <div
                  key={admin.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar */}
                    <EmployeeAvatar user={admin} size="md" shape="circle" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{admin.fullName}</span>
                        {roleBadge(admin.role)}
                        {!admin.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        @{admin.username} · <span className="font-mono text-teal-700 font-semibold">{admin.employeeId}</span>
                        {admin.designation && ` · ${admin.designation}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions — only for ADMIN (not SUPER_ADMIN) */}
                  {!isSA && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleMutation.mutate(admin.id)}
                        disabled={toggleMutation.isPending}
                        title={admin.isActive ? "Deactivate account" : "Activate account"}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          admin.isActive
                            ? "bg-slate-100 text-slate-600 border-slate-200 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* SUPER_ADMIN: protected badge instead of action buttons */}
                  {isSA && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300/80 rounded-lg px-2.5 py-1 shrink-0">
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
    </div>
  );
}
