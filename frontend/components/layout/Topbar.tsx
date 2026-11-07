"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { Clock as ClockIcon, Sparkles, Menu } from "lucide-react";
import NextLink from "next/link";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

/**
 * Topbar header component — Light Glassmorphism 2.0 Edition.
 */
export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const { time, date } = useCurrentTime();

  return (
    <header className="h-14 sm:h-16 bg-white/95 border-b border-slate-200/90 backdrop-blur-xl px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3 sticky top-0 z-30 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.04)]">
      {/* Menu button (mobile/tablet) + Network / Status Indicator */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden shrink-0 p-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] sm:text-xs font-bold shadow-2xs shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Authorized R&amp;D Network</span>
        </div>
        <NextLink
          href="/"
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 text-slate-700 hover:text-slate-900 text-[11px] font-semibold transition-all whitespace-nowrap"
        >
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span>Main Site</span>
        </NextLink>
      </div>

      {/* Right side widgets: Live Clock + Profile */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 shrink-0">
        {/* Live Clock — compact on tablet/medium screens, full on desktop */}
        <div className="hidden md:flex items-center gap-2 text-slate-600 font-mono text-xs bg-slate-50 border border-slate-200/90 px-2.5 sm:px-3.5 py-1.5 rounded-xl shadow-2xs shrink-0">
          <ClockIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="font-medium whitespace-nowrap hidden xl:inline">{date}</span>
          <span className="text-slate-300 hidden xl:inline">|</span>
          <span className="font-bold text-slate-900 tracking-wider whitespace-nowrap">{time}</span>
        </div>

        {/* User badge with photo and role pill */}
        <NextLink
          href="/office/profile"
          className="flex items-center gap-2 p-1 sm:pl-1 sm:pr-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-all text-slate-800 group shrink-0"
        >
          <EmployeeAvatar user={user} size="sm" shape="circle" />
          <div className="text-left hidden md:flex md:items-center md:gap-2.5 min-w-0">
            <div className="min-w-0">
              <p className="text-xs font-extrabold leading-tight text-slate-900 group-hover:text-teal-700 transition-colors whitespace-nowrap">
                {user?.fullName}
              </p>
              <p className="text-[10px] text-slate-500 font-mono font-medium whitespace-nowrap">
                {user?.employeeId}
              </p>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border ${
                isSuperAdmin
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : isAdmin
                  ? "bg-teal-50 text-teal-800 border-teal-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
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
