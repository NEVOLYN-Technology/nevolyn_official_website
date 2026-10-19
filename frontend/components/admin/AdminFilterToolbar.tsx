'use client'

import React from 'react'
import { Users, Inbox, ArrowUpDown, Search, Filter, X } from 'lucide-react'

const INQUIRY_STATUS_OPTIONS = ['NEW', 'IN_REVIEW', 'CONTACTED', 'CLOSED'] as const
const APPLICATION_STATUS_OPTIONS = ['PENDING', 'IN_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED'] as const

interface AdminFilterToolbarProps {
  activeTab: 'applications' | 'inquiries'
  setActiveTab: (tab: 'applications' | 'inquiries') => void
  applicationsCount: number
  inquiriesCount: number
  searchTerm: string
  setSearchTerm: (q: string) => void
  applicationStatusFilter: string
  setApplicationStatusFilter: (s: string) => void
  inquiryStatusFilter: string
  setInquiryStatusFilter: (s: string) => void
  sortOrder: 'desc' | 'asc'
  setSortOrder: (o: 'desc' | 'asc') => void
}

/**
 * Tab switcher + search + status filter chips — NEVOLYN light theme.
 */
export function AdminFilterToolbar({
  activeTab,
  setActiveTab,
  applicationsCount,
  inquiriesCount,
  searchTerm,
  setSearchTerm,
  applicationStatusFilter,
  setApplicationStatusFilter,
  inquiryStatusFilter,
  setInquiryStatusFilter,
  sortOrder,
  setSortOrder,
}: AdminFilterToolbarProps) {
  return (
    <>
      {/* Tab Navigation & Sort */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-1.5 bg-muted p-1 rounded-2xl border border-border">
          {/* Applications Tab */}
          <button
            onClick={() => { setActiveTab('applications'); setSearchTerm('') }}
            id="admin-tab-applications"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-card text-foreground shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeTab === 'applications' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>Job Applications</span>
            <span
              className={`px-1.5 rounded-md text-[10px] font-mono font-bold ${
                activeTab === 'applications' ? 'bg-primary/10 text-primary' : 'bg-background text-muted-foreground'
              }`}
            >
              {applicationsCount}
            </span>
          </button>

          {/* Inquiries Tab */}
          <button
            onClick={() => { setActiveTab('inquiries'); setSearchTerm('') }}
            id="admin-tab-inquiries"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-card text-foreground shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Inbox className={`w-3.5 h-3.5 ${activeTab === 'inquiries' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>Contact Inquiries</span>
            <span
              className={`px-1.5 rounded-md text-[10px] font-mono font-bold ${
                activeTab === 'inquiries' ? 'bg-primary/10 text-primary' : 'bg-background text-muted-foreground'
              }`}
            >
              {inquiriesCount}
            </span>
          </button>
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          id="admin-sort-toggle"
          className="px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
          <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
        </button>
      </div>

      {/* Search + Status Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'applications'
                ? 'Search name, email, phone, reference code…'
                : 'Search name, email, subject, message…'
            }
            className="w-full pl-10 pr-9 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter chips */}
        <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {activeTab === 'applications'
            ? (['ALL', ...APPLICATION_STATUS_OPTIONS] as string[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setApplicationStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    applicationStatusFilter === st
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card text-muted-foreground border border-border hover:text-foreground'
                  }`}
                >
                  {st}
                </button>
              ))
            : (['ALL', ...INQUIRY_STATUS_OPTIONS] as string[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setInquiryStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    inquiryStatusFilter === st
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card text-muted-foreground border border-border hover:text-foreground'
                  }`}
                >
                  {st}
                </button>
              ))}
        </div>
      </div>
    </>
  )
}
