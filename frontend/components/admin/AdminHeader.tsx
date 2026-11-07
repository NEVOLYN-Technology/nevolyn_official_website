'use client'

import React from 'react'
import Link from 'next/link'
import { RefreshCw, ExternalLink, LogOut, Building2 } from 'lucide-react'
import { BrandWordmark } from '@/components/ui/BrandWordmark'

interface AdminHeaderProps {
  username: string
  isLoading: boolean
  onRefresh: () => void
  onLogout: () => void
  onNavigateToOffice?: () => void
}

/**
 * Sticky admin top bar — NEVOLYN light theme.
 * Frosted panel with brand lockup, live site shortcut, and session controls.
 */
export function AdminHeader({
  username,
  isLoading,
  onRefresh,
  onLogout,
  onNavigateToOffice,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="inline-flex items-center shrink-0 transition-opacity hover:opacity-80">
            <BrandWordmark size="sm" />
          </Link>
          <div className="h-4 sm:h-5 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-mono font-semibold">
              ADMIN CONTROL
            </span>
            <span className="text-xs text-muted-foreground hidden md:inline">
              Operations Dashboard
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            id="admin-refresh-btn"
            title="Refresh server data"
            className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onNavigateToOffice}
            id="admin-office-portal-btn"
            title="Open NEVOLYN Office Login Portal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-white p-2 sm:px-3 sm:py-1.5 rounded-xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 to-teal-50/80 hover:from-emerald-500 hover:to-teal-600 hover:border-transparent transition-all shadow-sm cursor-pointer"
          >
            <Building2 className="w-4 h-4 shrink-0 text-emerald-700 hover:text-white" />
            <span className="hidden sm:inline">Office Portal</span>
            <ExternalLink className="w-3 h-3 opacity-80 hidden md:inline shrink-0" />
          </button>

          <Link
            href="/"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors shadow-sm"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* User + Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-tight">{username}</p>
              <p className="text-[10px] text-emerald-600 flex items-center justify-end gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Authorized
              </p>
            </div>
            <button
              onClick={onLogout}
              id="admin-logout-btn"
              title="Log out session"
              className="p-2 rounded-xl bg-card hover:bg-red-50 border border-border hover:border-red-200 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
