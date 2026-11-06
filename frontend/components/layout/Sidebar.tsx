"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BrandWordmark } from "@/components/ui/BrandWordmark";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";
import {
  LayoutDashboard,
  Clock,
  Users,
  FlaskConical,
  CheckSquare,
  FileText,
  GraduationCap,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  QrCode,
  User as UserIcon,
  LogOut,
  History,
  Crown,
} from "lucide-react";

/**
 * Primary navigation sidebar component — Light Glassmorphism 2.0 Edition.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();

  const adminLinks = [
    { label: "Dashboard", href: "/office/dashboard", icon: LayoutDashboard },
    { label: "My Attendance", href: "/office/attendance", icon: Clock },
    { label: "Live Attendance", href: "/office/attendance/admin", icon: Clock },
    { label: "Attendance History", href: "/office/attendance/history", icon: History },
    { label: "Employees", href: "/office/employees", icon: Users },
    { label: "R&D Projects", href: "/office/projects", icon: FlaskConical },
    { label: "Tasks", href: "/office/tasks", icon: CheckSquare },
    { label: "Work Logs", href: "/office/work-logs", icon: FileText },
    { label: "Training & Meetings", href: "/office/training", icon: GraduationCap },
    { label: "Reports", href: "/office/reports", icon: BarChart3 },
    { label: "Audit Trail", href: "/office/audit", icon: ShieldAlert },
    { label: "LAN QR Display", href: "/office/attendance/qr", icon: QrCode },
    { label: "Profile & Security", href: "/office/profile", icon: UserIcon },
    ...(isSuperAdmin
      ? [{ label: "Admin Management", href: "/office/admin-management", icon: ShieldCheck }]
      : []),
  ];

  const employeeLinks = [
    { label: "Dashboard", href: "/office/dashboard", icon: LayoutDashboard },
    { label: "My Attendance", href: "/office/attendance", icon: Clock },
    { label: "Attendance History", href: "/office/attendance/history", icon: History },
    { label: "R&D Projects", href: "/office/projects", icon: FlaskConical },
    { label: "My Tasks", href: "/office/tasks", icon: CheckSquare },
    { label: "Work Logs", href: "/office/work-logs", icon: FileText },
    { label: "Training & Meetings", href: "/office/training", icon: GraduationCap },
    { label: "Profile & Security", href: "/office/profile", icon: UserIcon },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside className="w-72 bg-white/85 backdrop-blur-2xl border-r border-slate-200/85 flex flex-col h-screen fixed left-0 top-0 z-40 text-slate-700 shadow-[4px_0_30px_-5px_rgba(14,165,233,0.08)]">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-white/95 via-sky-50/40 to-white/95">
        <NextLink href="/office/dashboard" className="flex items-center gap-2.5 group">
          <BrandWordmark size="sm" />
        </NextLink>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-100/90 text-sky-700 border border-sky-200/90 font-extrabold uppercase tracking-wider">
          Office
        </span>
      </div>

      {/* Role Pill */}
      <div className="px-4 py-3 border-b border-slate-200/75 bg-gradient-to-r from-slate-50/90 via-sky-50/50 to-indigo-50/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isSuperAdmin ? (
            <Crown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          ) : (
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                isAdmin ? "bg-sky-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
          )}
          <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
            {isSuperAdmin ? "Super Admin" : isAdmin ? "Administrator" : "Staff Member"}
          </span>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-slate-200/90 text-slate-600 font-semibold font-mono shadow-2xs whitespace-nowrap">
          @{user?.username || "staff"}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/office/dashboard" && pathname.startsWith(link.href));

          return (
            <NextLink
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-indigo-500/5 text-sky-800 border-l-4 border-sky-500 font-extrabold shadow-xs"
                  : "text-slate-600 font-semibold hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-0.5"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-sky-600" : "text-slate-400"
                }`}
              />
              <span className="truncate">{link.label}</span>
            </NextLink>
          );
        })}
      </nav>

      {/* Bottom User Area — Full name & designation never truncate out of scope */}
      <div className="p-3 border-t border-slate-200/80 bg-gradient-to-b from-slate-50/70 to-slate-100/80">
        <div className="p-3 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <EmployeeAvatar user={user} size="sm" shape="circle" />
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-extrabold text-slate-900 leading-snug break-words">
                {user?.fullName || "User"}
              </p>
              <p className="text-[10.5px] text-slate-500 font-medium leading-snug break-words mt-0.5">
                {user?.designation || user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200/70 transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
