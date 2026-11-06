"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, getApiErrorMessage } from "@/lib/api";
import { KeyRound, CheckCircle, AlertCircle, Landmark } from "lucide-react";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

/**
 * ProfilePage component.
 *
 * Provides personal account profile details, banking information, and self-service credential management:
 * - Displays active session information (name, role, employee ID, designation, email, bank details).
 * - Secure self-service password update form with client validation and error handling.
 *
 * @returns {React.ReactElement} The rendered user profile and security page.
 */
export default function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword.length < 6) {
      setStatusMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmPassword });
      setStatusMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: getApiErrorMessage(err, "Failed to update password."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile &amp; Security Center</h1>
        <p className="text-xs text-slate-400 mt-1">
          View personal identity details, registered bank account information, and manage your security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Identity & Bank Details */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3.5 border-b border-slate-800 pb-3">
              <EmployeeAvatar user={user} size="lg" shape="rounded" />
              <div>
                <h2 className="text-base font-bold text-white">{user?.fullName}</h2>
                <p className="text-xs text-slate-400">@{user?.username}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Employee ID</span>
                <span className="font-mono font-bold text-cyan-400">{user?.employeeId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Designation</span>
                <span className="font-medium text-white">{user?.designation || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-200">{user?.email || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Phone</span>
                <span className="font-mono text-slate-200">{user?.phone || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Access Role</span>
                <span className="font-semibold text-slate-300 uppercase">{user?.role}</span>
              </div>
            </div>
          </div>

          {/* Bank Account 1 (Primary) Card */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Landmark className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Bank Account 1 — Primary Payroll</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Bank Name</span>
                <span className="font-medium text-white">{user?.bankName || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Account Holder</span>
                <span className="font-medium text-slate-200">{user?.bankAccountName || user?.fullName || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Account Number</span>
                <span className="font-mono font-bold text-cyan-400">{user?.bankAccountNumber || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Branch Name</span>
                <span className="font-medium text-slate-200">{user?.bankBranch || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Routing / SWIFT</span>
                <span className="font-mono text-slate-300">{user?.bankRoutingNumber || "Not set"}</span>
              </div>
            </div>
          </div>

          {/* Bank Account 2 (Secondary) Card */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Landmark className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Bank Account 2 — Secondary / Alternate</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Bank Name</span>
                <span className="font-medium text-white">{user?.secondaryBankName || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Account Holder</span>
                <span className="font-medium text-slate-200">
                  {user?.secondaryBankAccountName || user?.fullName || "Not set"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Account Number</span>
                <span className="font-mono font-bold text-indigo-400">
                  {user?.secondaryBankAccountNumber || "Not set"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Branch Name</span>
                <span className="font-medium text-slate-200">{user?.secondaryBankBranch || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Routing / SWIFT</span>
                <span className="font-mono text-slate-300">{user?.secondaryBankRoutingNumber || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Change Employee Password</h2>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Update your personal individual employee password. Shared Admin &amp; Super Admin tier passwords are locked at the server infrastructure level and cannot be modified from this portal.
          </p>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === "success"
                  ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                  : "bg-rose-500/15 border border-rose-500/25 text-rose-400"
              }`}
            >
              {statusMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">New Password (min 6 characters)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition disabled:opacity-50 mt-2"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
