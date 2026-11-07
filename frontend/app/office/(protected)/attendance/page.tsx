"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { attendanceApi, getApiErrorMessage } from "@/lib/api";
import { AttendanceRecord } from "@/types";
import {
  Clock,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  QrCode,
  Camera,
  X,
  Wifi,
  Search,
  Download,
  Filter,
  FileSpreadsheet,
  Lock,
} from "lucide-react";

// Modal dialog that opens the camera to scan the office entrance QR code
function QrCameraScannerModal({
  onClose,
  onPunch,
  isPending,
}: {
  onClose: () => void;
  onPunch: () => void;
  isPending: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let animFrame: number;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Native browser QR code detection where supported
        if (typeof window !== "undefined" && "BarcodeDetector" in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
            const scanLoop = async () => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                try {
                  const codes = await detector.detect(videoRef.current);
                  if (codes.length > 0) {
                    const raw = codes[0].rawValue || "";
                    if (raw.includes("punch=office_qr") || raw.includes("attendance")) {
                      onPunch();
                      return;
                    }
                  }
                } catch {
                  // Ignore frame detection errors
                }
              }
              animFrame = requestAnimationFrame(scanLoop);
            };
            animFrame = requestAnimationFrame(scanLoop);
          } catch {
            // Ignore BarcodeDetector construct errors
          }
        }
      } catch (err: any) {
        setStreamError(err?.message || "Camera access denied or camera not found.");
      }
    };

    startCamera();

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onPunch]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Scan Office Entrance QR</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {streamError ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
            <p className="font-bold">Camera unavailable:</p>
            <p>{streamError}</p>
            <p className="text-[11px] text-slate-600">
              Point your phone camera at the QR code screen at the office entrance to open and punch.
            </p>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 border-2 border-teal-400/80 rounded-2xl m-8 pointer-events-none animate-pulse flex items-center justify-center">
              <span className="text-[10px] text-teal-200 font-mono tracking-wider uppercase bg-black/60 px-2 py-0.5 rounded">
                Align QR Code in frame
              </span>
            </div>
          </div>
        )}

        <div className="text-center space-y-2 pt-1">
          <p className="text-xs text-slate-500 font-medium">
            Scan the QR code displayed at the entrance while connected to office Wi-Fi.
          </p>
          <button
            onClick={onPunch}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            {isPending ? "Verifying Office Punch..." : "Confirm Punch via Entrance QR"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttendancePageContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDateStr, setCurrentDateStr] = useState<string>("");
  const [elapsedDuration, setElapsedDuration] = useState<string>("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const hasAutoPunchedRef = useRef(false);

  // Live real-time digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: today, isLoading: isTodayLoading } = useQuery<AttendanceRecord | null>({
    queryKey: ["attendance-today"],
    queryFn: async () => {
      const res = await attendanceApi.getToday();
      const raw: any = res.data;
      return (raw?.data ?? raw) as AttendanceRecord | null;
    },
  });

  const { data: rawHistory, isLoading: isHistoryLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendance-history"],
    queryFn: async () => {
      const res = await attendanceApi.getHistory();
      const raw: any = res.data;
      const list = raw?.data ?? raw;
      return Array.isArray(list) ? list : [];
    },
  });

  const history = Array.isArray(rawHistory) ? rawHistory : [];

  // Elapsed timer when employee is currently inside
  useEffect(() => {
    if (!today?.checkInTime || today?.checkOutTime) {
      setElapsedDuration("");
      return;
    }

    const calcElapsed = () => {
      try {
        const [h, m, s] = today.checkInTime!.split(":").map(Number);
        const checkInDate = new Date();
        checkInDate.setHours(h, m, s || 0, 0);

        const now = new Date();
        const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
        const diffSecs = Math.floor(diffMs / 1000);
        const hrs = Math.floor(diffSecs / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;
        setElapsedDuration(
          `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`
        );
      } catch {
        setElapsedDuration("");
      }
    };

    calcElapsed();
    const timer = setInterval(calcElapsed, 1000);
    return () => clearInterval(timer);
  }, [today?.checkInTime, today?.checkOutTime]);

  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(),
    onSuccess: () => {
      setErrorMsg(null);
      setIsScannerOpen(false);
      setSuccessMsg("Arrival punch verified via office network.");
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-history"] });
    },
    onError: (err: any) => {
      setIsScannerOpen(false);
      setErrorMsg(getApiErrorMessage(err, "Network Verification Failed: Must be connected to office Wi-Fi."));
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => attendanceApi.checkOut(),
    onSuccess: () => {
      setErrorMsg(null);
      setIsScannerOpen(false);
      setSuccessMsg("Departure punch verified via office network.");
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-history"] });
    },
    onError: (err: any) => {
      setIsScannerOpen(false);
      setErrorMsg(getApiErrorMessage(err, "Network Verification Failed: Must be connected to office Wi-Fi."));
    },
  });

  const hasCheckedIn = !!today?.checkInTime;
  const hasCheckedOut = !!today?.checkOutTime;

  // Automated punch execution when an employee scans the office physical QR code with phone camera
  useEffect(() => {
    if (!today && isTodayLoading) return;
    const punchParam = searchParams.get("punch");
    if (punchParam === "office_qr" && !hasAutoPunchedRef.current) {
      hasAutoPunchedRef.current = true;
      if (!hasCheckedIn) {
        checkInMutation.mutate();
      } else if (!hasCheckedOut) {
        checkOutMutation.mutate();
      }
      router.replace("/office/attendance");
    }
  }, [today, isTodayLoading, hasCheckedIn, hasCheckedOut, searchParams, router]);

  const handleScannerPunch = () => {
    if (!hasCheckedIn) {
      checkInMutation.mutate();
    } else if (!hasCheckedOut) {
      checkOutMutation.mutate();
    }
  };

  // Available months from history records
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    history.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.substring(0, 7)); // YYYY-MM
      }
    });
    return Array.from(set).sort().reverse();
  }, [history]);

  // Filtered history records
  const filteredHistory = useMemo(() => {
    return history.filter((r) => {
      if (monthFilter !== "all" && !r.date.startsWith(monthFilter)) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          r.date.toLowerCase().includes(query) ||
          (r.status && r.status.toLowerCase().includes(query)) ||
          (r.lateStatus && r.lateStatus.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [history, monthFilter, searchTerm]);

  // Overview calculations
  const totalDaysLogged = history.length;
  const onTimeCount = history.filter((h) => h.lateStatus === "On Time").length;
  const onTimeRate = totalDaysLogged > 0 ? Math.round((onTimeCount / totalDaysLogged) * 100) : 100;

  const filteredTotalHours = filteredHistory.reduce(
    (acc, r) => acc + (Number(r.totalHours) || 0),
    0
  );
  const filteredOnTimeCount = filteredHistory.filter((r) => r.lateStatus === "On Time").length;
  const filteredOnTimeRate =
    filteredHistory.length > 0 ? Math.round((filteredOnTimeCount / filteredHistory.length) * 100) : 100;

  // CSV Export for employee's own records
  const exportCsv = () => {
    if (filteredHistory.length === 0) return;
    const headers = ["Date", "Check-In", "Check-Out", "Hours", "Late Status", "Early Checkout", "Status"];
    const rows = filteredHistory.map((r) => [
      r.date,
      r.checkInTime || "",
      r.checkOutTime || "",
      r.totalHours || 0,
      r.lateStatus || "On Time",
      r.earlyCheckout || "No",
      r.status || "Present",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_records_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Scanner Modal */}
      {isScannerOpen && (
        <QrCameraScannerModal
          onClose={() => setIsScannerOpen(false)}
          onPunch={handleScannerPunch}
          isPending={checkInMutation.isPending || checkOutMutation.isPending}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800">
              HRM &amp; Time Tracking
            </span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              Office Wi-Fi Geofence
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-teal-600" />
            <span>Attendance Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Entrance QR scan verification, live shift tracking, and punctuality records.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 inline-flex items-center gap-1.5 sm:gap-2 transition cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-100 shrink-0" />
            <span className="hidden sm:inline">Scan Entrance QR</span>
            <span className="sm:hidden">Scan QR</span>
          </button>
          <button
            onClick={exportCsv}
            disabled={filteredHistory.length === 0}
            className="px-3 sm:px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-2xs inline-flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Attendance Terminal Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_32px_-10px_rgba(15,23,42,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative items-center">
          {/* Left: Real-time clock & shift status */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{currentDateStr || "Loading date..."}</span>
            </div>

            <div className="font-mono text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              {currentTime || "--:--:--"}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {hasCheckedIn ? (
                hasCheckedOut ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Daily Shift Completed</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    <span>In-House Active Shift</span>
                    {elapsedDuration && (
                      <span className="font-mono text-[11px] text-sky-700 font-extrabold pl-1.5 border-l border-sky-200">
                        {elapsedDuration}
                      </span>
                    )}
                  </div>
                )
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Not Clocked In Yet</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Geofenced Office LAN Verification</span>
              </div>
            </div>
          </div>

          {/* Right: QR Code Punch Terminal */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {hasCheckedIn && hasCheckedOut ? (
              <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-emerald-950 text-sm">Shift Completed for Today</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Arrival: <span className="font-mono font-bold">{today?.checkInTime}</span> &bull; Departure:{" "}
                    <span className="font-mono font-bold">{today?.checkOutTime}</span>
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200">
                  <span>Logged: {today?.totalHours} hrs</span>
                </div>
              </div>
            ) : hasCheckedIn ? (
              <div className="p-6 rounded-2xl bg-sky-50/80 border border-sky-200/90 text-center space-y-3.5">
                <div className="flex items-center justify-center gap-2 text-sky-950 font-extrabold text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                  <span>Active in-house shift</span>
                </div>
                <p className="text-xs text-slate-600">
                  Checked in at <span className="font-mono font-bold text-slate-900">{today?.checkInTime}</span>. Scan the entrance QR code upon leaving to record checkout.
                </p>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition shadow-md shadow-slate-900/20 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  <Camera className="w-4 h-4 text-sky-400" />
                  <span>Scan Entrance QR to Check Out</span>
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 text-center space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/90 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">Entrance QR Scan Required</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Scan the entrance QR code while connected to office Wi-Fi to verify arrival.
                  </p>
                </div>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  <Camera className="w-4 h-4 text-emerald-200" />
                  <span>Scan Entrance QR Code</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Check-In */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
            Arrival Time
          </span>
          <div className="text-lg sm:text-2xl font-mono font-extrabold text-slate-900">
            {today?.checkInTime || "--:--"}
          </div>
          <div>
            {today?.lateStatus ? (
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  today.lateStatus === "On Time"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {today.lateStatus}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Pending scan</span>
            )}
          </div>
        </div>

        {/* Metric 2: Check-Out */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
            Departure Time
          </span>
          <div className="text-lg sm:text-2xl font-mono font-extrabold text-slate-900">
            {today?.checkOutTime || "--:--"}
          </div>
          <div>
            {today?.earlyCheckout ? (
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  today.earlyCheckout === "No"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {today.earlyCheckout === "Yes" ? "Early Departure" : "Standard Exit"}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">
                {hasCheckedIn ? "Active shift" : "Pending arrival"}
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Logged Hours */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
            Logged Hours
          </span>
          <div className="text-lg sm:text-2xl font-mono font-extrabold text-teal-700">
            {today?.totalHours ? `${today.totalHours} hrs` : "0.00 hrs"}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, ((Number(today?.totalHours) || 0) / 8) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 4: Punctuality */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
            Punctuality Score
          </span>
          <div className="text-lg sm:text-2xl font-mono font-extrabold text-emerald-700 flex items-center gap-1.5">
            <span>{onTimeRate}%</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {onTimeCount} of {totalDaysLogged} shifts on-time
          </p>
        </div>
      </div>

      {/* Unified Comprehensive Attendance Records & History (Read-Only) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_32px_-10px_rgba(15,23,42,0.06)] space-y-6">
        {/* Title and Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Attendance Records &amp; History
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" />
                Read-Only
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Verified chronological log of all your office arrivals, departures, and accredited work hours.
            </p>
          </div>

          {/* Search & Month Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search date or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>

            {/* Month Filter Dropdown */}
            <div className="relative">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition appearance-none cursor-pointer"
              >
                <option value="all">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Summary Mini-Strip */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Filtered Shifts
            </span>
            <span className="text-base font-extrabold text-slate-900 font-mono">
              {filteredHistory.length}
            </span>
            <span className="text-[11px] text-slate-500 font-medium ml-1">days</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Hours
            </span>
            <span className="text-base font-extrabold text-teal-700 font-mono">
              {filteredTotalHours.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium ml-1">hrs</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Filtered On-Time
            </span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">
              {filteredOnTimeRate}%
            </span>
            <span className="text-[11px] text-slate-500 font-medium ml-1">
              ({filteredOnTimeCount}/{filteredHistory.length})
            </span>
          </div>
        </div>

        {/* Table of Records */}
        {isHistoryLoading ? (
          <div className="space-y-3 py-6">
            <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
            <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
            <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No attendance records found</p>
            <p className="text-slate-400">
              {searchTerm || monthFilter !== "all"
                ? "Try clearing your search filter or selecting another month."
                : "Scan the office entrance QR code when arriving to record your shift."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile / Small Tablet Card View (<768px) */}
            <div className="md:hidden space-y-3">
              {filteredHistory.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {record.date}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {record.lateStatus && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            record.lateStatus === "On Time"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {record.lateStatus}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          record.status === "Present"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">In</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {record.checkInTime || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Out</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {record.checkOutTime || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Duration</span>
                      <span className="font-mono font-extrabold text-teal-700 text-xs">
                        {record.totalHours ? `${record.totalHours}h` : "0h"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="font-medium">
                      {record.earlyCheckout === "Yes" ? (
                        <span className="text-amber-700 font-bold">Early Departure</span>
                      ) : (
                        "Standard Exit"
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>Office LAN</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Tabular View (>=768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3.5 pl-3">Date</th>
                    <th className="pb-3.5 px-3">Arrival (In)</th>
                    <th className="pb-3.5 px-3">Departure (Out)</th>
                    <th className="pb-3.5 px-3">Duration</th>
                    <th className="pb-3.5 px-3">Punctuality</th>
                    <th className="pb-3.5 px-3">Departure Status</th>
                    <th className="pb-3.5 px-3">Status</th>
                    <th className="pb-3.5 pr-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-3 font-semibold text-slate-900 font-mono">
                        {record.date}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">
                        {record.checkInTime || "—"}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">
                        {record.checkOutTime || "—"}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-teal-700">
                        {record.totalHours ? `${record.totalHours} hrs` : "0.00 hrs"}
                      </td>
                      <td className="py-3.5 px-3">
                        {record.lateStatus ? (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              record.lateStatus === "On Time"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {record.lateStatus}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {record.earlyCheckout ? (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              record.earlyCheckout === "No"
                                ? "bg-slate-100 text-slate-600 border border-slate-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {record.earlyCheckout === "Yes" ? "Early Departure" : "Standard"}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            record.status === "Present"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          <span>Office LAN</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Read-Only Governance Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
          <p>
            <span className="font-bold text-slate-800">Administrative Policy:</span> Attendance
            records are recorded automatically via office network verification and are strictly
            read-only for staff. If you require an adjustment due to network outage or forgotten punch,
            please contact an Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
          Loading Attendance Center...
        </div>
      }
    >
      <AttendancePageContent />
    </Suspense>
  );
}
