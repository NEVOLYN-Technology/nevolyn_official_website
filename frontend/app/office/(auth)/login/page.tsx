"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { BrandWordmark } from "@/components/ui/BrandWordmark";
import { ShieldCheck, Lock, User, KeyRound, ArrowRight, Sparkles } from "lucide-react";
import type { ApiResponse } from "@/types";

interface LoginForm {
  username: string;
  password: string;
}

/**
 * Authentication login page component for NEVOLYN Office Management (/office/login).
 * Styled in authentic NEVOLYN Light Glassmorphism 2.0 aesthetic.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: ({ username: u, password: p }: LoginForm) => login(u, p),
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: ApiResponse<null> }; message?: string };
      setServerError(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Invalid username/Employee ID or password"
      );
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const nextErrors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      nextErrors.username = "Username or Employee ID is required";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e8f1fb] via-[#f4f8fc] to-[#e2eefb] relative overflow-hidden py-12 px-4 grid-bg">
      {/* Luminous ambient background mesh orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-36 left-1/2 -translate-x-1/2 w-[850px] h-[480px] rounded-full bg-gradient-to-r from-sky-400/25 via-cyan-300/20 to-indigo-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-32 right-10 w-[520px] h-[420px] rounded-full bg-gradient-to-tr from-blue-400/20 to-sky-300/20 blur-3xl"
      />

      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-3 hover:opacity-90 transition-opacity"
          >
            <BrandWordmark size="md" />
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-sky-200/80 shadow-xs mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-sky-900">
              Enterprise Office &amp; R&amp;D Portal
            </span>
          </div>
        </div>

        {/* Glossy Liquid Glass Card */}
        <div className="bg-white/85 backdrop-blur-2xl border border-white/95 ring-1 ring-slate-200/70 rounded-3xl shadow-[0_24px_60px_-15px_rgba(14,165,233,0.18)] overflow-hidden">
          {/* Glossy Top Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600" />

          {/* Card Header */}
          <div className="px-8 pt-7 pb-5 border-b border-slate-200/70 bg-gradient-to-b from-sky-50/60 to-transparent">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Sign in to Workspace
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Unified Role-Tiered Access &bull; Super Admin, Admin &amp; Staff
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            {/* Security Notice Pill */}
            <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/90 to-indigo-50/70 border border-sky-200/70 text-slate-700 text-xs flex items-start gap-2.5 shadow-2xs">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">
                Enter your <strong className="text-slate-900">Username</strong> or{" "}
                <strong className="text-slate-900">Employee ID</strong> along with your role-tier or personal password.
              </span>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
                >
                  Username or Employee ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all text-sm font-medium shadow-2xs"
                    placeholder="Enter username or Employee ID"
                  />
                </div>
                {fieldErrors.username && (
                  <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all text-sm font-medium shadow-2xs"
                    placeholder="Enter Super Admin, Admin, or Employee password"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.password}</p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-1">
                  <p className="font-bold">⚠️ {serverError}</p>
                  {serverError.toLowerCase().includes("network") && (
                    <p className="text-rose-600/80 text-[11px]">
                      Unable to reach the authentication server. Please check your network connection.
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 cursor-pointer"
                id="login-submit-button"
              >
                <span>{loginMutation.isPending ? "Authenticating..." : "Sign In to Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Footer link back to website */}
            <div className="mt-6 pt-5 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
              <span>NEVOLYN Security Protocol</span>
              <Link href="/" className="font-semibold text-sky-600 hover:text-sky-700 hover:underline">
                ← Back to nevolyn.com
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
