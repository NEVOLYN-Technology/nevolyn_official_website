"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersApi, getApiErrorMessage } from "@/lib/api";
import { User } from "@/types";
import { X } from "lucide-react";

/**
 * Props for the {@link ResetPasswordModal} component.
 */
interface ResetPasswordModalProps {
  /** The target user whose password will be reset. */
  user: User;
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired upon successful password reset. */
  onSuccess: () => void;
}

/**
 * Administrative modal dialog allowing managers to force-reset an employee's password.
 */
export function ResetPasswordModal({ user, onClose, onSuccess }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => usersApi.resetPassword(user.id, newPassword),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    },
    onError: (err: unknown) => {
      setErrorMsg(getApiErrorMessage(err, "Failed to reset password"));
    },
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-sm w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Reset Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Set a new password for <span className="font-bold text-slate-900">{user.fullName}</span> (@{user.username}). Minimum 6 characters.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            Password reset successfully!
          </div>
        )}

        <div>
          <label className="block text-slate-600 mb-1 text-xs font-bold">New Password</label>
          <input
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900 font-mono"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
            Cancel
          </button>
          <button
            onClick={() => resetMutation.mutate()}
            disabled={newPassword.length < 6 || resetMutation.isPending}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold"
          >
            {resetMutation.isPending ? "Resetting..." : "Apply Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}
