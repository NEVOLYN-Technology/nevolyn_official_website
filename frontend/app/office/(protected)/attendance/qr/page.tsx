"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import { QrCode, Server, Wifi, ShieldCheck } from "lucide-react";

export default function QrDisplayPage() {
  const { data: qrInfo, isLoading } = useQuery({
    queryKey: ["qr-info"],
    queryFn: async () => {
      const res = await attendanceApi.getQrInfo();
      return res.data;
    },
  });

  const attendanceUrl = qrInfo?.attendanceUrl || "https://nevolyn.com/office/attendance";
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(attendanceUrl)}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2.5">
          <QrCode className="w-6 h-6 text-teal-600" />
          <span>LAN Check-In Station QR Display</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Place this screen at the entrance. Staff members connect to the office Wi-Fi and scan to check in.
        </p>
      </div>

      <div className="p-10 rounded-3xl bg-white border border-slate-200/90 shadow-[0_14px_40px_-12px_rgba(15,23,42,0.08)] flex flex-col items-center space-y-6 relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-teal-600 to-emerald-600 absolute top-0 left-0" />
        {/* QR Code Container */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-lg">
          {isLoading ? (
            <div className="w-64 h-64 bg-slate-100 animate-pulse rounded-xl" />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={qrCodeApiUrl} alt="Attendance QR Code" className="w-64 h-64 rounded-lg" />
          )}
        </div>

        {/* Network & URL Info */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized Office R&amp;D Wi-Fi Only</span>
          </div>

          <p className="font-mono text-xs text-teal-800 font-bold tracking-wider bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-200">
            {attendanceUrl}
          </p>
        </div>

        {/* Server Metadata */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-4 border-t border-slate-200/80 text-left text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90">
            <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1.5 mb-1">
              <Server className="w-3.5 h-3.5 text-teal-600" />
              <span>Server Host IP</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{qrInfo?.serverIp || "127.0.0.1"}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90">
            <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Port Number</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{qrInfo?.serverPort || "8080"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
