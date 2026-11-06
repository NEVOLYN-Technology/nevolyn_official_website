"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import type { ApiResponse } from "@/types";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

/**
 * Authentication login page component.
 *
 * <p>Provides secure credentials entry with Zod schema validation, inline error messaging,
 * password visibility toggling, and redirection to authorized dashboard upon successful login.</p>
 */
export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: LoginForm) => login(username, password),
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: ApiResponse<null> }; message?: string };
      setServerError(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Invalid username or password"
      );
    },
  });

  function onSubmit(data: LoginForm) {
    setServerError(null);
    loginMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] relative overflow-hidden py-12">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 mb-4 shadow-xl shadow-red-600/30 border border-red-400/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Nevolyn Office Management
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide">
            Enterprise Operations & R&D Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-[#374151] rounded-2xl p-8 shadow-2xl relative overflow-hidden border-t-4 border-t-red-500">
          <h2 className="text-lg font-bold text-white mb-5">Sign in to your account</h2>

          {/* Network notice */}
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
            <span className="text-base">🔒</span>
            <span className="leading-relaxed">Authorized R&D access only. Employee punch terminal is active within corporate network.</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Username or Employee ID
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register("username")}
                className="w-full px-4 py-2.5 bg-[#1f2937] border border-[#374151] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                placeholder="e.g. admin or EMP-001"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full px-4 py-2.5 bg-[#1f2937] border border-[#374151] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium space-y-1">
                <p className="font-bold">⚠️ {serverError}</p>
                {serverError.toLowerCase().includes("network") && (
                  <p className="text-slate-300 text-[11px]">
                    Unable to reach the authentication server. Please check your network connection or contact IT support.
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-150 shadow-lg shadow-red-600/30 text-sm"
              id="login-submit-button"
            >
              {loginMutation.isPending ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          {/* Corporate Support Notice */}
          <div className="mt-6 pt-5 border-t border-[#374151] text-center">
            <p className="text-xs text-slate-400">
              Need account provisioning or credential reset?
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Contact your System Administrator or HR Department. Self-registration is restricted.
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} Nevolyn Office Management. All rights reserved.
        </p>
      </div>
    </div>
  );
}
