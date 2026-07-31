import { useState } from 'react'
import { apiClient, type ApiErrorResponse, type ApiFieldError } from '@/lib/apiClient'

/** Fields posted as multipart/form-data to `POST /api/v1/applications`. */
export interface JoinPayload {
  name: string
  email: string
  phone: string
  address: string
  reason: string
  linkedin?: string
  github?: string
  website?: string
  /** Bot trap — must stay empty for a real submission. */
  honeypot?: string
  resume: File | null
}

/** Shape of `data` in the applications endpoint's success envelope. */
export interface JoinResult {
  applicationId: string
  fileName: string
  status: string
  requiresVerification: boolean
  isVerified: boolean
}

/** Mirrors spring.servlet.multipart.max-file-size in application.yml. */
const MAX_RESUME_BYTES = 10 * 1024 * 1024

/** Narrows an unknown thrown value to the API's error envelope. */
function isApiError(value: unknown): value is ApiErrorResponse {
  return typeof value === 'object' && value !== null && 'message' in value
}

/**
 * Submits the careers application form and exposes request state to the UI.
 *
 * Like the contact form, this only starts step 1: the CV is stored and a
 * verification email is sent. HR is not notified — and the CV is not attached to
 * anything — until the candidate clicks the link in that email.
 */
export function useJoinForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const submitJoinForm = async (payload: JoinPayload): Promise<boolean> => {
    // Honeypot: a filled hidden field means a bot. Mimic success without
    // calling the API so the bot cannot detect the trap.
    if (payload.honeypot && payload.honeypot.trim() !== '') {
      setIsSuccess(true)
      setSuccessMessage('Thank you for applying! A confirmation receipt has been sent to your email.')
      return true
    }

    setFieldErrors({})
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validate the upload before spending a round trip on it. The backend
    // enforces the same limits regardless.
    if (!payload.resume) {
      setFieldErrors({ resume: 'Please attach your CV/Resume document (.pdf, .doc, .docx).' })
      return false
    }
    if (payload.resume.size > MAX_RESUME_BYTES) {
      setFieldErrors({ resume: 'File size exceeds maximum limit of 10MB.' })
      return false
    }

    const formData = new FormData()
    formData.append('name', payload.name)
    formData.append('email', payload.email)
    formData.append('phone', payload.phone)
    formData.append('address', payload.address)
    formData.append('reason', payload.reason)
    if (payload.linkedin) formData.append('linkedin', payload.linkedin)
    if (payload.github) formData.append('github', payload.github)
    if (payload.website) formData.append('website', payload.website)
    if (payload.honeypot) formData.append('honeypot', payload.honeypot)
    formData.append('resume', payload.resume)

    setIsLoading(true)

    try {
      const response = await apiClient.post<JoinResult>('/applications', formData)

      if (response.success || response.status === 'success') {
        setIsSuccess(true)
        setSuccessMessage(
          response.message || 'Application received! A confirmation receipt has been sent to your email.',
        )
        return true
      }

      setErrorMessage(response.message || 'Application submission failed.')
      return false
    } catch (err: unknown) {
      if (isApiError(err)) {
        setErrorMessage(err.message || 'Failed to submit application. Please check form details.')

        if (err.errors?.length) {
          const mapped: Record<string, string> = {}
          err.errors.forEach((fieldError: ApiFieldError) => {
            mapped[fieldError.field] = fieldError.message
          })
          setFieldErrors(mapped)
        }
      } else {
        setErrorMessage('Failed to submit application. Please check form details.')
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { submitJoinForm, isLoading, isSuccess, successMessage, errorMessage, fieldErrors }
}
