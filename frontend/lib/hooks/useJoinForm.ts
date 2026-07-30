import { useState } from 'react'
import { apiClient, ApiResponse, ApiErrorResponse, ApiFieldError } from '@/lib/apiClient'

export interface JoinPayload {
  name: string
  email: string
  phone: string
  address: string
  reason: string
  linkedin?: string
  github?: string
  website?: string
  honeypot?: string
  resume: File | null
}

export function useJoinForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const submitJoinForm = async (payload: JoinPayload): Promise<boolean> => {
    // Honeypot Bot Trap Check
    if (payload.honeypot && payload.honeypot.trim() !== '') {
      setIsSuccess(true)
      setSuccessMessage('Thank you for applying! Please check your email to verify your address.')
      return true
    }

    setFieldErrors({})
    setErrorMessage(null)
    setSuccessMessage(null)

    // Client-side Resume File Validation
    if (!payload.resume) {
      setFieldErrors({ resume: 'Please attach your CV/Resume document (.pdf, .doc, .docx).' })
      return false
    }

    const maxSizeBytes = 10 * 1024 * 1024 // 10MB
    if (payload.resume.size > maxSizeBytes) {
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
      const response = await apiClient.post('/applications', formData)

      if (response.success) {
        setIsSuccess(true)
        setSuccessMessage(response.message || 'Application received! Please check your email to verify your address.')
        return true
      }
      setErrorMessage(response.message || 'Application submission failed.')
      return false
    } catch (err: any) {
      const errorResp = err as ApiErrorResponse
      setErrorMessage(errorResp.message || 'Failed to submit application. Please check form details.')

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

  return { submitJoinForm, isLoading, isSuccess, successMessage, errorMessage, fieldErrors }
}
