"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { attendanceApi, getApiErrorMessage } from "@/lib/api";
import { AdminAttendanceRecord } from "@/types";
import { X } from "lucide-react";

/**
 * Props for the {@link CorrectionModal} component.
 */
interface CorrectionModalProps {
  /** The attendance record being manually corrected. */
  record: AdminAttendanceRecord;
  /** The ISO date of the attendance record. */
  date: string;
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired upon successful mutation. */
  onSuccess: () => void;
}

/**
 * Administrative modal dialog for manual attendance adjustments.
 *
 * <p>Allows supervisors to override punch-in/out timestamps and presence status,
 * strictly enforcing a mandatory justification reason for regulatory audit logging.</p>
 */
export function CorrectionModal({
  record,
  date,
  onClose,
  onSuccess,
}: CorrectionModalProps) {
  const [checkIn, setCheckIn] = useState(record.checkInTime || "");
  const [checkOut, setCheckOut] = useState(record.checkOutTime || "");
  const [status, setStatus] = useState(record.status || "Present");
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const correctMutation = useMutation({
    mutationFn: async () => {
      if (!reason.trim()) {
        throw new Error("A reason for the correction is strictly mandatory.");
      }
      return attendanceApi.correct({
        userId: record.userId,
        date,
        checkInTime: checkIn ? (checkIn.length === 5 ? `${checkIn}:00` : checkIn) : undefined,
        checkOutTime: checkOut ? (checkOut.length === 5 ? `${checkOut}:00` : checkOut) : undefined,
        status,
        reason,
      });
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: unknown) => {
      setErrorMsg(getApiErrorMessage(err, "Failed to submit correction"));
    },
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Correct Attendance</h2>
            <p className="text-xs text-slate-400">{record.fullName} ({record.employeeId}) • {date}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Check-In Time (HH:mm)</label>
            <input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Check-Out Time (HH:mm)</label>
            <input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1">
              <span>Mandatory Reason for Correction</span>
              <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this record is being modified (logged to immutable audit trail)..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => correctMutation.mutate()}
            disabled={correctMutation.isPending}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30"
          >
            {correctMutation.isPending ? "Applying..." : "Save Correction"}
          </button>
        </div>
      </div>
    </div>
  );
}
