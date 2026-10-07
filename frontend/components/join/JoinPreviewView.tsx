'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Loader2,
  CheckCircle2,
  FileCheck,
} from 'lucide-react'

export interface JoinPreviewData {
  name: string
  email: string
  phone: string
  address: string
  reason: string
  linkedin?: string
  github?: string
  website?: string
}

interface JoinPreviewViewProps {
  formData: JoinPreviewData
  selectedFile: File | null
  onBackToEdit: () => void
  onConfirmSubmit: () => void
  isSending: boolean
}

export function JoinPreviewView({
  formData,
  selectedFile,
  onBackToEdit,
  onConfirmSubmit,
  isSending,
}: JoinPreviewViewProps) {
  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="mx-auto max-w-4xl px-4 sm:px-6"
    >
      <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-800 bg-[#07111e]/95 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Header Strip */}
        <div className="border-b border-slate-800 bg-slate-900/60 px-6 sm:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">
              Step 2 of 2: Pre-Flight Review
            </span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Credentials Validated</span>
          </div>
        </div>

        {/* Title */}
        <div className="px-6 sm:px-10 pt-6 sm:pt-8 pb-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Review Your Application
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Please verify your information before final dispatch to the NEVOLYN talent acquisition team.
          </p>
        </div>

        {/* Content Body */}
        <div className="px-6 sm:px-10 pt-4 pb-8 sm:pb-10 space-y-6 sm:space-y-7">
          {/* Dispatch Notice Card */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 mt-0.5">
              <Mail className="h-4 w-4" />
            </div>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Automated Dispatch Protocol:</span> Once confirmed, your complete application and its official compiled PDF document will be routed directly to{' '}
              <strong className="text-blue-400 font-semibold">info@nevolyn.com</strong>. An identical confirmation receipt with the PDF attached will be instantly delivered to your address at{' '}
              <strong className="text-white font-semibold">{formData.email}</strong>.
            </div>
          </div>

          {/* Section 1: Candidate Profile */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
              <User className="h-4 w-4" />
              <span>Candidate Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <User className="h-3.5 w-3.5 text-blue-400" />
                  Full Name
                </span>
                <span className="text-sm sm:text-base font-semibold text-white break-words">
                  {formData.name || '-'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  Email Address
                </span>
                <span className="text-sm sm:text-base font-semibold text-white break-words">
                  {formData.email || '-'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <Phone className="h-3.5 w-3.5 text-blue-400" />
                  Phone Number
                </span>
                <span className="text-sm sm:text-base font-semibold text-white break-words">
                  {formData.phone || '-'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  Address / Location
                </span>
                <span className="text-sm sm:text-base font-semibold text-white break-words">
                  {formData.address || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Online Profiles & Portfolios */}
          {(formData.linkedin || formData.github || formData.website) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                <Globe className="h-4 w-4" />
                <span>Professional Links &amp; Profiles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {formData.linkedin && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 truncate">
                    <span className="text-xs font-medium text-slate-400 block mb-1">LinkedIn</span>
                    <span className="text-xs font-semibold text-blue-400 truncate block">
                      {formData.linkedin}
                    </span>
                  </div>
                )}
                {formData.github && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 truncate">
                    <span className="text-xs font-medium text-slate-400 block mb-1">GitHub</span>
                    <span className="text-xs font-semibold text-blue-400 truncate block">
                      {formData.github}
                    </span>
                  </div>
                )}
                {formData.website && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 truncate">
                    <span className="text-xs font-medium text-slate-400 block mb-1">Portfolio</span>
                    <span className="text-xs font-semibold text-blue-400 truncate block">
                      {formData.website}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Statement of Motivation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
              <FileText className="h-4 w-4" />
              <span>Statement of Purpose / Motivation</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {formData.reason}
              </p>
            </div>
          </div>

          {/* Section 4: Attached Document */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
              <FileCheck className="h-4 w-4" />
              <span>Attached CV / Resume</span>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-emerald-500/15 rounded-lg text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">
                    {selectedFile?.name || 'Resume / CV Document'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Attached'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                Ready for Compilation
              </span>
            </div>
          </div>

          {/* Action Buttons: Back to Edit or Confirm Dispatch */}
          <div className="pt-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={isSending}
              onClick={onBackToEdit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white px-6 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              disabled={isSending}
              onClick={onConfirmSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:brightness-110 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white shrink-0" />
                  <span className="text-white">Dispatching to info@nevolyn.com...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-white shrink-0" />
                  <span className="text-white">Confirm &amp; Dispatch Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
