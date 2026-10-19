'use client'

import React from 'react'
import { Users, Copy, Check, Mail, Phone, Eye, Download, Trash2, FileText } from 'lucide-react'
import { type ApplicationRecord, getApplicationPdfDownloadUrl } from '@/lib/api/admin'

const APPLICATION_STATUS_OPTIONS: Array<ApplicationRecord['selectionStatus']> = [
  'PENDING',
  'IN_REVIEW',
  'SHORTLISTED',
  'REJECTED',
  'HIRED',
]

interface ApplicationsTableProps {
  applications: ApplicationRecord[]
  searchTerm: string
  statusFilter: string
  copiedId: string | null
  onCopy: (code: string) => void
  onStatusChange: (id: number, newStatus: ApplicationRecord['selectionStatus']) => void
  onSelect: (record: ApplicationRecord) => void
  onDelete: (id: number, ref: string) => void
}

/**
 * Job Applications Data Table — NEVOLYN light theme.
 * Clean, executive card table with status badge selectors, resume download, candidate inspection, and delete.
 */
export function ApplicationsTable({
  applications,
  searchTerm,
  statusFilter,
  copiedId,
  onCopy,
  onStatusChange,
  onSelect,
  onDelete,
}: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm text-center py-16 px-4">
        <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-3 text-muted-foreground">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No candidate applications found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          {searchTerm || statusFilter !== 'ALL'
            ? 'Try clearing your search query or status filter.'
            : 'Submissions from the /join_us application form will appear here in real time.'}
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
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4">Statement / Resume</th>
              <th className="py-3 px-4">Status Stage</th>
              <th className="py-3 px-4">Submitted (UTC)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-muted/40 transition-colors">
                {/* Reference Code */}
                <td className="py-3.5 px-4 font-mono font-semibold text-primary whitespace-nowrap">
                  <button
                    onClick={() => onCopy(app.applicationId)}
                    className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                    title="Click to copy tracking ID"
                  >
                    <span>{app.applicationId}</span>
                    {copiedId === app.applicationId ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </td>

                {/* Candidate Details */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <p className="font-bold text-foreground text-sm">{app.name}</p>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <a
                      href={`mailto:${app.email}`}
                      className="text-primary hover:underline flex items-center gap-1 text-[11px] font-medium"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{app.email}</span>
                    </a>
                    {app.phone && (
                      <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3" />
                        <span>{app.phone}</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Reason & Resume file */}
                <td className="py-3.5 px-4 max-w-xs">
                  <p className="text-foreground line-clamp-1 font-medium">{app.reason}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-[11px]">
                    <FileText className="w-3 h-3 text-sky-500" />
                    <span className="truncate max-w-[160px]">{app.originalFileName || 'resume.pdf'}</span>
                    {app.fileSizeBytes && (
                      <span className="text-[10px] text-muted-foreground">
                        ({(app.fileSizeBytes / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                </td>

                {/* Status Selector */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <select
                    value={app.selectionStatus}
                    onChange={(e) =>
                      onStatusChange(app.id, e.target.value as ApplicationRecord['selectionStatus'])
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold focus:outline-none cursor-pointer transition-colors ${
                      app.selectionStatus === 'PENDING'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : app.selectionStatus === 'IN_REVIEW'
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : app.selectionStatus === 'SHORTLISTED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : app.selectionStatus === 'HIRED'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {APPLICATION_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-card text-foreground">
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-medium">
                  {new Date(app.createdAt).toLocaleDateString('en-GB', {
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
                      onClick={() => onSelect(app)}
                      className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Inspect application details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={getApplicationPdfDownloadUrl(app.applicationId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-primary hover:text-primary transition-colors inline-flex items-center"
                      title="Download Candidate Dossier PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onDelete(app.id, app.applicationId)}
                      className="p-1.5 rounded-lg border border-border bg-card hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete application"
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
