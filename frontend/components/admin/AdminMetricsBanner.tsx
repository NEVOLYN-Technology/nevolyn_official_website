'use client'

import React from 'react'
import { Users, Inbox, Clock, CheckCircle2, UserCheck } from 'lucide-react'
import { type AdminStats } from '@/lib/api/admin'

interface AdminMetricsBannerProps {
  stats: AdminStats
  inquiriesCount: number
  applicationsCount: number
}

/**
 * KPI summary metric cards — 5-card executive banner.
 * Styled in NEVOLYN light theme: clean white cards, sky-blue/cyan accents.
 */
export function AdminMetricsBanner({ stats, inquiriesCount, applicationsCount }: AdminMetricsBannerProps) {
  const cards = [
    {
      label: 'Total Applications',
      value: applicationsCount,
      icon: <Users className="w-4 h-4" />,
      iconBg: 'bg-sky-50 text-sky-600',
      valueClass: 'text-foreground',
    },
    {
      label: 'Pending Review',
      value: stats.pendingApplications + stats.inReviewApplications,
      icon: <Clock className="w-4 h-4" />,
      iconBg: 'bg-amber-50 text-amber-600',
      valueClass: 'text-amber-600',
    },
    {
      label: 'Shortlisted / Hired',
      value: stats.shortlistedApplications,
      icon: <UserCheck className="w-4 h-4" />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueClass: 'text-emerald-600',
    },
    {
      label: 'Total Inquiries',
      value: inquiriesCount,
      icon: <Inbox className="w-4 h-4" />,
      iconBg: 'bg-indigo-50 text-indigo-600',
      valueClass: 'text-foreground',
    },
    {
      label: 'Inquiries Awaiting Reply',
      value: stats.newInquiries,
      icon: <CheckCircle2 className="w-4 h-4" />,
      iconBg: 'bg-rose-50 text-rose-600',
      valueClass: 'text-rose-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-2 font-medium">
            <span>{card.label}</span>
            <div className={`p-1.5 rounded-lg ${card.iconBg}`}>{card.icon}</div>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${card.valueClass}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
