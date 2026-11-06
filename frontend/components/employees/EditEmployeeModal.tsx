"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersApi, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { X, Landmark } from "lucide-react";

/**
 * Props for the {@link EditEmployeeModal} component.
 */
interface EditEmployeeModalProps {
  /** The target employee entity to edit. */
  user: User;
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired when the employee update is saved. */
  onSuccess: () => void;
}

/**
 * Modal dialog for modifying employee profile details, roles, designations, and banking details.
 */
export function EditEmployeeModal({ user, onClose, onSuccess }: EditEmployeeModalProps) {
  const { isSuperAdmin } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    designation: user.designation || "",
    joiningDate: user.joiningDate || "",
    phone: user.phone || "",
    email: user.email || "",
    bankName: user.bankName || "",
    bankAccountName: user.bankAccountName || user.fullName || "",
    bankAccountNumber: user.bankAccountNumber || "",
    bankBranch: user.bankBranch || "",
    bankRoutingNumber: user.bankRoutingNumber || "",
    role: user.role,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const updateMutation = useMutation({
    mutationFn: () => usersApi.update(user.id, formData),
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => {
      setErrorMsg(getApiErrorMessage(err, "Failed to update employee"));
    },
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Edit Employee: {user.fullName}</h2>
            <p className="text-[11px] text-slate-400 font-mono">
              {user.employeeId} · @{user.username}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
            <input
              type="email"
              placeholder="name@nevolyn.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
            <input
              type="text"
              placeholder="+880..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Joining Date</label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">Role</label>
            <select
              value={formData.role}
              disabled={!isSuperAdmin || user.role === "super_admin"}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as "super_admin" | "admin" | "employee" })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
            >
              <option value="employee">Employee</option>
              {(isSuperAdmin || user.role === "admin") && <option value="admin">Administrator</option>}
              {user.role === "super_admin" && (
                <option value="super_admin">Super Administrator (Code-Provisioned)</option>
              )}
            </select>
            {!isSuperAdmin && (
              <p className="mt-1 text-slate-500 text-[10px]">
                Only Super Administrators can change user roles.
              </p>
            )}
          </div>

          {/* Bank Details Section */}
          <div className="sm:col-span-2 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-3">
              <Landmark className="w-4 h-4" />
              <span>Bank & Payroll Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. City Bank / BRAC Bank / DBBL"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="Name as on bank account"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1502938475610"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gulshan Branch"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-medium">Routing Number / SWIFT</label>
                <input
                  type="text"
                  placeholder="e.g. 225261729"
                  value={formData.bankRoutingNumber}
                  onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
            Cancel
          </button>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
