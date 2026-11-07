'use client'

import React from 'react'
import { Inbox, Copy, Check, Mail, Eye, Trash2, Send, Calendar } from 'lucide-react'
import { type InquiryRecord } from '@/lib/api/admin'

interface InquiriesTableProps {
  inquiries: InquiryRecord[]
  searchTerm: string
  statusFilter: string
  copiedId: string | null
  onCopy: (code: string) => void
  onStatusChange: (id: number, newStatus: InquiryRecord['status']) => void
  onSelect: (record: InquiryRecord) => void
  onDelete: (id: number, ref: string) => void
}

/**
 * Contact Inquiries Data Table & Mobile/iPad Card Roster — NEVOLYN light theme.
 * Adapts between an executive desktop table and a responsive touch card layout for phones/tablets.
 */
export function InquiriesTable({
  inquiries,
  searchTerm,
  statusFilter,
  copiedId,
  onCopy,
  onStatusChange,
  onSelect,
  onDelete,
}: InquiriesTableProps) {
  if (inquiries.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm text-center py-12 sm:py-16 px-4">
        <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-3 text-muted-foreground">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No contact inquiries found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          {searchTerm || statusFilter !== 'ALL'
            ? 'Try clearing your search query or status filter.'
            : 'Submissions from the "Let\'s Connect" form will appear here in real time.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* ── MOBILE & IPAD CARD VIEW (<1024px) ── */}
      <div className="lg:hidden divide-y divide-border">
        {inquiries.map((i) => {
          const effectiveStatus = (i.status === 'NEW' && i.isAcknowledged) ? 'ACKNOWLEDGED' : i.status
          return (
            <div key={i.id} className="p-4 sm:p-5 space-y-3 hover:bg-muted/30 transition-colors">
              {/* Top row: Tracking ID + Status dropdown */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onCopy(i.inquiryId)}
                  className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20"
                  title="Click to copy tracking ID"
                >
                  <span>{i.inquiryId}</span>
                  {copiedId === i.inquiryId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>

                <select
                  value={effectiveStatus}
                  onChange={(e) => {
                    if (e.target.value === 'REPLIED') {
                      onStatusChange(i.id, 'REPLIED')
                    }
                  }}
                  disabled={effectiveStatus === 'REPLIED'}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold focus:outline-none transition-colors ${
                    effectiveStatus === 'REPLIED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 cursor-default'
                      : effectiveStatus === 'ACKNOWLEDGED'
                      ? 'bg-sky-50 text-sky-800 border-sky-300 cursor-pointer hover:bg-sky-100/70'
                      : 'bg-rose-50 text-rose-800 border-rose-300 cursor-pointer hover:bg-rose-100/70'
                  }`}
                >
                  {effectiveStatus !== 'REPLIED' && (
                    <option value={effectiveStatus} disabled className="bg-card text-foreground">
                      {effectiveStatus}
                    </option>
                  )}
                  <option value="REPLIED" className="bg-card text-foreground font-semibold">
                    REPLIED
                  </option>
                </select>
              </div>

              {/* Submitter details */}
              <div>
                <p className="font-extrabold text-foreground text-sm sm:text-base leading-snug">
                  {i.name}
                </p>
                <a
                  href={`mailto:${i.email}`}
                  className="text-primary hover:underline inline-flex items-center gap-1 text-xs font-medium mt-0.5"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="break-all">{i.email}</span>
                </a>
              </div>

              {/* Subject & message preview */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs space-y-1">
                <p className="font-bold text-foreground line-clamp-1">{i.subject}</p>
                <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                  {i.message}
                </p>
              </div>

              {/* Bottom row: Received timestamp + Action buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span>
                    {new Date(i.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>View</span>
                  </button>
                  <a
                    href={`mailto:${i.email}?subject=RE: ${encodeURIComponent(i.subject)} [Ref: ${i.inquiryId}]`}
                    className="p-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors inline-flex items-center shadow-2xs"
                    title="Reply via email client"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(i.id, i.inquiryId)}
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                    title="Delete inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── DESKTOP TABULAR VIEW (>=1024px) ── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
              <th className="py-3 px-4">Tracking Ref</th>
              <th className="py-3 px-4">Visitor Name</th>
              <th className="py-3 px-4">Subject &amp; Excerpt</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Received (UTC)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inquiries.map((i) => (
              <tr key={i.id} className="hover:bg-muted/40 transition-colors">
                {/* Tracking ID */}
                <td className="py-3.5 px-4 font-mono font-semibold text-primary whitespace-nowrap">
                  <button
                    onClick={() => onCopy(i.inquiryId)}
                    className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                    title="Click to copy tracking ID"
                  >
                    <span>{i.inquiryId}</span>
                    {copiedId === i.inquiryId ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </td>

                {/* Submitter Details */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <p className="font-bold text-foreground text-sm">{i.name}</p>
                  <a
                    href={`mailto:${i.email}`}
                    className="text-primary hover:underline flex items-center gap-1 text-[11px] font-medium mt-0.5"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{i.email}</span>
                  </a>
                </td>

                {/* Subject & Excerpt */}
                <td className="py-3.5 px-4 max-w-md">
                  <p className="font-semibold text-foreground">{i.subject}</p>
                  <p className="text-muted-foreground text-[11px] line-clamp-1 mt-0.5 font-normal">
                    {i.message}
                  </p>
                </td>

                {/* Status Selector */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {(() => {
                    const effectiveStatus = (i.status === 'NEW' && i.isAcknowledged) ? 'ACKNOWLEDGED' : i.status
                    return (
                      <select
                        value={effectiveStatus}
                        onChange={(e) => {
                          if (e.target.value === 'REPLIED') {
                            onStatusChange(i.id, 'REPLIED')
                          }
                        }}
                        disabled={effectiveStatus === 'REPLIED'}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold focus:outline-none transition-colors ${
                          effectiveStatus === 'REPLIED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 cursor-default'
                            : effectiveStatus === 'ACKNOWLEDGED'
                            ? 'bg-sky-50 text-sky-800 border-sky-300 cursor-pointer hover:bg-sky-100/70'
                            : 'bg-rose-50 text-rose-800 border-rose-300 cursor-pointer hover:bg-rose-100/70'
                        }`}
                        title={
                          effectiveStatus === 'REPLIED'
                            ? 'Inquiry already marked as replied'
                            : 'Select REPLIED once response is sent'
                        }
                      >
                        {effectiveStatus !== 'REPLIED' && (
                          <option value={effectiveStatus} disabled className="bg-card text-foreground">
                            {effectiveStatus}
                          </option>
                        )}
                        <option value="REPLIED" className="bg-card text-foreground font-semibold">
                          REPLIED
                        </option>
                      </select>
                    )
                  })()}
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-medium">
                  {new Date(i.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>

                {/* Action Buttons */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => onSelect(i)}
                      className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Inspect inquiry details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`mailto:${i.email}?subject=RE: ${encodeURIComponent(i.subject)} [Ref: ${i.inquiryId}]`}
                      className="p-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:border-sky-300 transition-colors inline-flex items-center"
                      title="Reply via email client"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onDelete(i.id, i.inquiryId)}
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors cursor-pointer"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
