/**
 * Admin API Client — Authenticated endpoints for NEVOLYN Operations Dashboard.
 *
 * Uses HTTP Basic auth (Base64 encoded credentials) against the Spring Boot backend.
 * All admin routes sit under /api/v1/admin and require ADMIN role.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminCredentials {
  username: string
  password: string
}

export interface InquiryRecord {
  id: number
  inquiryId: string
  name: string
  email: string
  subject: string
  message: string
  isVerified: boolean
  verifiedAt: string | null
  isAcknowledged: boolean
  acknowledgedAt: string | null
  status: 'NEW' | 'ACKNOWLEDGED' | 'REPLIED' | 'IN_REVIEW' | 'CONTACTED' | 'CLOSED'
  createdAt: string
}

export interface ApplicationRecord {
  id: number
  applicationId: string
  name: string
  email: string
  phone: string
  nid: string
  address: string
  reason: string
  linkedin?: string
  github?: string
  website?: string
  originalFileName: string
  fileSizeBytes?: number
  fileContentType?: string
  isVerified: boolean
  verifiedAt: string | null
  isAcknowledged: boolean
  acknowledgedAt: string | null
  isSelected: boolean
  selectionStatus: 'PENDING' | 'IN_REVIEW' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'
  selectedAt: string | null
  reviewNotes?: string
  createdAt: string
}

export interface PageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface AdminStats {
  totalInquiries: number
  newInquiries: number
  acknowledgedInquiries?: number
  repliedInquiries?: number
  inReviewInquiries: number
  contactedInquiries: number
  closedInquiries: number
  totalApplications: number
  pendingApplications: number
  inReviewApplications: number
  shortlistedApplications: number
  rejectedApplications: number
  hiredApplications?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Base URL resolution
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL: string = (() => {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080')
  // Strip /api/v1 suffix if present — we rebuild it per-request
  return raw.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '')
})()

// ─────────────────────────────────────────────────────────────────────────────
// Auth header
// ─────────────────────────────────────────────────────────────────────────────

function getAuthHeader(credentials: AdminCredentials): string {
  const token =
    typeof window !== 'undefined'
      ? window.btoa(`${credentials.username}:${credentials.password}`)
      : Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')
  return `Basic ${token}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth verification — hits the protected stats endpoint
// ─────────────────────────────────────────────────────────────────────────────

export async function verifyAdminCredentials(credentials: AdminCredentials): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, {
      headers: {
        Authorization: getAuthHeader(credentials),
        Accept: 'application/json',
      },
    })
    return res.status === 200
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAdminStats(credentials: AdminCredentials): Promise<AdminStats> {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, {
    headers: { Authorization: getAuthHeader(credentials), Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to fetch stats: HTTP ${res.status}`)
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact Inquiries
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchInquiries(
  credentials: AdminCredentials,
  params?: { status?: string; search?: string; page?: number; size?: number; sort?: string }
): Promise<PageResult<InquiryRecord>> {
  const query = new URLSearchParams()
  if (params?.status && params.status !== 'ALL') query.set('status', params.status)
  if (params?.search) query.set('search', params.search)
  if (params?.page !== undefined) query.set('page', String(params.page))
  query.set('size', String(params?.size ?? 100))
  if (params?.sort) query.set('sort', params.sort)

  const url = `${API_BASE_URL}/api/v1/admin/contact-inquiries${query.size ? `?${query}` : ''}`
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(credentials), Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to fetch inquiries: HTTP ${res.status}`)
  return res.json()
}

export async function updateInquiryStatus(
  credentials: AdminCredentials,
  id: number,
  newStatus: InquiryRecord['status']
): Promise<InquiryRecord> {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/contact-inquiries/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: getAuthHeader(credentials),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  })
  if (!res.ok) throw new Error(`Failed to update inquiry status: HTTP ${res.status}`)
  return res.json()
}

export async function deleteInquiry(credentials: AdminCredentials, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/contact-inquiries/${id}`, {
    method: 'DELETE',
    headers: { Authorization: getAuthHeader(credentials) },
  })
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete inquiry: HTTP ${res.status}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Job Applications
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchApplications(
  credentials: AdminCredentials,
  params?: { status?: string; search?: string; page?: number; size?: number; sort?: string }
): Promise<PageResult<ApplicationRecord>> {
  const query = new URLSearchParams()
  if (params?.status && params.status !== 'ALL') query.set('status', params.status)
  if (params?.search) query.set('search', params.search)
  if (params?.page !== undefined) query.set('page', String(params.page))
  query.set('size', String(params?.size ?? 100))
  if (params?.sort) query.set('sort', params.sort)

  const url = `${API_BASE_URL}/api/v1/admin/applications${query.size ? `?${query}` : ''}`
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(credentials), Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to fetch applications: HTTP ${res.status}`)
  return res.json()
}

export async function updateApplicationStatus(
  credentials: AdminCredentials,
  id: number,
  newStatus: ApplicationRecord['selectionStatus'],
  reviewNotes?: string
): Promise<ApplicationRecord> {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/applications/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: getAuthHeader(credentials),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status: newStatus, reviewNotes }),
  })
  if (!res.ok) throw new Error(`Failed to update application status: HTTP ${res.status}`)
  return res.json()
}

export async function deleteApplication(credentials: AdminCredentials, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/applications/${id}`, {
    method: 'DELETE',
    headers: { Authorization: getAuthHeader(credentials) },
  })
  if (!res.ok && res.status !== 204)
    throw new Error(`Failed to delete application: HTTP ${res.status}`)
}

export function getApplicationPdfDownloadUrl(applicationId: string): string {
  return `${API_BASE_URL}/api/v1/applications/${applicationId}/pdf`
}

