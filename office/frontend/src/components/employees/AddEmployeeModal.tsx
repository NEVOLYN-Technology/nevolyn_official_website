"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersApi, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { X, Landmark } from "lucide-react";

/**
 * Props for the {@link AddEmployeeModal} component.
 */
interface AddEmployeeModalProps {
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired when the new employee is successfully registered. */
  onSuccess: () => void;
}

/**
 * Modal dialog for onboarding and provisioning new employees or administrators,
 * including personal contact details and banking information.
 */
export function AddEmployeeModal({ onClose, onSuccess }: AddEmployeeModalProps) {
  const { isSuperAdmin } = useAuth();
  const [formData, setFormData] = useState({
    employeeId: "",
    username: "",
    password: "",
    fullName: "",
    designation: "",
    joiningDate: new Date().toISOString().split("T")[0],
    phone: "",
    email: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankBranch: "",
    bankRoutingNumber: "",
    role: "employee",
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

  const addMutation = useMutation({
    mutationFn: () => usersApi.create(formData),
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => {
      setErrorMsg(getApiErrorMessage(err, "Failed to create employee"));
    },
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">
            {isSuperAdmin ? "Add New Employee or Administrator" : "Add New Employee"}
          </h2>
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
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Employee ID *</label>
            <input
              type="text"
              required
              placeholder="nev_<username>_<YYYY-MM-DD>"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Username *</label>
            <input
              type="text"
              required
              placeholder="e.g. nomrota"
              value={formData.username}
              onChange={(e) => {
                const nextUsername = e.target.value;
                setFormData({
                  ...formData,
                  username: nextUsername,
                  employeeId: isAutoEmployeeId
                    ? buildEmployeeId(nextUsername, formData.joiningDate)
                    : formData.employeeId,
                });
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fullName: e.target.value,
                  bankAccountName: formData.bankAccountName || e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Password (min 6) *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Designation</label>
            <input
              type="text"
              placeholder="e.g. AI Software Engineer"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
            <input
              type="email"
              placeholder="name@nevolyn.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
            <input
              type="text"
              placeholder="+880..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="employee">Employee</option>
              {isSuperAdmin && <option value="admin">Administrator</option>}
            </select>
            {!isSuperAdmin && (
              <p className="mt-1 text-slate-500 text-[10px]">
                Only Super Administrators can provision Admin accounts.
              </p>
            )}
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Joining Date</label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => {
                const nextDate = e.target.value;
                setFormData({
                  ...formData,
                  joiningDate: nextDate,
                  employeeId: isAutoEmployeeId
                    ? buildEmployeeId(formData.username, nextDate)
                    : formData.employeeId,
                });
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
            />
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="Name as on bank account"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1502938475610"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gulshan Branch"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-medium">Routing Number / SWIFT</label>
                <input
                  type="text"
                  placeholder="e.g. 225261729"
                  value={formData.bankRoutingNumber}
                  onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none font-mono"
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
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
          >
            {addMutation.isPending ? "Creating..." : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
