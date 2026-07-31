'use client'

import type { JSX } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUpProps } from '@/lib/animations'
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

  /**
   * Posts the form and clears it only on success, so a failed attempt keeps
   * what the visitor typed.
   *
   * COLD START: the API runs on Render's free tier, which suspends the instance
   * after ~15 minutes idle. The first submission after a quiet period waits on a
   * full container wake-up — commonly 30-50s — so `apiClient` allows a 60s
   * window before giving up (see REQUEST_TIMEOUT_MS in lib/apiClient.ts).
   * The button stays disabled with a spinner for that entire period; do not
   * shorten the timeout without also giving the user a way to retry, or the
   * first submission of the day will fail while the request was about to
   * succeed.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const success = await submitContactForm(formData)
    if (success) {
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' })
    }
  }

  return (
    <section id="contact" className="py-12 border-t border-slate-200 dark:border-blue-950/40 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-500 uppercase">Connect with Us</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Have a project in mind or want to collaborate? Send us a message and our R&D team will get back to you. If you want to join our team{' '}
            <a href="/join_us" className="font-semibold text-orange-500 hover:text-orange-400 underline underline-offset-4 transition-colors">
              click here
            </a>
          </p>
        </div>

        <motion.div {...fadeUpProps(0.1)} className="bg-white dark:bg-[#0a1526]/60 border border-slate-200 dark:border-slate-800/60 p-8 md:p-10 rounded-2xl backdrop-blur-sm shadow-sm dark:shadow-none">
          {isSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
              <div className="font-bold mb-1 text-base">✔ Message Received!</div>
              <p>{successMessage}</p>
              <p className="mt-2 text-xs text-emerald-500/80">Please check your email inbox to click the verification link and confirm your submission.</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
              {errorMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Hidden Honeypot Input for Bot Detection */}
            <input
              type="text"
              name="website_url"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-[#030a15]/80 border ${
                    fieldErrors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  } rounded-lg px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                  placeholder="John Doe"
                />
                {fieldErrors.name && <p className="text-xs text-rose-500 mt-1">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-orange-500">*</span>
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-[#030a15]/80 border ${
                    fieldErrors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  } rounded-lg px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                  placeholder="john@example.com"
                />
                {fieldErrors.email && <p className="text-xs text-rose-500 mt-1">{fieldErrors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-subject" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Subject <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                id="contact-subject"
                name="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full bg-slate-50 dark:bg-[#030a15]/80 border ${
                  fieldErrors.subject ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                } rounded-lg px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                placeholder="How can we help?"
              />
              {fieldErrors.subject && <p className="text-xs text-rose-500 mt-1">{fieldErrors.subject}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Message <span className="text-orange-500">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`w-full bg-slate-50 dark:bg-[#030a15]/80 border ${
                  fieldErrors.message ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                } rounded-lg px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none`}
                placeholder="Write your message here..."
              ></textarea>
              {fieldErrors.message && <p className="text-xs text-rose-500 mt-1">{fieldErrors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 font-semibold text-white shadow-lg shadow-orange-950/50 transition-all duration-300 hover:brightness-110 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
        </motion.div>
      </div>
    </section>
  )
}
