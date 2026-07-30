'use client'

import type { JSX } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, UploadCloud, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { cn } from '@/lib/utils'
import { useJoinForm } from '@/lib/hooks/useJoinForm'

/**
 * Job application form page component allowing candidate information and CV document upload.
 * Integrates with Spring Boot API client and 3-step Email Verification flow.
 *
 * @returns Rendered join application page element
 */
export default function JoinPage(): JSX.Element {
  const { submitJoinForm, isLoading, isSuccess, successMessage, errorMessage, fieldErrors } = useJoinForm()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    reason: '',
    linkedin: '',
    github: '',
    website: '',
    honeypot: '',
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const MAX_WORDS = 250
  const wordCount = formData.reason.trim() ? formData.reason.trim().split(/\s+/).length : 0
  const isOverWordLimit = wordCount > MAX_WORDS

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isOverWordLimit) return

    const success = await submitJoinForm({
      ...formData,
      resume: selectedFile,
    })

    if (success) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        reason: '',
        linkedin: '',
        github: '',
        website: '',
        honeypot: '',
      })
      setSelectedFile(null)
    }
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 mb-8 transition-colors"
        >
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight uppercase">
              Join <span className="text-orange-500">Our Team</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              We're always looking for brilliant minds to help us pioneer the future of textile automation and industrial AI.
            </p>
          </div>

          {isSuccess && (
            <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <div className="flex items-center gap-3 font-bold text-lg mb-2">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <span>Application Submitted Successfully!</span>
              </div>
              <p className="text-sm leading-relaxed">{successMessage}</p>
              <p className="mt-3 text-xs text-emerald-500/80 font-medium">
                📩 We sent a verification link to your email. Click the link in your inbox to confirm your address and notify our HR & R&D leadership team.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
              {errorMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Hidden Honeypot Input for Bot Detection */}
            <input
              type="text"
              name="company_website"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="join-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  id="join-name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all text-sm',
                    fieldErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800/80'
                  )}
                  placeholder="John Doe"
                />
                {fieldErrors.name && <p className="text-xs text-rose-500 mt-1">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="join-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-orange-500">*</span>
                </label>
                <input
                  type="email"
                  id="join-email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all text-sm',
                    fieldErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800/80'
                  )}
                  placeholder="john@example.com"
                />
                {fieldErrors.email && <p className="text-xs text-rose-500 mt-1">{fieldErrors.email}</p>}
              </div>
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="join-phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number <span className="text-orange-500">*</span>
                </label>
                <div
                  className={cn(
                    'flex rounded-xl bg-slate-50 dark:bg-[#030812] border focus-within:ring-2 focus-within:ring-orange-500/50 transition-all overflow-hidden',
                    fieldErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800/80'
                  )}
                >
                  <span className="px-3.5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 border-r border-slate-200 dark:border-slate-800/80 shrink-0 flex items-center justify-center">
                    +880
                  </span>
                  <input
                    type="tel"
                    id="join-phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm"
                    placeholder="17XX-XXXXXX"
                  />
                </div>
                {fieldErrors.phone && <p className="text-xs text-rose-500 mt-1">{fieldErrors.phone}</p>}
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
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all text-sm',
                    fieldErrors.address ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800/80'
                  )}
                  placeholder="123 Innovation Drive, City, Country"
                />
                {fieldErrors.address && <p className="text-xs text-rose-500 mt-1">{fieldErrors.address}</p>}
              </div>
            </div>

            {/* LinkedIn & GitHub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="join-linkedin" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  id="join-linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all text-sm"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="join-github" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  GitHub Profile <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  id="join-github"
                  name="github"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all text-sm"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            {/* Personal Website */}
            <div className="space-y-2">
              <label htmlFor="join-website" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Personal Website <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                id="join-website"
                name="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white transition-all text-sm"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Motivation */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="join-reason" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Why do you want to join us? <span className="text-orange-500">*</span>
                </label>
                <span className={cn('text-xs font-semibold', isOverWordLimit ? 'text-rose-500 font-bold' : 'text-slate-400')}>
                  {wordCount} / {MAX_WORDS} words
                </span>
              </div>
              <textarea
                id="join-reason"
                name="reason"
                required
                rows={5}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#030812] border focus:outline-none focus:ring-2 dark:text-white transition-all resize-none text-sm',
                  isOverWordLimit
                    ? 'border-rose-500 focus:ring-rose-500/50'
                    : fieldErrors.reason
                    ? 'border-rose-500'
                    : 'border-slate-200 dark:border-slate-800/80 focus:ring-orange-500/50'
                )}
                placeholder="Tell us about your passion for textile innovation and automation (Max 250 words)..."
              />
              {isOverWordLimit && <p className="text-xs text-rose-500 font-semibold mt-1">Please shorten your response to 250 words or less.</p>}
              {fieldErrors.reason && <p className="text-xs text-rose-500 mt-1">{fieldErrors.reason}</p>}
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Resume / CV <span className="text-orange-500">*</span>
              </label>
              <div
                className={cn(
                  'mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer bg-slate-50 dark:bg-[#030812]',
                  fieldErrors.resume ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                )}
              >
                <div className="space-y-2 text-center">
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <FileText className="h-10 w-10 text-orange-500 mb-2" />
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500" />
                      <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                        <label
                          htmlFor="join-file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-orange-500 hover:text-orange-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="join-file-upload"
                            name="resume"
                            type="file"
                            className="sr-only"
                            required
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
              {fieldErrors.resume && <p className="text-xs text-rose-500 mt-1">{fieldErrors.resume}</p>}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || isOverWordLimit}
                className={cn(
                  'w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                  isOverWordLimit
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-orange-500/25 hover:shadow-orange-500/40'
                )}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageShell>
  )
}
