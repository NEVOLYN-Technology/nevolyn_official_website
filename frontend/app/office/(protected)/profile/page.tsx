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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Profile &amp; Security Center</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          View personal identity details, registered bank account information, and manage your security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Identity & Bank Details */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] space-y-4">
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3">
              <EmployeeAvatar user={user} size="lg" shape="rounded" />
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{user?.fullName}</h2>
                <p className="text-xs text-slate-500 font-mono">@{user?.username}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Employee ID</span>
                <span className="font-mono font-bold text-teal-700">{user?.employeeId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Designation</span>
                <span className="font-bold text-slate-900">{user?.designation || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Email</span>
                <span className="font-semibold text-slate-800">{user?.email || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Phone</span>
                <span className="font-mono font-semibold text-slate-800">{user?.phone || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-semibold">Access Role</span>
                <span className="font-bold text-teal-800 uppercase">{user?.role}</span>
              </div>
            </div>
          </div>

          {/* Bank Account 1 (Primary) Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Landmark className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-extrabold text-slate-900">Bank Account 1 — Primary Payroll</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Bank Name</span>
                <span className="font-bold text-slate-900">{user?.bankName || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Account Holder</span>
                <span className="font-semibold text-slate-800">{user?.bankAccountName || user?.fullName || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Account Number</span>
                <span className="font-mono font-bold text-teal-700">{user?.bankAccountNumber || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Branch Name</span>
                <span className="font-semibold text-slate-800">{user?.bankBranch || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-semibold">Routing / SWIFT</span>
                <span className="font-mono font-semibold text-slate-700">{user?.bankRoutingNumber || "Not set"}</span>
              </div>
            </div>
          </div>

          {/* Bank Account 2 (Secondary) Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Landmark className="w-5 h-5 text-slate-600" />
              <h2 className="text-base font-extrabold text-slate-900">Bank Account 2 — Secondary / Alternate</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Bank Name</span>
                <span className="font-bold text-slate-900">{user?.secondaryBankName || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Account Holder</span>
                <span className="font-semibold text-slate-800">
                  {user?.secondaryBankAccountName || user?.fullName || "Not set"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Account Number</span>
                <span className="font-mono font-bold text-slate-800">
                  {user?.secondaryBankAccountNumber || "Not set"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Branch Name</span>
                <span className="font-semibold text-slate-800">{user?.secondaryBankBranch || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-semibold">Routing / SWIFT</span>
                <span className="font-mono font-semibold text-slate-700">{user?.secondaryBankRoutingNumber || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-extrabold text-slate-900">Change Employee Password</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Update your personal individual employee password. Shared Admin &amp; Super Admin tier passwords are locked at the server infrastructure level and cannot be modified from this portal.
          </p>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMsg.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}
            >
              {statusMsg.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">New Password (min 6 characters)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/15 transition disabled:opacity-50 mt-2"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
