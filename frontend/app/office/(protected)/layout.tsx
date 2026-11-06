"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/office/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef4fb] via-[#f8fafc] to-[#e6f0fa] flex flex-col items-center justify-center text-slate-700">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/25 mb-4 animate-pulse">
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
    <div className="min-h-screen bg-gradient-to-br from-[#ecf3fa] via-[#f4f8fc] to-[#e5eff9] text-slate-800 flex relative overflow-x-hidden">
      {/* Subtle ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-32 left-1/3 w-[700px] h-[420px] rounded-full bg-sky-400/15 blur-3xl z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 right-10 w-[500px] h-[380px] rounded-full bg-indigo-400/12 blur-3xl z-0"
      />

      <Sidebar />
      <div className="flex-1 ml-72 flex flex-col min-h-screen relative z-10">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto grid-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
