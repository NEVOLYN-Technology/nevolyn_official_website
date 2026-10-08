'use client'

import type { JSX } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, UploadCloud, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageShell } from '@/components/layout/PageShell'
import { cn } from '@/lib/utils'
import { useJoinForm } from '@/lib/hooks/useJoinForm'
import { JoinPreviewView } from '@/components/join/JoinPreviewView'
import { JoinSuccessView } from '@/components/join/JoinSuccessView'

/**
 * Job application form page component following the FABINS multi-step workflow:
 * 1. Editing: Candidate inputs credentials and CV document.
 * 2. Previewing: Interactive pre-flight preview where candidate can review, go back to edit, or confirm dispatch.
 * 3. Submitted: Official success screen with reference code and ONLY ONE action button: Download Application PDF.
 *
 * @returns Rendered join application page element
 */
export default function JoinPage(): JSX.Element {
  const router = useRouter()
  const {
    submitJoinForm,
    errorMessage: apiErrorMessage,
    fieldErrors,
    pdfUrl,
    applicationId,
  } = useJoinForm()

  const [status, setStatus] = useState<'editing' | 'previewing' | 'sending' | 'submitted'>('editing')
  const [localError, setLocalError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    nid: '',
    reason: '',
    linkedin: '',
    github: '',
    website: '',
    honeypot: '',
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const MAX_WORDS = 500
  const wordCount = formData.reason.trim() ? formData.reason.trim().split(/\s+/).length : 0
  const isOverWordLimit = wordCount > MAX_WORDS

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Email format validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Handle Initial Form Submission -> Validates all credentials and transitions to Preview
  const handleProceedToPreview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)

    if (!formData.name.trim()) {
      setLocalError('Please enter your full name.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.email.trim() || !isValidEmail(formData.email.trim())) {
      setLocalError('Please enter a valid email address.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 5) {
      setLocalError('Please enter a valid phone number.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.nid.trim()) {
      setLocalError('Please enter your National ID (NID).')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.address.trim()) {
      setLocalError('Please enter your location or address.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.reason.trim()) {
      setLocalError('Please share why you wish to join NEVOLYN.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (isOverWordLimit) {
      setLocalError(`Statement exceeds ${MAX_WORDS} words limit.`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!selectedFile) {
      setLocalError('Please attach your CV/Resume document (.pdf, .doc, .docx).')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Credentials validated: transition to preview view
    setStatus('previewing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Final Confirmed Dispatch from Preview View to backend
  const handleConfirmSubmit = async () => {
    setLocalError(null)
    setStatus('sending')

    const emailToSave = formData.email
    const success = await submitJoinForm({
      ...formData,
      resume: selectedFile,
    })

    if (success) {
      setSubmittedEmail(emailToSave)
      setStatus('submitted')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setStatus('previewing')
      setLocalError(apiErrorMessage || 'Application submission failed. Please review your details.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      nid: '',
      reason: '',
      linkedin: '',
      github: '',
      website: '',
      honeypot: '',
    })
    setSelectedFile(null)
    setLocalError(null)
    setStatus('editing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyTrackingCode = async () => {
    const code = applicationId || 'APP-2026-CONFIRMED'
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      // Fallback
    }
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      const isExternal =
        document.referrer &&
        !document.referrer.startsWith(window.location.origin)

      if (!isExternal) {
        router.back()
        return
      }
    }

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const fromSource = params?.get('from')

    if (fromSource && fromSource !== 'home') {
      router.push(`/#${fromSource}`)
    } else {
      router.push('/')
    }
  }

  const errorMessage = localError || apiErrorMessage
  const isSending = status === 'sending'

  return (
    <PageShell>
      <div className="relative pt-8 sm:pt-12 pb-20 overflow-hidden">
        {/* Dynamic Multi-State Container following FABINS workflow */}
        <AnimatePresence mode="wait">
          {status === 'submitted' ? (
            <JoinSuccessView
              referenceCode={applicationId || 'APP-2026-CONFIRMED'}
              copiedCode={copiedCode}
              onCopyCode={copyTrackingCode}
              senderEmail={submittedEmail}
              pdfUrl={pdfUrl}
              onResetForm={handleResetForm}
            />
          ) : status === 'previewing' || status === 'sending' ? (
            <div className="space-y-6">
              {errorMessage && (
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs sm:text-sm font-semibold text-rose-500 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <JoinPreviewView
                formData={formData}
                selectedFile={selectedFile}
                onBackToEdit={() => {
                  setStatus('editing')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onConfirmSubmit={handleConfirmSubmit}
                isSending={isSending}
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-8 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 sm:p-10 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200"
              >
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight uppercase text-slate-900">
                    Join <span className="text-blue-600">Our Team</span>
                  </h1>
                  <p className="text-slate-600">
                    We're always looking for brilliant minds to help us pioneer the future of AI, intelligent systems, and next-generation engineering.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">
                    {errorMessage}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleProceedToPreview}>
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
                      <label htmlFor="join-name" className="text-sm font-medium text-slate-700">
                        Full Name <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="join-name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-blue-500 text-slate-900 transition-all text-sm',
                          fieldErrors.name ? 'border-rose-500' : 'border-slate-200'
                        )}
                        placeholder="John Doe"
                      />
                      {fieldErrors.name && <p className="text-xs text-rose-500 mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="join-email" className="text-sm font-medium text-slate-700">
                        Email Address <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="email"
                        id="join-email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-blue-500 text-slate-900 transition-all text-sm',
                          fieldErrors.email ? 'border-rose-500' : 'border-slate-200'
                        )}
                        placeholder="john@example.com"
                      />
                      {fieldErrors.email && <p className="text-xs text-rose-500 mt-1">{fieldErrors.email}</p>}
                    </div>
                  </div>

                  {/* Phone & National ID (NID) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="join-phone" className="text-sm font-medium text-slate-700">
                        Phone Number <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="tel"
                        id="join-phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-blue-500 text-slate-900 transition-all text-sm',
                          fieldErrors.phone ? 'border-rose-500' : 'border-slate-200'
                        )}
                        placeholder="+88017XXXXXXXX"
                      />
                      {fieldErrors.phone && <p className="text-xs text-rose-500 mt-1">{fieldErrors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="join-nid" className="text-sm font-medium text-slate-700">
                        National ID (NID) <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="join-nid"
                        name="nid"
                        required
                        value={formData.nid}
                        onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-blue-500 text-slate-900 transition-all text-sm font-mono',
                          fieldErrors.nid ? 'border-rose-500' : 'border-slate-200'
                        )}
                        placeholder="e.g. 199XXXXXXXXXX or NID number"
                      />
                      {fieldErrors.nid && <p className="text-xs text-rose-500 mt-1">{fieldErrors.nid}</p>}
                    </div>
                  </div>

                  {/* Address & Portfolio / Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="join-address" className="text-sm font-medium text-slate-700">
                        Residential Address / Location <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="join-address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-blue-500 text-slate-900 transition-all text-sm',
                          fieldErrors.address ? 'border-rose-500' : 'border-slate-200'
                        )}
                        placeholder="Dhaka, Bangladesh"
                      />
                      {fieldErrors.address && <p className="text-xs text-rose-500 mt-1">{fieldErrors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="join-website" className="text-sm font-medium text-slate-700">
                        Personal Website / Portfolio <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        id="join-website"
                        name="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-blue-500 text-slate-900 transition-all text-sm"
                        placeholder="https://portfolio.me"
                      />
                    </div>
                  </div>

                  {/* LinkedIn & GitHub */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="join-linkedin" className="text-sm font-medium text-slate-700">
                        LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        id="join-linkedin"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-blue-500 text-slate-900 transition-all text-sm"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="join-github" className="text-sm font-medium text-slate-700">
                        GitHub Profile <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        id="join-github"
                        name="github"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-blue-500 text-slate-900 transition-all text-sm"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>

                  {/* Statement of Purpose */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="join-reason" className="text-sm font-medium text-slate-700">
                        Why do you want to join us? <span className="text-blue-600">*</span>
                      </label>
                      <span className={cn('text-xs', isOverWordLimit ? 'text-rose-500 font-bold' : 'text-slate-400')}>
                        {wordCount}/{MAX_WORDS} words
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
                        'w-full px-4 py-3 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-blue-500 text-slate-900 transition-all text-sm resize-none',
                        fieldErrors.reason || isOverWordLimit ? 'border-rose-500' : 'border-slate-200'
                      )}
                      placeholder="What makes you think to build the future with NEVOLYN..."
                    />
                    {isOverWordLimit && (
                      <p className="text-xs text-rose-500 mt-1">
                        Your statement exceeds the 500-word limit. Please shorten it to continue.
                      </p>
                    )}
                    {fieldErrors.reason && <p className="text-xs text-rose-500 mt-1">{fieldErrors.reason}</p>}
                  </div>

                  {/* CV Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Resume / CV <span className="text-blue-600">*</span>
                    </label>
                    <div
                      className={cn(
                        'mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl hover:border-blue-500/60 transition-colors cursor-pointer bg-slate-50',
                        fieldErrors.resume ? 'border-rose-500' : 'border-slate-300'
                      )}
                    >
                      <div className="space-y-2 text-center">
                        {selectedFile ? (
                          <div className="flex flex-col items-center">
                            <FileText className="h-10 w-10 text-blue-600 mb-2" />
                            <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                            <p className="text-xs text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                            <div className="flex text-sm text-slate-600 justify-center">
                              <label
                                htmlFor="join-file-upload"
                                className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500"
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

                  {/* Submit Bar -> Proceed to Preview */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isOverWordLimit}
                      className={cn(
                        'w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-full shadow-md text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                        isOverWordLimit
                          ? 'bg-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-95'
                      )}
                    >
                      <span>Review Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  )
}
