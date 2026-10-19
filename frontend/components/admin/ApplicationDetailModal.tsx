'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  Globe,
  CreditCard,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Save,
} from 'lucide-react'
import { type ApplicationRecord, getApplicationPdfDownloadUrl } from '@/lib/api/admin'

interface ApplicationDetailModalProps {
  application: ApplicationRecord | null
  onClose: () => void
  onUpdateStatus?: (
    id: number,
    newStatus: ApplicationRecord['selectionStatus'],
    reviewNotes?: string
  ) => Promise<void>
}

/**
 * Job Application Deep-Inspection Modal — NEVOLYN light theme.
 * Elevated dialog with candidate credentials, portfolio links, statement, review notes, and dossier download.
 */
export function ApplicationDetailModal({
  application,
  onClose,
  onUpdateStatus,
}: ApplicationDetailModalProps) {
  const [notes, setNotes] = useState<string>(application?.reviewNotes || '')
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false)

  // Update internal notes if application prop changes
  React.useEffect(() => {
    setNotes(application?.reviewNotes || '')
  }, [application])

  const handleSaveNotes = async () => {
    if (!application || !onUpdateStatus) return
    setIsSavingNotes(true)
    try {
      await onUpdateStatus(application.id, application.selectionStatus, notes)
    } finally {
      setIsSavingNotes(false)
    }
  }

  return (
    <AnimatePresence>
      {application && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-primary">
                    {application.applicationId}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      application.selectionStatus === 'PENDING'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : application.selectionStatus === 'IN_REVIEW'
                        ? 'bg-sky-50 text-sky-800 border border-sky-300'
                        : application.selectionStatus === 'SHORTLISTED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : application.selectionStatus === 'HIRED'
                        ? 'bg-purple-50 text-purple-800 border border-purple-300'
                        : 'bg-rose-50 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {application.selectionStatus}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  {application.name}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Contact Information */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">
                  Candidate Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">Primary Email</span>
                    <a
                      href={`mailto:${application.email}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{application.email}</span>
                    </a>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">Phone Contact</span>
                    <a
                      href={`tel:${application.phone}`}
                      className="font-medium text-foreground hover:underline flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>{application.phone}</span>
                    </a>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">National ID (NID)</span>
                    <div className="font-medium font-mono text-foreground flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                      <span>{application.nid || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">Location / Address</span>
                    <div className="font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{application.address || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profiles & Links */}
              {(application.linkedin || application.github || application.website) && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">
                    Portfolio & Social Profiles
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {application.linkedin && (
                      <a
                        href={application.linkedin.startsWith('http') ? application.linkedin : `https://${application.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5 font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-sky-600 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 1 0-.01-3.06 1.53 1.53 0 0 0 .01 3.06m1.37 9.74v-8.37H5.1v8.37h2.73z" />
                        </svg>
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {application.github && (
                      <a
                        href={application.github.startsWith('http') ? application.github : `https://${application.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5 font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-800 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                        </svg>
                        <span>GitHub</span>
                      </a>
                    )}
                    {application.website && (
                      <a
                        href={application.website.startsWith('http') ? application.website : `https://${application.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5 font-medium transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Portfolio / Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Statement / Reason */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
                  Statement of Interest & Motivation
                </h4>
                <div className="p-4 rounded-xl bg-muted/30 border border-border text-foreground text-xs leading-relaxed whitespace-pre-wrap font-normal">
                  {application.reason || 'No statement provided.'}
                </div>
              </div>

              {/* Verification & Resume Meta */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-1">
                    {application.isVerified ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Email Verified</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700 font-semibold">Unverified</span>
                      </>
                    )}
                  </span>
                  {application.isAcknowledged && (
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-sky-600" />
                      <span>Receipt Dispatched</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{application.originalFileName}</span>
                </div>
              </div>

              {/* Internal Review Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                    Internal HR & Technical Review Notes
                  </label>
                  {onUpdateStatus && (
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                    </button>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add interview notes, candidate ratings, team remarks..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between">
              <a
                href={getApplicationPdfDownloadUrl(application.applicationId)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Dossier PDF</span>
              </a>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
