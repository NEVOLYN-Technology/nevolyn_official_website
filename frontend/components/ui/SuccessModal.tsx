'use client'

import type { JSX } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Mail, X, FileText, ExternalLink, Download } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string | null
  email?: string
  formType?: 'contact' | 'application'
  pdfUrl?: string | null
}

export const SuccessModal = ({
  isOpen,
  onClose,
  title = 'Submission Received!',
  message,
  email,
  formType = 'contact',
  pdfUrl,
}: SuccessModalProps): JSX.Element => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#07111e] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 z-10 overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 p-2 sm:p-2.5 rounded-full transition-all cursor-pointer active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </button>

            {/* Glowing Icon Header */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-slate-950 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Header Content */}
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {title}
              </h3>
              <p className="text-emerald-400 font-medium text-sm sm:text-base">
                {message || 'Thank you for reaching out to NEVOLYN Technology.'}
              </p>
            </div>

            {/* Target Email Callout */}
            {email && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 mb-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Receipt Sent to</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-200 break-all sm:truncate">{email}</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto inline-flex items-center text-[11px] sm:text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                    Confirmation Sent
                  </span>
                </div>
              </div>
            )}

            {/* Application PDF Preview - Unified Merged Application & CV */}
            {pdfUrl && (
              <div className="bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 border border-blue-500/40 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-blue-950/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-blue-500/15 rounded-xl text-blue-400 border border-blue-500/30 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Application</p>
                    <p className="text-sm font-bold text-slate-100 truncate">Application</p>
                  </div>
                </div>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl shadow-md shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-400/40 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Application</span>
                </a>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 mb-8 text-left space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                What happens next:
              </p>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-sm text-slate-300">
                  Check your email inbox for your submission receipt and tracking reference code.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-sm text-slate-300">
                  Our engineering leadership team will review your {formType === 'contact' ? 'inquiry details' : 'application and CV'}.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-sm text-slate-300">
                  You will receive an acknowledgment or reply directly from our team.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Got It, Thanks!</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
