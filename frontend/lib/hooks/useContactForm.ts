import { useState } from 'react'
import { apiClient, type ApiErrorResponse, type ApiFieldError } from '@/lib/apiClient'

/** Fields posted to `POST /api/v1/contact`. */
export interface ContactPayload extends Record<string, unknown> {
  name: string
  email: string
  subject: string
  message: string
  /** Bot trap — must stay empty for a real submission. */
  honeypot?: string
}

/** Shape of `data` in the contact endpoint's success envelope. */
export interface ContactResult {
  inquiryId: string
  status: string
  requiresVerification: boolean
  isVerified: boolean
}

/** Narrows an unknown thrown value to the API's error envelope. */
function isApiError(value: unknown): value is ApiErrorResponse {
  return typeof value === 'object' && value !== null && 'message' in value
}

/**
 * Submits the visitor contact form and exposes request state to the UI.
 *
 * Submission only starts step 1 of the pipeline: the backend persists the
 * inquiry and emails a verification link. The inquiry does not reach the R&D
 * team until the visitor clicks that link.
 */
export function useContactForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const submitContactForm = async (payload: ContactPayload): Promise<boolean> => {
    // Honeypot: a filled hidden field means a bot. Show the normal success state
    // so the bot cannot tell it was caught, and never call the API.
    if (payload.honeypot && payload.honeypot.trim() !== '') {
      setIsSuccess(true)
      setSuccessMessage('Thank you! Your message has been received.')
      return true
    }

    setIsLoading(true)
    setFieldErrors({})
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSuccess(false)

    try {
      const response = await apiClient.post<ContactResult>('/contact', payload)

      if (response.success || response.status === 'success') {
        setIsSuccess(true)
        setSuccessMessage(response.message || 'Thank you! Your message has been received and a confirmation receipt has been sent to your email.')
        return true
      }

      setErrorMessage(response.message || 'Submission failed.')
      return false
    } catch (err: unknown) {
      if (isApiError(err)) {
        setErrorMessage(err.message || 'Failed to submit contact message. Please try again.')

        if (err.errors?.length) {
          const mapped: Record<string, string> = {}
          err.errors.forEach((fieldError: ApiFieldError) => {
            mapped[fieldError.field] = fieldError.message
          })
          setFieldErrors(mapped)
        }
      } else {
        setErrorMessage('Failed to submit contact message. Please try again.')
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { submitContactForm, isLoading, isSuccess, successMessage, errorMessage, fieldErrors }
}
