"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { Clock as ClockIcon, Sparkles } from "lucide-react";
import NextLink from "next/link";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

/**
 * Topbar header component — Light Glassmorphism 2.0 Edition.
 */
export function Topbar() {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const { time, date } = useCurrentTime();

  return (
    <header className="h-16 bg-white/80 border-b border-slate-200/85 backdrop-blur-2xl px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-[0_4px_24px_-6px_rgba(14,165,233,0.08)]">
      {/* Network / Status Indicator */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/90 text-emerald-700 text-xs font-bold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="tracking-wide whitespace-nowrap">Authorized R&amp;D Network</span>
        </div>
        <NextLink
          href="/"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-200 text-slate-600 hover:text-sky-700 text-[11px] font-semibold transition-all whitespace-nowrap"
        >
          <Sparkles className="w-3 h-3 text-sky-500" />
          <span>Main Site</span>
        </NextLink>
      </div>

      {/* Right side widgets: Live Clock + Profile */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-2.5 text-slate-600 font-mono text-xs bg-slate-50/90 border border-slate-200/90 px-3.5 py-1.5 rounded-xl shadow-2xs shrink-0">
          <ClockIcon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="font-medium whitespace-nowrap">{date}</span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-slate-900 tracking-wider whitespace-nowrap">{time}</span>
        </div>

        {/* User badge with photo and role pill */}
        <NextLink
          href="/office/profile"
          className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 rounded-full bg-white/95 hover:bg-sky-50/60 border border-slate-200/90 hover:border-sky-300/80 shadow-2xs transition-all text-slate-800 group max-w-full"
        >
          <EmployeeAvatar user={user} size="sm" shape="circle" />
          <div className="text-left hidden sm:flex sm:items-center sm:gap-2.5 min-w-0">
            <div className="min-w-0">
              <p className="text-xs font-extrabold leading-tight text-slate-900 group-hover:text-sky-700 transition-colors whitespace-nowrap">
                {user?.fullName}
              </p>
              <p className="text-[10px] text-slate-500 font-mono font-medium whitespace-nowrap">
                {user?.employeeId}
              </p>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border ${
                isSuperAdmin
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : isAdmin
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </NextLink>
      </div>
    </header>
  );
}
