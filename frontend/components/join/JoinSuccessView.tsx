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
      link.download = `NEVOLYN_${referenceCode}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
    } catch {
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
      className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl text-slate-900"
    >
      {/* Header Icon & Title */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/60 shadow-xs">
          <CheckCircle2 className="h-8 w-8 text-blue-600" />
        </div>

        <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application Registered &amp; Dispatched!
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Your credentials and document have been processed into an official application.
        </p>
      </div>

      {/* Official Reference Receipt Card */}
      <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1.5">
          Tracking Reference Code
        </span>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-blue-600 select-all">
            {referenceCode}
          </span>
          <button
            onClick={onCopyCode}
            type="button"
            title="Copy Reference Code"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-xs font-bold active:scale-95 shadow-2xs cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official Application PDF Document Card */}
      <div className="mt-5 rounded-2xl border border-slate-200 border-l-4 border-l-red-600 bg-slate-50/70 p-5 sm:p-6 text-left shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-10 h-12 rounded-lg bg-red-600 text-white flex flex-col items-center justify-center font-black text-xs tracking-wider shadow-xs shrink-0">
              PDF
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                Official Document
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-900 font-mono break-all sm:break-normal">
                NEVOLYN_{referenceCode}.pdf
              </p>
              <p className="text-xs text-slate-500 whitespace-normal mt-0.5">
                Official candidate credentials record
              </p>
            </div>
          </div>

          <div className="shrink-0 print:hidden w-full sm:w-auto">
            <button
              type="button"
              disabled={isDownloading || !pdfUrl}
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer whitespace-nowrap"
              title="Download Application PDF"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0 text-white" />
                  <span>Preparing Download...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 shrink-0 text-white" />
                  <span>Download Application PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Email Delivery Confirmation Card */}
      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex items-start gap-3.5 text-left">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
          <Mail className="h-4 w-4" />
        </div>
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong className="block font-bold text-slate-900 text-sm mb-0.5">
            PDF Delivered
          </strong>
          <span>
            An identical confirmation receipt with your official application document attached has been dispatched to{' '}
            <strong className="text-blue-600 font-semibold">info@nevolyn.com</strong> and{' '}
            <strong className="text-slate-900 font-semibold">{senderEmail || 'your email'}</strong>.
          </span>
        </div>
      </div>

      {/* Secondary Navigation Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xl mx-auto print:hidden">
        <button
          type="button"
          onClick={onResetForm}
          className="w-full sm:w-1/2 py-3 px-5 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer text-center"
        >
          Submit Another Application
        </button>

        <Link
          href="/"
          className="w-full sm:w-1/2 py-3 px-5 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer text-center"
        >
          Return to Homepage
        </Link>
      </div>
    </motion.div>
  )
}
