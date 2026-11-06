"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { Clock as ClockIcon } from "lucide-react";
import NextLink from "next/link";

/**
 * Topbar header component.
 *
 * <p>Renders active network status badges, live digital clock synchronized with local time,
 * and user profile quick-links.</p>
 */
export function Topbar() {
  const { user } = useAuth();
  const { time, date } = useCurrentTime();

  return (
    <header className="h-16 bg-[#0b0f19]/95 border-b-2 border-red-500/80 backdrop-blur-xl px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-lg shadow-black/40">
      {/* Network / Status Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide">Authorized R&D Network</span>
        </div>
      </div>

      {/* Right side widgets: Live Clock + Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2.5 text-slate-300 font-mono text-xs bg-[#111827] border border-[#374151] px-3.5 py-1.5 rounded-lg shadow-inner">
          <ClockIcon className="w-3.5 h-3.5 text-red-400" />
          <span>{date}</span>
          <span className="text-slate-600">|</span>
          <span className="font-semibold text-white tracking-wider">{time}</span>
        </div>

        {/* User badge with role pill */}
        <NextLink
          href="/profile"
          className="flex items-center gap-3 pl-2 pr-3 py-1 rounded-full hover:bg-[#111827] border border-transparent hover:border-[#374151] transition-all text-slate-200 group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-red-500/30">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="text-left hidden sm:flex sm:items-center sm:gap-2">
            <div>
              <p className="text-xs font-semibold leading-tight text-white group-hover:text-red-300 transition-colors">{user?.fullName}</p>
              <p className="text-[10px] text-slate-400 font-mono">{user?.employeeId}</p>
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
              user?.role === "admin" 
                ? "bg-red-500/15 text-red-400 border-red-500/30" 
                : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
            }`}>
              {user?.role}
            </span>
          </div>
        </NextLink>
      </div>
    </header>
  );
}
