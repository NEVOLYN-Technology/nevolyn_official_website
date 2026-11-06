"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersApi, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { X, Landmark } from "lucide-react";

interface EditEmployeeModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

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
    secondaryBankName: user.secondaryBankName || "",
    secondaryBankAccountName: user.secondaryBankAccountName || user.fullName || "",
    secondaryBankAccountNumber: user.secondaryBankAccountNumber || "",
    secondaryBankBranch: user.secondaryBankBranch || "",
    secondaryBankRoutingNumber: user.secondaryBankRoutingNumber || "",
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Edit Employee: {user.fullName}</h2>
            <p className="text-[11px] text-teal-700 font-mono font-semibold">
              {user.employeeId} · @{user.username}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div className="sm:col-span-2">
            <label className="block text-slate-600 mb-1 font-bold">Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Email Address</label>
            <input
              type="email"
              placeholder="name@nevolyn.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Phone Number</label>
            <input
              type="text"
              placeholder="+880..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Joining Date</label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-slate-600 mb-1 font-bold">Role</label>
            <select
              value={formData.role}
              disabled={!isSuperAdmin || user.role === "super_admin"}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as "super_admin" | "admin" | "employee" })
              }
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 disabled:opacity-60"
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

          {/* Bank Account 1 (Primary) */}
          <div className="sm:col-span-2 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs mb-3">
              <Landmark className="w-4 h-4 text-teal-600" />
              <span>Bank Account 1 — Primary Payroll Account</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. City Bank / BRAC Bank / DBBL"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="Name as on bank account"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1502938475610"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gulshan Branch"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1 font-bold">Routing Number / SWIFT</label>
                <input
                  type="text"
                  placeholder="e.g. 225261729"
                  value={formData.bankRoutingNumber}
                  onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Bank Account 2 (Secondary) */}
          <div className="sm:col-span-2 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs mb-3">
              <Landmark className="w-4 h-4 text-slate-600" />
              <span>Bank Account 2 — Secondary / Alternate Account (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eastern Bank / Islami Bank / bKash"
                  value={formData.secondaryBankName}
                  onChange={(e) => setFormData({ ...formData, secondaryBankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="Name as on secondary bank account"
                  value={formData.secondaryBankAccountName}
                  onChange={(e) => setFormData({ ...formData, secondaryBankAccountName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1041070001234"
                  value={formData.secondaryBankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, secondaryBankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi Branch"
                  value={formData.secondaryBankBranch}
                  onChange={(e) => setFormData({ ...formData, secondaryBankBranch: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1 font-bold">Routing Number / SWIFT</label>
                <input
                  type="text"
                  placeholder="e.g. 095261186"
                  value={formData.secondaryBankRoutingNumber}
                  onChange={(e) => setFormData({ ...formData, secondaryBankRoutingNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
            Cancel
          </button>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
