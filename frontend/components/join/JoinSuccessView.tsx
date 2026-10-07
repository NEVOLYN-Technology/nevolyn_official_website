'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  Mail,
  Loader2,
} from 'lucide-react'

interface JoinSuccessViewProps {
  referenceCode: string
  copiedCode: boolean
  onCopyCode: () => void
  onResetForm: () => void
  senderEmail?: string
  pdfUrl?: string | null
}

export function JoinSuccessView({
  referenceCode,
  copiedCode,
  onCopyCode,
  onResetForm,
  senderEmail,
  pdfUrl,
}: JoinSuccessViewProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadPdf = async () => {
    if (!pdfUrl) return
    setIsDownloading(true)
    try {
      const response = await fetch(pdfUrl)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `NEVOLYN_Application_${referenceCode}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      // Fallback: direct window open if fetch fails
      window.open(pdfUrl, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="mx-auto max-w-3xl rounded-3xl border border-blue-500/40 bg-[#07111e]/95 p-6 sm:p-12 shadow-[0_25px_60px_-15px_rgba(14,165,233,0.35)] backdrop-blur-xl"
    >
      {/* Header Icon & Title */}
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 ring-8 ring-blue-500/10 shadow-[0_0_30px_rgba(14,165,233,0.4)]">
          <CheckCircle2 className="h-10 w-10 text-blue-400" />
        </div>

        <h2 className="mt-6 text-2xl sm:text-3xl font-black text-white tracking-tight">
          Application Registered &amp; Dispatched!
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Your credentials and CV have been processed into an official application document.
        </p>
      </div>

      {/* Official Reference Receipt & PDF Download Card */}
      <div className="mt-8 rounded-2xl border border-blue-500/30 bg-blue-950/30 p-6 sm:p-7 text-center shadow-xs">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1.5">
          Tracking Reference Code
        </span>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-blue-400 select-all">
            {referenceCode}
          </span>
          <button
            onClick={onCopyCode}
            type="button"
            title="Copy Reference Code"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold active:scale-95 shadow-2xs cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="my-5 border-t border-blue-500/20 w-full max-w-sm mx-auto" />

        {/* Download Action Inside Card — ONLY ONE BUTTON as requested */}
        <div className="flex justify-center print:hidden">
          <button
            type="button"
            disabled={isDownloading || !pdfUrl}
            onClick={handleDownloadPdf}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:brightness-110 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            title="Download Application PDF"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0 text-white" />
                <span className="text-white">Preparing Download...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 shrink-0 text-white" />
                <span className="text-white">Download Application PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Email Delivery Confirmation Card */}
      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-start gap-3.5 text-left">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
          <Mail className="h-4 w-4" />
        </div>
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          <strong className="block font-bold text-emerald-400 text-sm mb-0.5">
            PDF Application Document Delivered to Both Parties
          </strong>
          <span>
            An identical confirmation email with the official <strong>PDF copy of this application</strong> attached has been dispatched to both{' '}
            <strong className="text-blue-400 font-semibold">info@nevolyn.com</strong> and{' '}
            <strong className="text-white font-semibold">{senderEmail || 'your email'}</strong>.
          </span>
        </div>
      </div>

      {/* Secondary Navigation Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xl mx-auto print:hidden">
        <button
          type="button"
          onClick={onResetForm}
          className="w-full sm:w-1/2 py-3 px-5 text-xs sm:text-sm font-bold rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer text-center"
        >
          Submit Another Application
        </button>

        <Link
          href="/"
          className="w-full sm:w-1/2 py-3 px-5 text-xs sm:text-sm font-bold rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer text-center"
        >
          Return to Homepage
        </Link>
      </div>
    </motion.div>
  )
}
