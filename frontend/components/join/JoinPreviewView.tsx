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
  CreditCard,
} from 'lucide-react'

export interface JoinPreviewData {
  name: string
  email: string
  phone: string
  address: string
  nid: string
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
      <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden text-slate-900">
        {/* Header Strip */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 sm:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
              Step 2 of 2: Pre-Flight Review
            </span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Credentials Validated</span>
          </div>
        </div>

        {/* Title */}
        <div className="px-6 sm:px-10 pt-6 sm:pt-8 pb-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Review Your Application
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Please verify your information before final dispatch to NEVOLYN.
          </p>
        </div>

        {/* Content Body */}
        <div className="px-6 sm:px-10 pt-4 pb-8 sm:pb-10 space-y-6 sm:space-y-7">
          {/* Dispatch Notice Banner */}
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 mt-0.5">
              <Mail className="h-4 w-4" />
            </div>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Once confirmed, your complete application and its official compiled PDF document will be routed directly to{' '}
              <strong className="text-blue-600 font-semibold">info@nevolyn.com</strong>. An identical confirmation receipt with the PDF attached will be instantly delivered to your address at{' '}
              <strong className="text-slate-900 font-semibold">{formData.email}</strong>.
            </div>
          </div>

          {/* Section 1: Candidate Profile */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
              <User className="h-4 w-4" />
              <span>Candidate Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  Full Name
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                  {formData.name || '-'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                  <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                  National ID (NID)
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-900 font-mono break-words">
                  {formData.nid || '-'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  Email Address
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                  {formData.email || '-'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                  <Phone className="h-3.5 w-3.5 text-blue-600" />
                  Phone Number
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                  {formData.phone || '-'}
                </span>
              </div>

              <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  Residential Address / Location
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                  {formData.address || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Online Profiles & Portfolios */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
              <Globe className="h-4 w-4" />
              <span>Professional Links &amp; Profiles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 min-w-0">
                <span className="text-xs font-medium text-slate-500 block mb-1">LinkedIn</span>
                <span className={`text-xs font-semibold truncate block ${formData.linkedin ? 'text-blue-600' : 'text-slate-400'}`}>
                  {formData.linkedin || 'N/A'}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 min-w-0">
                <span className="text-xs font-medium text-slate-500 block mb-1">GitHub</span>
                <span className={`text-xs font-semibold truncate block ${formData.github ? 'text-blue-600' : 'text-slate-400'}`}>
                  {formData.github || 'N/A'}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 min-w-0">
                <span className="text-xs font-medium text-slate-500 block mb-1">Portfolio / Website</span>
                <span className={`text-xs font-semibold truncate block ${formData.website ? 'text-blue-600' : 'text-slate-400'}`}>
                  {formData.website || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Statement of Motivation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
              <FileText className="h-4 w-4" />
              <span>Statement of Purpose / Motivation</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {formData.reason}
              </p>
            </div>
          </div>

          {/* Section 4: Application Document */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
              <FileCheck className="h-4 w-4" />
              <span>Application Document</span>
            </div>

            <div className="rounded-xl border border-slate-200 border-l-4 border-l-red-600 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-10 rounded-md bg-red-600 text-white flex items-center justify-center font-extrabold text-[11px] tracking-wider shadow-xs shrink-0">
                  PDF
                </div>
                <div className="truncate">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {selectedFile?.name || 'Application Document'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Attached'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Ready for Compilation
              </span>
            </div>
          </div>

          {/* Action Buttons: Back to Edit or Confirm Dispatch */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={isSending}
              onClick={onBackToEdit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              disabled={isSending}
              onClick={onConfirmSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white shrink-0" />
                  <span>Dispatching to info@nevolyn.com...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-white shrink-0" />
                  <span>Confirm &amp; Dispatch Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
