'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, User, RefreshCw, AlertCircle } from 'lucide-react'
import { type AdminCredentials } from '@/lib/api/admin'
import { BrandWordmark } from '@/components/ui/BrandWordmark'

interface AdminLoginCardProps {
  authInput: AdminCredentials
  setAuthInput: (creds: AdminCredentials) => void
  onLogin: (e: React.FormEvent) => void
  authError: string | null
  isVerifying: boolean
}

/**
 * Authentication gate card — styled in authentic NEVOLYN light theme.
 * Engineering grid background, sky-blue brand accents, frosted card.
 */
export function AdminLoginCard({
  authInput,
  setAuthInput,
  onLogin,
  authError,
  isVerifying,
}: AdminLoginCardProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 overflow-hidden">
      {/* Engineering grid glow background */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-60"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-a) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[380px] w-[480px] rounded-full opacity-50"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-b) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 opacity-90 hover:opacity-100 transition-opacity">
            <BrandWordmark size="md" />
          </Link>
          <div className="flex items-center justify-center gap-2 mt-3">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Operations Control Centre
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-border bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">Administrator Access</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  NEVOLYN Executive Dashboard — Restricted Area
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onLogin} className="px-8 py-7 space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="admin-username" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={authInput.username}
                  onChange={(e) => setAuthInput({ ...authInput, username: e.target.value })}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={authInput.password}
                  onChange={(e) => setAuthInput({ ...authInput, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isVerifying}
              id="admin-login-submit"
              className="w-full py-3 rounded-xl bg-primary hover:bg-sky-500 disabled:opacity-60 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          This is a restricted administrative interface. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  )
}
