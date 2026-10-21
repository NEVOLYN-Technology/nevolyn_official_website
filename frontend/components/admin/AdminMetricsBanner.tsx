'use client'

import React from 'react'
import {
  Users,
  Inbox,
  Clock,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  FileSearch,
  Award,
  XCircle,
  MessageSquareCheck,
  TrendingUp,
  Filter,
} from 'lucide-react'
import {
  type ApplicationRecord,
  type InquiryRecord,
  type AdminStats,
} from '@/lib/api/admin'

interface AdminMetricsBannerProps {
  activeTab: 'applications' | 'inquiries'
  applications: ApplicationRecord[]
  inquiries: InquiryRecord[]
  stats: AdminStats
  activeStatusFilter: string
  onStatusFilterSelect: (status: string) => void
}

/**
 * Executive KPI summary metric cards — context-aware banner.
 * Displays tailored metrics specifically for Job Applications or Contact Inquiries.
 * Cards are interactive: clicking a metric card sets the corresponding filter.
 */
export function AdminMetricsBanner({
  activeTab,
  applications,
  inquiries,
  stats,
  activeStatusFilter,
  onStatusFilterSelect,
}: AdminMetricsBannerProps) {
  if (activeTab === 'applications') {
    const totalApps = applications.length || stats.totalApplications
    const pendingApps = applications.filter((a) => a.selectionStatus === 'PENDING').length
    const inReviewApps = applications.filter((a) => a.selectionStatus === 'IN_REVIEW').length
    const shortlistedApps = applications.filter((a) => a.selectionStatus === 'SHORTLISTED').length
    const hiredApps = applications.filter((a) => a.selectionStatus === 'HIRED').length
    const rejectedApps = applications.filter((a) => a.selectionStatus === 'REJECTED').length

    const cards = [
      {
        id: 'ALL',
        label: 'Total Applications',
        value: totalApps,
        subtitle: 'All candidate records',
        icon: <Users className="w-4 h-4" />,
        iconBg: 'bg-primary/10 text-primary',
        valueClass: 'text-foreground',
      },
      {
        id: 'PENDING',
        label: 'Pending Review',
        value: pendingApps,
        subtitle: 'Awaiting initial screen',
        icon: <Clock className="w-4 h-4" />,
        iconBg: 'bg-amber-50 text-amber-600',
        valueClass: 'text-amber-600',
      },
      {
        id: 'IN_REVIEW',
        label: 'In Review',
        value: inReviewApps,
        subtitle: 'Technical evaluation',
        icon: <FileSearch className="w-4 h-4" />,
        iconBg: 'bg-sky-50 text-sky-600',
        valueClass: 'text-sky-600',
      },
      {
        id: 'SHORTLISTED',
        label: 'Shortlisted',
        value: shortlistedApps,
        subtitle: 'Interview round',
        icon: <Award className="w-4 h-4" />,
        iconBg: 'bg-indigo-50 text-indigo-600',
        valueClass: 'text-indigo-600',
      },
      {
        id: 'HIRED',
        label: 'Hired',
        value: hiredApps,
        subtitle: 'Selected candidates',
        icon: <UserCheck className="w-4 h-4" />,
        iconBg: 'bg-emerald-50 text-emerald-600',
        valueClass: 'text-emerald-600',
      },
      {
        id: 'REJECTED',
        label: 'Rejected',
        value: rejectedApps,
        subtitle: 'Not moving forward',
        icon: <XCircle className="w-4 h-4" />,
        iconBg: 'bg-rose-50 text-rose-600',
        valueClass: 'text-rose-600',
      },
    ]

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span>Applications Overview</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              (Click any card to filter list)
            </span>
          </div>
          {activeStatusFilter !== 'ALL' && (
            <button
              onClick={() => onStatusFilterSelect('ALL')}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Reset filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {cards.map((card) => {
            const isSelected = activeStatusFilter === card.id
            return (
              <button
                key={card.id}
                onClick={() => onStatusFilterSelect(card.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/5 border-primary shadow-sm ring-2 ring-primary/20'
                    : 'bg-card border-border hover:border-primary/40 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-muted-foreground text-xs mb-2">
                    <span className="font-semibold truncate pr-1">{card.label}</span>
                    <div className={`p-1.5 rounded-lg shrink-0 ${card.iconBg}`}>
                      {card.icon}
                    </div>
                  </div>
                  <p className={`text-2xl font-black tracking-tight ${card.valueClass}`}>
                    {card.value}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="truncate">{card.subtitle}</span>
                  {isSelected && (
                    <span className="shrink-0 flex items-center gap-0.5 text-primary font-bold text-[10px]">
                      <Filter className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Active Tab: Inquiries
  const totalInqs = inquiries.length || stats.totalInquiries
  const newInqs = inquiries.filter(
    (i) => i.status === 'NEW' && !i.isAcknowledged
  ).length
  const acknowledgedInqs = inquiries.filter(
    (i) => i.status === 'ACKNOWLEDGED' || (i.status === 'NEW' && i.isAcknowledged)
  ).length
  const repliedInqs = inquiries.filter((i) => i.status === 'REPLIED').length
  const resolutionRate = totalInqs > 0 ? Math.round((repliedInqs / totalInqs) * 100) : 0

  const inquiryCards = [
    {
      id: 'ALL',
      label: 'Total Inquiries',
      value: totalInqs,
      subtitle: 'All received messages',
      icon: <Inbox className="w-4 h-4" />,
      iconBg: 'bg-primary/10 text-primary',
      valueClass: 'text-foreground',
      clickable: true,
    },
    {
      id: 'NEW',
      label: 'New Submissions',
      value: newInqs,
      subtitle: 'Awaiting acknowledgment',
      icon: <AlertCircle className="w-4 h-4" />,
      iconBg: 'bg-rose-50 text-rose-600',
      valueClass: 'text-rose-600',
      clickable: true,
    },
    {
      id: 'ACKNOWLEDGED',
      label: 'Acknowledged',
      value: acknowledgedInqs,
      subtitle: 'Receipt email confirmed',
      icon: <CheckCircle2 className="w-4 h-4" />,
      iconBg: 'bg-sky-50 text-sky-600',
      valueClass: 'text-sky-600',
      clickable: true,
    },
    {
      id: 'REPLIED',
      label: 'Replied & Closed',
      value: repliedInqs,
      subtitle: 'Direct response sent',
      icon: <MessageSquareCheck className="w-4 h-4" />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueClass: 'text-emerald-600',
      clickable: true,
    },
    {
      id: 'RATE',
      label: 'Resolution Rate',
      value: `${resolutionRate}%`,
      subtitle: `${repliedInqs} of ${totalInqs} inquiries resolved`,
      icon: <TrendingUp className="w-4 h-4" />,
      iconBg: 'bg-teal-50 text-teal-600',
      valueClass: 'text-teal-600',
      clickable: false,
    },
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Inbox className="w-4 h-4 text-primary" />
            <span>Inquiries Overview</span>
          </h2>
          <span className="text-xs text-muted-foreground">
            (Click any card to filter list)
          </span>
        </div>
        {activeStatusFilter !== 'ALL' && (
          <button
            onClick={() => onStatusFilterSelect('ALL')}
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Reset filter</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {inquiryCards.map((card) => {
          const isSelected = activeStatusFilter === card.id
          return (
            <button
              key={card.id}
              disabled={!card.clickable}
              onClick={() => {
                if (card.clickable) onStatusFilterSelect(card.id)
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                !card.clickable
                  ? 'bg-card border-border cursor-default'
                  : isSelected
                  ? 'bg-primary/5 border-primary shadow-sm ring-2 ring-primary/20 cursor-pointer'
                  : 'bg-card border-border hover:border-primary/40 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-muted-foreground text-xs mb-2">
                  <span className="font-semibold truncate pr-1">{card.label}</span>
                  <div className={`p-1.5 rounded-lg shrink-0 ${card.iconBg}`}>
                    {card.icon}
                  </div>
                </div>
                <p className={`text-2xl font-black tracking-tight ${card.valueClass}`}>
                  {card.value}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate">{card.subtitle}</span>
                {isSelected && (
                  <span className="shrink-0 flex items-center gap-0.5 text-primary font-bold text-[10px]">
                    <Filter className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
