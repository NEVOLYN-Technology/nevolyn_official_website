"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Loader2 } from "lucide-react";

/**
 * Protected routes layout wrapper component — Light Glassmorphism 2.0 Edition.
 *
 * <p>Enforces client-side authentication guards, renders global loading splash while
 * resolving session tokens, and mounts standard layout shells (Sidebar and Topbar).</p>
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/office/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col items-center justify-center text-slate-700">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/15 mb-4 animate-pulse">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-600">
          Loading NEVOLYN Office Environment...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900 flex relative overflow-x-hidden">
      {/* Subtle architectural ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-32 left-1/3 w-[700px] h-[420px] rounded-full bg-emerald-500/6 blur-3xl z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 right-10 w-[500px] h-[380px] rounded-full bg-slate-400/10 blur-3xl z-0"
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 lg:ml-72 flex flex-col min-h-screen relative z-10">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8 overflow-x-hidden grid-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
