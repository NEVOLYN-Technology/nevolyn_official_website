/**
 * Join Us page (/join_us) — application form for prospective team members.
 *
 * Collects: full name, email, phone, address, LinkedIn, GitHub, personal
 * website, motivation statement, and CV/resume file upload.
 *
 * ## Phase 2 — Spring Boot integration
 * Replace the `onSubmit` handler (currently `e.preventDefault()`) with a
 * `multipart/form-data` POST to the backend:
 *
 * ```ts
 * async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 *   e.preventDefault()
 *   const formData = new FormData(e.currentTarget) // includes the file
 *   await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, {
 *     method: 'POST',
 *     body: formData, // do NOT set Content-Type header — browser sets it with boundary
 *   })
 * }
 * ```
 *
 * @module app/join_us/page
 */
'use client'

import type { JSX } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { cn } from '@/lib/utils'

/**
 * Job application form page component allowing candidate information and CV PDF upload.
 *
 * @returns Rendered join application page element
 */
export default function JoinPage(): JSX.Element {
  const [reason, setReason] = useState('')
  const MAX_WORDS = 250
  const wordCount = reason.trim() ? reason.trim().split(/\s+/).length : 0
  const isOverWordLimit = wordCount > MAX_WORDS

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-[#0a1526] p-8 md:p-12 rounded-3xl shadow-xl dark:shadow-none border border-slate-200 dark:border-slate-800/80"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight uppercase">Join <span className="text-orange-500">Our Team</span></h1>
            <p className="text-slate-600 dark:text-slate-400">
              We're always looking for brilliant minds to help us pioneer the future of textile automation.
            </p>
          </div>

          {/*
           * TODO (Phase 2 — Spring Boot): Add an onSubmit handler that POSTs
           * this form as multipart/form-data to `/api/applications`.
           * See the module JSDoc above for the implementation guide.
           */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="join-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-orange-500">*</span></label>
                <input
                  type="text"
                  id="join-name"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="join-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address <span className="text-orange-500">*</span></label>
                <input
                  type="email"
                  id="join-email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="join-phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number <span className="text-orange-500">*</span>
                </label>
                <div className="flex rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus-within:ring-2 focus-within:ring-orange-500/50 transition-all overflow-hidden">
                  <span className="px-3.5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 border-r border-slate-200 dark:border-slate-800/80 shrink-0 flex items-center justify-center">
                    +880
                  </span>
                  <input
                    type="tel"
                    id="join-phone"
                    name="phone"
                    required
                    className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm"
                    placeholder="17XX-XXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="join-address" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Present Address <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  id="join-address"
                  name="address"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all text-sm"
                  placeholder="123 Innovation Drive, City, Country"
                />
              </div>
            </div>

            {/* LinkedIn & GitHub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="join-linkedin" className="text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="url"
                  id="join-linkedin"
                  name="linkedin"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="join-github" className="text-sm font-medium text-slate-700 dark:text-slate-300">GitHub Profile <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="url"
                  id="join-github"
                  name="github"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            {/* Personal Website */}
            <div className="space-y-2">
              <label htmlFor="join-website" className="text-sm font-medium text-slate-700 dark:text-slate-300">Personal Website <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="url"
                id="join-website"
                name="website"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Motivation */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="join-reason" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Why do you want to join us? <span className="text-orange-500">*</span>
                </label>
                <span className={cn("text-xs font-semibold", isOverWordLimit ? "text-red-500 font-bold" : "text-slate-400")}>
                  {wordCount} / {MAX_WORDS} words
                </span>
              </div>
              <textarea
                id="join-reason"
                name="reason"
                required
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border focus:outline-none focus:ring-2 dark:text-white transition-all resize-none text-sm",
                  isOverWordLimit
                    ? "border-red-500 focus:ring-red-500/50"
                    : "border-slate-200 dark:border-slate-800/80 focus:ring-orange-500/50"
                )}
                placeholder="Tell us about your passion for textile innovation and automation (Max 250 words)..."
              />
              {isOverWordLimit && (
                <p className="text-xs text-red-500 font-semibold mt-1">
                  Please shorten your response to 250 words or less.
                </p>
              )}
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Resume / CV <span className="text-orange-500">*</span></label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer bg-slate-50 dark:bg-[#030812]">
                <div className="space-y-2 text-center">
                  <UploadCloud className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500" />
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <label htmlFor="join-file-upload" className="relative cursor-pointer rounded-md font-medium text-orange-500 hover:text-orange-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2">
                      <span>Upload a file</span>
                      <input id="join-file-upload" name="resume" type="file" className="sr-only" required accept=".pdf,.doc,.docx" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isOverWordLimit}
                className={cn(
                  "w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all cursor-pointer",
                  isOverWordLimit
                    ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-orange-500/25 hover:shadow-orange-500/40"
                )}
              >
                Submit Application
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageShell>
  )
}
