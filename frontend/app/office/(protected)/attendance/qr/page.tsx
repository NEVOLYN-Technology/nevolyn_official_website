"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import { QrCode, Server, Wifi, ShieldCheck } from "lucide-react";

/**
 * LAN QR attendance station kiosk display page.
 *
 * <p>Renders a high-resolution QR code dynamically resolving the local office LAN check-in URL
 * for physical arrival kiosks at office reception.</p>
 */
export default function QrDisplayPage() {
  const { data: qrInfo, isLoading } = useQuery({
    queryKey: ["qr-info"],
    queryFn: async () => {
      const res = await attendanceApi.getQrInfo();
      return res.data;
    },
  });

  const attendanceUrl = qrInfo?.attendanceUrl || "http://192.168.68.1:8080/attendance";

  // Quick SVG QR code visual presentation
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(attendanceUrl)}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <QrCode className="w-6 h-6 text-cyan-400" />
          <span>LAN Check-In Station QR Display</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Place this screen at the entrance. Staff members connect to the office Wi-Fi and scan to check in.
        </p>
      </div>

      <div className="p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl flex flex-col items-center space-y-6">
        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl shadow-xl shadow-cyan-500/10">
          {isLoading ? (
            <div className="w-64 h-64 bg-slate-200 animate-pulse rounded-xl" />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={qrCodeApiUrl} alt="Attendance QR Code" className="w-64 h-64 rounded-lg" />
          )}
        </div>

        {/* Network & URL Info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Wifi className="w-3.5 h-3.5" />
            <span>Authorized Office R&D Wi-Fi Only</span>
          </div>

          <p className="font-mono text-xs text-cyan-400 font-bold tracking-wider">
            {attendanceUrl}
          </p>
        </div>

        {/* Server Metadata */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-4 border-t border-slate-800 text-left text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-bold flex items-center gap-1.5 mb-1">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Server Host IP</span>
            </span>
            <span className="font-mono font-semibold text-white">{qrInfo?.serverIp || "127.0.0.1"}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Port Number</span>
            </span>
            <span className="font-mono font-semibold text-white">{qrInfo?.serverPort || "8080"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
