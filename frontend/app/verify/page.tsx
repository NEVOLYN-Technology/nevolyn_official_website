'use client'

import type { JSX } from 'react'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { apiClient, type ApiErrorResponse } from '@/lib/apiClient'

/**
 * Payload returned by both verification endpoints. Each carries only its own
 * tracking field, so both are optional here.
 */
interface VerificationResult {
  inquiryId?: string
  applicationId?: string
  status?: string
  isVerified?: boolean
}

/**
 * Landing page for the link in the step-1 verification email.
 *
 * Reads `token` and `type` from the query string and calls the matching verify
 * endpoint. That call is what advances the pipeline: the backend marks the
 * submission verified and only then emails the R&D team and the sender's
 * receipt. Until this page is opened, a submission goes no further.
 *
 * Must be rendered inside `<Suspense>` — `useSearchParams` opts the subtree into
 * client-side rendering, and Next.js fails the build without a boundary.
 */
function VerificationContent(): JSX.Element {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const type = searchParams.get('type') || 'contact'

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [trackingId, setTrackingId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setSuccess(false)
      setMessage('Missing verification token in request URL.')
      return
    }

    // encodeURIComponent guards the query string against a token containing
    // characters that would otherwise terminate or extend the parameter.
    const query = `?token=${encodeURIComponent(token)}`
    const endpoint = type === 'application' ? `/applications/verify${query}` : `/contact/verify${query}`

    apiClient
      .get<VerificationResult>(endpoint)
      .then((res) => {
        setSuccess(true)
        setMessage(res.message || 'Email verified successfully.')
        setTrackingId(res.data?.inquiryId ?? res.data?.applicationId ?? null)
      })
      .catch((err: ApiErrorResponse) => {
        setSuccess(false)
        setMessage(err.message || 'Invalid or expired verification token.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token, type])

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-[#0a1526] p-8 md:p-12 rounded-3xl shadow-xl dark:shadow-none border border-slate-200 dark:border-slate-800/80"
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Verifying Email Address...</h2>
            <p className="text-sm text-slate-500">Communicating with Saturn R&D API server...</p>
          </div>
        ) : success ? (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-semibold uppercase tracking-wider">
                {type === 'application' ? 'Job Application Verified' : 'Contact Inquiry Verified'}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-3">Email Verified!</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">{message}</p>
            </div>

            {trackingId && (
              <div className="p-4 bg-slate-50 dark:bg-[#030a15] rounded-xl border border-slate-200 dark:border-slate-800/80 text-left">
                <p className="text-xs text-slate-400 uppercase font-medium">Tracking Reference</p>
                <p className="text-lg font-bold text-orange-500 font-mono mt-0.5">{trackingId}</p>
              </div>
            )}

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-left">
              ✔ An alert has been sent to our leadership & admin inbox. You will also receive an acknowledgement email with your tracking ID.
            </div>

            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Failed</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">{message}</p>
            </div>

            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Homepage
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function VerifyPage(): JSX.Element {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="max-w-xl mx-auto px-4 py-16 text-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-orange-500" />
            Loading verification page...
          </div>
        }
      >
        <VerificationContent />
      </Suspense>
    </PageShell>
  )
}
