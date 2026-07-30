import { useState } from 'react'
import { apiClient, ApiResponse, ApiErrorResponse, ApiFieldError } from '@/lib/apiClient'

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
  honeypot?: string
}

export function useContactForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const submitContactForm = async (payload: ContactPayload): Promise<boolean> => {
    // Honeypot Bot Trap Check
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
      const response = await apiClient.post('/contact', payload)
      if (response.success) {
        setIsSuccess(true)
        setSuccessMessage(response.message || 'Please check your email to verify your address.')
        return true
      }
      setErrorMessage(response.message || 'Submission failed.')
      return false
    } catch (err: any) {
      const errorResp = err as ApiErrorResponse
      setErrorMessage(errorResp.message || 'Failed to submit contact message. Please try again.')

      if (errorResp.errors && errorResp.errors.length > 0) {
        const mapped: Record<string, string> = {}
        errorResp.errors.forEach((e: ApiFieldError) => {
          mapped[e.field] = e.message
        })
        setFieldErrors(mapped)
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { submitContactForm, isLoading, isSuccess, successMessage, errorMessage, fieldErrors }
}
