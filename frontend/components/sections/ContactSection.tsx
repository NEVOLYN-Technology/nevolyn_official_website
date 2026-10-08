/**
 * ContactSection — Interactive visitor inquiry form for R&D and partner proposals.
 *
 * Integrates with the Spring Boot API client (`lib/apiClient.ts`) and triggers
 * a 3-step email verification flow on successful submission.
 * The SuccessModal is shown when the backend confirms message delivery.
 *
 * @module components/sections/ContactSection
 */
'use client'

import type { JSX } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { fadeUpProps } from '@/lib/animations'
import { Sparkles, ArrowRight, CheckCircle2, Mail, Copy, Check } from 'lucide-react'
import { useContactForm } from '@/lib/hooks/useContactForm'
import { SectionHeader, GradText } from '@/components/ui/SectionHeader'
import { SECTION_BG } from '@/lib/constants/theme'

/**
 * Interactive visitor contact form section for R&D inquiries and partner proposals.
 * Integrates with Spring Boot API client and 3-step Email Verification flow.
 *
 * @returns Rendered contact section component
 */
export const ContactSection = (): JSX.Element => {
  const { submitContactForm, resetForm, isLoading, isSuccess, inquiryId, successMessage, errorMessage, fieldErrors } = useContactForm()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  })

  const [submittedEmail, setSubmittedEmail] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)

  const MAX_WORDS = 500
  const wordCount = formData.message.trim() ? formData.message.trim().split(/\s+/).length : 0
  const isOverWordLimit = wordCount > MAX_WORDS

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleReset = () => {
    resetForm()
    setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' })
    setSubmittedEmail('')
    setCopiedCode(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isOverWordLimit) return
    const emailToSave = formData.email
    const success = await submitContactForm(formData)
    if (success) {
      setSubmittedEmail(emailToSave)
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' })
    }
  }

  return (
    <section id="contact" className={`py-16 sm:py-20 ${SECTION_BG.border} ${SECTION_BG.alternate} relative overflow-hidden`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── Section Header ──────────────────────────────────────── */}
        <SectionHeader
          pillLabel="CONNECT & COLLABORATE"
          title={
            <>
              Partnership.{' '}
              <GradText variant="sky">Collaboration.</GradText>{' '}
              <GradText variant="emerald">Innovation.</GradText>
            </>
          }
          description="Have an industrial challenge, pilot inquiry, or partnership proposal? Send us a message below."
        />
        {/* Hiring Banner + Social Links — merged into one card */}
        <motion.div
          {...fadeUpProps(0.05)}
          className="mx-auto -mt-3 mb-8 max-w-2xl rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-sky-50/80 backdrop-blur-md shadow-lg shadow-emerald-950/5 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 overflow-hidden"
        >
          {/* Row 1: Hiring */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left px-4 sm:px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                  We are Hiring
                </span>
                <p className="text-xs font-semibold text-slate-700 leading-snug">
                  Looking to shape the future of AI &amp; industrial automation with us?
                </p>
              </div>
            </div>

            <Link
              href="/join_us?from=contact"
              className="group inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
            >
              <span>Join our team</span>
              <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-emerald-200/60 mx-4 sm:mx-5" />

          {/* Row 2: Social Links */}
          <div className="flex items-center justify-center gap-3 px-4 sm:px-5 py-3">
            <span className="text-xs text-slate-500 font-medium">Follow us on</span>
            <a
              href="https://www.linkedin.com/company/nevolyn/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NEVOLYN Technology on LinkedIn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0a66c2] bg-white/80 border border-slate-200 shadow-sm hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>LinkedIn</span>
            </a>
            <a
              href="https://www.facebook.com/nevolyn/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NEVOLYN Technology on Facebook"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1877f2] bg-white/80 border border-slate-200 shadow-sm hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>
          </div>
        </motion.div>

        <motion.div {...fadeUpProps(0.1)} className="bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Top Multi-Chromatic Accent Beam */}
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-emerald-400 to-rose-400" />

          <div className="p-4 sm:p-10">
            {errorMessage && !isSuccess && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-sm">
                {errorMessage}
              </div>
            )}

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 sm:space-y-6 text-center py-1 sm:py-2"
                >
                  {/* Glowing Icon Header */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/25 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.4]" />
                      </div>
                    </div>
                  </div>

                  {/* Header Content */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Inquiry Received!
                    </h3>
                    <p className="text-xs sm:text-base text-emerald-700 font-medium max-w-lg mx-auto px-1 sm:px-0">
                      {successMessage || 'Thank you for reaching out to NEVOLYN. Your message has been safely logged.'}
                    </p>
                  </div>

                  {/* Tracking Reference Code Pill (if present) */}
                  {inquiryId && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-3.5 sm:p-4 max-w-md mx-auto">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">
                        Tracking Reference Code
                      </span>
                      <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
                        <span className="font-mono text-base sm:text-xl font-black tracking-wider text-emerald-800 select-all break-all">
                          {inquiryId}
                        </span>
                        <button
                          onClick={() => handleCopyCode(inquiryId)}
                          type="button"
                          title="Copy Reference Code"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-400/40 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold active:scale-95 shadow-2xs cursor-pointer shrink-0"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600 group-hover:text-white" />
                              <span>Copied!</span>
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
                  )}

                  {/* Target Email Callout */}
                  {submittedEmail && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4 max-w-md mx-auto text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 shrink-0">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Receipt Sent to</p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 break-all sm:truncate">{submittedEmail}</p>
                          </div>
                        </div>
                        <span className="self-start sm:self-auto inline-flex items-center text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                          Confirmation Sent
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Instructions ("What happens next") */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 text-left max-w-lg mx-auto space-y-2.5 sm:space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      What happens next:
                    </p>
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        1
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        Check your email inbox for your submission receipt and tracking reference code.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        2
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        Our team will evaluate your inquiry and send you an email acknowledging its receipt.
                      </p>
                    </div>
                  </div>

                  {/* Reset Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-500 hover:brightness-105 text-white px-8 py-3.5 text-sm font-bold shadow-lg shadow-sky-400/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                      <span>Send Another Message</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                  noValidate
                >
                  {/* Honeypot anti-spam field (hidden from real users) */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="contact-hp">Do not fill this out</label>
                    <input
                      id="contact-hp"
                      type="text"
                      name="hp"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.honeypot}
                      onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
                        Full Name <span className="text-sky-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full bg-slate-50 border ${fieldErrors.name ? 'border-rose-500' : 'border-slate-300'
                          } rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors`}
                        placeholder="Your Name"
                      />
                      {fieldErrors.name && <p className="text-xs text-rose-500 mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
                        Email Address <span className="text-sky-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full bg-slate-50 border ${fieldErrors.email ? 'border-rose-500' : 'border-slate-300'
                          } rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors`}
                        placeholder="name@example.com"
                      />
                      {fieldErrors.email && <p className="text-xs text-rose-500 mt-1">{fieldErrors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-subject" className="text-sm font-medium text-slate-700">
                      Subject <span className="text-sky-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full bg-slate-50 border ${fieldErrors.subject ? 'border-rose-500' : 'border-slate-300'
                        } rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors`}
                      placeholder="How can we help?"
                    />
                    {fieldErrors.subject && <p className="text-xs text-rose-500 mt-1">{fieldErrors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="contact-message" className="text-sm font-medium text-slate-700">
                        Message <span className="text-sky-500">*</span>
                      </label>
                      <span className={`text-xs font-semibold ${isOverWordLimit ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                        {wordCount} / {MAX_WORDS} words
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full bg-slate-50 border ${fieldErrors.message || isOverWordLimit ? 'border-rose-500' : 'border-slate-300'
                        } rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors resize-none`}
                      placeholder="Write your message here (max 500 words)..."
                    ></textarea>
                    {isOverWordLimit && (
                      <p className="text-xs text-rose-500 mt-1 font-semibold">Message cannot exceed {MAX_WORDS} words.</p>
                    )}
                    {fieldErrors.message && !isOverWordLimit && <p className="text-xs text-rose-500 mt-1">{fieldErrors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isOverWordLimit}
                    className="w-full rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-400/25 transition-all duration-300 hover:shadow-sky-400/40 hover:brightness-105 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
