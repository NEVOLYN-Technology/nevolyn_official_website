'use client'

import type { JSX } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Mail, X } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string | null
  email?: string
  formType?: 'contact' | 'application'
}

export const SuccessModal = ({
  isOpen,
  onClose,
  title = 'Submission Received!',
  message,
  email,
  formType = 'contact',
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
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
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
                {message || 'Thank you for reaching out to Saturn Textiles R&D.'}
              </p>
            </div>

            {/* Target Email Callout */}
            {email && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs text-slate-400 font-medium">Receipt Sent to</p>
                    <p className="text-sm font-semibold text-slate-200 truncate">{email}</p>
                  </div>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                  Confirmation Sent
                </span>
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
                  Our engineering leadership team will review your {formType === 'contact' ? 'inquiry details' : 'application dossier & CV'}.
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
