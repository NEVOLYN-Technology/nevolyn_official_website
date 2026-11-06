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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Correct Attendance</h2>
            <p className="text-xs text-slate-500 font-medium">{record.fullName} ({record.employeeId}) • {date}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Check-In Time (HH:mm)</label>
            <input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-bold">Check-Out Time (HH:mm)</label>
            <input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-bold">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold flex items-center gap-1">
              <span>Mandatory Reason for Correction</span>
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this record is being modified (logged to immutable audit trail)..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() => correctMutation.mutate()}
            disabled={correctMutation.isPending}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15"
          >
            {correctMutation.isPending ? "Applying..." : "Save Correction"}
          </button>
        </div>
      </div>
    </div>
  );
}
