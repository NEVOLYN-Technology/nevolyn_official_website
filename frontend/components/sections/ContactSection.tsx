'use client'

import type { JSX } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUpProps } from '@/lib/animations'
import { SuccessModal } from '@/components/ui/SuccessModal'
import { useContactForm } from '@/lib/hooks/useContactForm'

/**
 * Interactive visitor contact form section for R&D inquiries and partner proposals.
 * Integrates with Spring Boot API client and 3-step Email Verification flow.
 *
 * @returns Rendered contact section component
 */
export const ContactSection = (): JSX.Element => {
  const { submitContactForm, isLoading, isSuccess, successMessage, errorMessage, fieldErrors } = useContactForm()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  })

  const [submittedEmail, setSubmittedEmail] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const MAX_WORDS = 500
  const wordCount = formData.message.trim() ? formData.message.trim().split(/\s+/).length : 0
  const isOverWordLimit = wordCount > MAX_WORDS

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isOverWordLimit) return
    const emailToSave = formData.email
    const success = await submitContactForm(formData)
    if (success) {
      setSubmittedEmail(emailToSave)
      setIsModalOpen(true)
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' })
    }
  }

  return (
    <section id="contact" className="py-16 sm:py-20 border-t border-sky-300/60 bg-[#deebf9] relative overflow-hidden">
      {/* Animated Success Popup Modal */}
      <SuccessModal
        isOpen={isModalOpen && isSuccess}
        onClose={() => setIsModalOpen(false)}
        title="Inquiry Received!"
        message={successMessage}
        email={submittedEmail}
        formType="contact"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm mb-4 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="tracking-wide uppercase">CONNECT &amp; COLLABORATE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Partnership.{' '}
            <span className="bg-gradient-to-r from-sky-400 to-sky-500 bg-clip-text text-transparent">
              Collaboration.
            </span>{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Innovation.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Have an industrial challenge, pilot inquiry, or partnership proposal? Send us a message below.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto mt-2.5 font-normal">
            Looking to shape the future of AI &amp; industrial automation with us?{' '}
            <Link
              href="/join_us"
              className="font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Join our team &rarr;
            </Link>
          </p>
        </div>

        <motion.div {...fadeUpProps(0.1)} className="bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Top Multi-Chromatic Accent Beam */}
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-emerald-400 to-rose-400" />

          <div className="p-6 sm:p-10">
            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
