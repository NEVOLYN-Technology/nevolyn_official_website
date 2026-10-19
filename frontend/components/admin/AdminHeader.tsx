'use client'

import React from 'react'
import Link from 'next/link'
import { RefreshCw, ExternalLink, LogOut } from 'lucide-react'
import { BrandWordmark } from '@/components/ui/BrandWordmark'

interface AdminHeaderProps {
  username: string
  isLoading: boolean
  onRefresh: () => void
  onLogout: () => void
}

/**
 * Sticky admin top bar — NEVOLYN light theme.
 * Frosted panel with brand lockup, live site shortcut, and session controls.
 */
export function AdminHeader({ username, isLoading, onRefresh, onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center shrink-0 transition-opacity hover:opacity-80">
            <BrandWordmark size="sm" />
          </Link>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-mono font-semibold">
              ADMIN CONTROL
            </span>
            <span className="text-xs text-muted-foreground hidden md:inline">
              Operations Dashboard
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            id="admin-refresh-btn"
            title="Refresh server data"
            className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors shadow-sm"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* User + Logout */}
          <div className="flex items-center gap-2.5 pl-1">
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
