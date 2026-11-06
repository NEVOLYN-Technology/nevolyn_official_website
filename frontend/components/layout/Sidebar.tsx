"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";

/**
 * Primary navigation sidebar component.
 *
 * <p>Renders role-differentiated navigation links for administrators vs standard employees,
 * application branding, and user logout triggers.</p>
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
    // Super Admin only
    ...(isSuperAdmin ? [{ label: "Admin Management", href: "/office/admin-management", icon: ShieldCheck }] : []),
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
    <aside className="w-64 bg-[#0b0f19] border-r border-[#1f2937] flex flex-col h-screen fixed left-0 top-0 backdrop-blur-xl z-40 text-slate-200">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[#1f2937] flex items-center justify-between">
        <NextLink href="/office/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-wide block leading-none">
              NEVOLYN
            </span>
            <span className="text-[10px] text-red-400 font-bold tracking-wider uppercase block mt-0.5">
              Office Management
            </span>
          </div>
        </NextLink>
      </div>

      {/* Role Pill */}
      <div className="px-5 py-3 border-b border-[#1f2937] bg-[#111827]/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isSuperAdmin ? "bg-purple-400 animate-pulse" :
            isAdmin ? "bg-red-400 animate-pulse" : "bg-emerald-400"
          }`} />
          <span className="text-xs font-semibold text-slate-300">
            {isSuperAdmin ? "Super Administrator" : isAdmin ? "Administrator" : "R&D Staff Member"}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1f2937] border border-[#374151] text-slate-300 uppercase tracking-wider font-mono">
          {user?.employeeId || "LAN"}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/office/dashboard" && pathname.startsWith(link.href));

          return (
            <NextLink
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                  ? "bg-gradient-to-r from-red-600/20 via-rose-600/10 to-transparent text-white border-l-4 border-red-500 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-[#111827] hover:translate-x-0.5"
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-red-400" : "text-slate-500"}`} />
              <span className="truncate">{link.label}</span>
            </NextLink>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName || "User"}</p>
            <p className="text-[11px] text-slate-400 truncate capitalize">{user?.designation || user?.role}</p>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
