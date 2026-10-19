'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, ShieldCheck, CheckCircle2, Clock } from 'lucide-react'
import { type InquiryRecord } from '@/lib/api/admin'

interface InquiryDetailModalProps {
  inquiry: InquiryRecord | null
  onClose: () => void
}

/**
 * Contact Inquiry Deep-Inspection Modal — NEVOLYN light theme.
 * Clean dialog with legible message card, verification status, and one-click email reply action.
 */
export function InquiryDetailModal({ inquiry, onClose }: InquiryDetailModalProps) {
  return (
    <AnimatePresence>
      {inquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-primary">
                    {inquiry.inquiryId}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      inquiry.status === 'NEW'
                        ? 'bg-rose-50 text-rose-800 border border-rose-300'
                        : inquiry.status === 'IN_REVIEW'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : inquiry.status === 'CONTACTED'
                        ? 'bg-sky-50 text-sky-800 border border-sky-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mt-1">
                  {inquiry.subject}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-foreground text-sm">{inquiry.name}</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {new Date(inquiry.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <a
                  href={`mailto:${inquiry.email}`}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{inquiry.email}</span>
                </a>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    {inquiry.isVerified ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Email Verified</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-amber-700 font-medium">Unverified</span>
                      </>
                    )}
                  </span>
                  {inquiry.isAcknowledged && (
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Receipt Sent</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Message Body
                </label>
                <div className="p-4 rounded-xl bg-muted/30 border border-border text-foreground text-xs leading-relaxed whitespace-pre-wrap font-normal">
                  {inquiry.message || 'No message content provided.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between">
              <a
                href={`mailto:${inquiry.email}?subject=RE: ${encodeURIComponent(inquiry.subject)} [Ref: ${inquiry.inquiryId}]`}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply to Visitor</span>
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
