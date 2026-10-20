'use client'

import React from 'react'
import { Inbox, Copy, Check, Mail, Eye, Trash2, Send } from 'lucide-react'
import { type InquiryRecord } from '@/lib/api/admin'

const INQUIRY_STATUS_OPTIONS: Array<InquiryRecord['status']> = [
  'NEW',
  'ACKNOWLEDGED',
  'REPLIED',
]

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
 * Contact Inquiries Data Table — styled in NEVOLYN light theme.
 * Clean, readable card table with status badge selectors, copy action, inspection modal trigger, and delete.
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
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm text-center py-16 px-4">
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
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
              <th className="py-3 px-4">Tracking Ref</th>
              <th className="py-3 px-4">Visitor Name</th>
              <th className="py-3 px-4">Subject & Excerpt</th>
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
                  <select
                    value={i.status}
                    onChange={(e) =>
                      onStatusChange(i.id, e.target.value as InquiryRecord['status'])
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold focus:outline-none cursor-pointer transition-colors ${
                      i.status === 'NEW'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : i.status === 'ACKNOWLEDGED'
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : i.status === 'REPLIED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-50 text-slate-800 border-slate-300'
                    }`}
                  >
                    {INQUIRY_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-card text-foreground">
                        {opt}
                      </option>
                    ))}
                  </select>
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
