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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Reset Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Set a new password for <span className="font-semibold text-white">{user.fullName}</span> (@{user.username}). Minimum 6 characters.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            Password reset successfully!
          </div>
        )}

        <div>
          <label className="block text-slate-400 mb-1 text-xs font-medium">New Password</label>
          <input
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
            Cancel
          </button>
          <button
            onClick={() => resetMutation.mutate()}
            disabled={newPassword.length < 6 || resetMutation.isPending}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold"
          >
            {resetMutation.isPending ? "Resetting..." : "Apply Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}
