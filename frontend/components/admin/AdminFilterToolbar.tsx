'use client'

import React from 'react'
import {
  Users,
  Inbox,
  ArrowUpDown,
  Search,
  Filter,
  X,
  RotateCcw,
} from 'lucide-react'
import { type ApplicationRecord, type InquiryRecord } from '@/lib/api/admin'

const INQUIRY_STATUS_OPTIONS = ['NEW', 'ACKNOWLEDGED', 'REPLIED'] as const
const APPLICATION_STATUS_OPTIONS = [
  'PENDING',
  'IN_REVIEW',
  'SHORTLISTED',
  'REJECTED',
  'HIRED',
] as const

interface AdminFilterToolbarProps {
  activeTab: 'applications' | 'inquiries'
  setActiveTab: (tab: 'applications' | 'inquiries') => void
  applications: ApplicationRecord[]
  inquiries: InquiryRecord[]
  filteredCount: number
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
 * Tab switcher + search + context-aware status filter chips — NEVOLYN light theme.
 * Displays tailored chips with live counters for either Job Applications or Contact Inquiries.
 */
export function AdminFilterToolbar({
  activeTab,
  setActiveTab,
  applications,
  inquiries,
  filteredCount,
  searchTerm,
  setSearchTerm,
  applicationStatusFilter,
  setApplicationStatusFilter,
  inquiryStatusFilter,
  setInquiryStatusFilter,
  sortOrder,
  setSortOrder,
}: AdminFilterToolbarProps) {
  // Live counts for applications
  const appCounts: Record<string, number> = {
    ALL: applications.length,
    PENDING: applications.filter((a) => a.selectionStatus === 'PENDING').length,
    IN_REVIEW: applications.filter((a) => a.selectionStatus === 'IN_REVIEW').length,
    SHORTLISTED: applications.filter((a) => a.selectionStatus === 'SHORTLISTED').length,
    HIRED: applications.filter((a) => a.selectionStatus === 'HIRED').length,
    REJECTED: applications.filter((a) => a.selectionStatus === 'REJECTED').length,
  }

  // Live counts for inquiries
  const inqCounts: Record<string, number> = {
    ALL: inquiries.length,
    NEW: inquiries.filter((i) => i.status === 'NEW' && !i.isAcknowledged).length,
    ACKNOWLEDGED: inquiries.filter(
      (i) => i.status === 'ACKNOWLEDGED' || (i.status === 'NEW' && i.isAcknowledged)
    ).length,
    REPLIED: inquiries.filter((i) => i.status === 'REPLIED').length,
  }

  const isFiltered =
    activeTab === 'applications'
      ? applicationStatusFilter !== 'ALL' || searchTerm.trim() !== ''
      : inquiryStatusFilter !== 'ALL' || searchTerm.trim() !== ''

  const handleResetFilters = () => {
    setSearchTerm('')
    if (activeTab === 'applications') {
      setApplicationStatusFilter('ALL')
    } else {
      setInquiryStatusFilter('ALL')
    }
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Tab Navigation & Sort */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-1.5 bg-muted/80 p-1 rounded-2xl border border-border">
          {/* Applications Tab */}
          <button
            onClick={() => {
              setActiveTab('applications')
              setSearchTerm('')
            }}
            id="admin-tab-applications"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-card text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users
              className={`w-3.5 h-3.5 ${
                activeTab === 'applications' ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <span>Job Applications</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                activeTab === 'applications'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-background text-muted-foreground'
              }`}
            >
              {applications.length}
            </span>
          </button>

          {/* Inquiries Tab */}
          <button
            onClick={() => {
              setActiveTab('inquiries')
              setSearchTerm('')
            }}
            id="admin-tab-inquiries"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-card text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Inbox
              className={`w-3.5 h-3.5 ${
                activeTab === 'inquiries' ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <span>Contact Inquiries</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                activeTab === 'inquiries'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-background text-muted-foreground'
              }`}
            >
              {inquiries.length}
            </span>
          </button>
        </div>

        {/* Right Tools: Result summary + Sort order */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline-block font-medium">
            Showing <strong className="text-foreground font-bold">{filteredCount}</strong> of{' '}
            {activeTab === 'applications' ? applications.length : inquiries.length} records
          </span>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            id="admin-sort-toggle"
            className="px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Toggle chronological sorting"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Search Input & Status Filter Chips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="lg:col-span-5 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'applications'
                ? 'Search candidate name, email, phone, reference code…'
                : 'Search visitor name, email, subject, message…'
            }
            className="w-full pl-10 pr-9 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="lg:col-span-7 flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {activeTab === 'applications'
            ? (['ALL', ...APPLICATION_STATUS_OPTIONS] as string[]).map((st) => {
                const isActive = applicationStatusFilter === st
                const count = appCounts[st] ?? 0
                return (
                  <button
                    key={st}
                    onClick={() => setApplicationStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary'
                        : 'bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <span>{st}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })
            : (['ALL', ...INQUIRY_STATUS_OPTIONS] as string[]).map((st) => {
                const isActive = inquiryStatusFilter === st
                const count = inqCounts[st] ?? 0
                return (
                  <button
                    key={st}
                    onClick={() => setInquiryStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary'
                        : 'bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <span>{st}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="ml-auto px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors inline-flex items-center gap-1 shrink-0 cursor-pointer"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
