'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle } from 'lucide-react'
import {
  type ApplicationRecord,
  type InquiryRecord,
  type AdminCredentials,
  type AdminStats,
  verifyAdminCredentials,
  fetchAdminStats,
  fetchApplications,
  updateApplicationStatus,
  deleteApplication,
  fetchInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from '@/lib/api/admin'
import { AdminLoginCard } from '@/components/admin/AdminLoginCard'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminMetricsBanner } from '@/components/admin/AdminMetricsBanner'
import { AdminFilterToolbar } from '@/components/admin/AdminFilterToolbar'
import { ApplicationsTable } from '@/components/admin/ApplicationsTable'
import { InquiriesTable } from '@/components/admin/InquiriesTable'
import { ApplicationDetailModal } from '@/components/admin/ApplicationDetailModal'
import { InquiryDetailModal } from '@/components/admin/InquiryDetailModal'

const DEFAULT_STATS: AdminStats = {
  totalInquiries: 0,
  newInquiries: 0,
  inReviewInquiries: 0,
  contactedInquiries: 0,
  closedInquiries: 0,
  totalApplications: 0,
  pendingApplications: 0,
  inReviewApplications: 0,
  shortlistedApplications: 0,
  rejectedApplications: 0,
}

/**
 * NEVOLYN Operations & Executive Dashboard.
 * Route: /admin
 *
 * Implements the authentic NEVOLYN light theme with sky-blue accents, crisp card elevations,
 * real-time status management, CV dossier download, and dual applicant/inquiry control.
 */
export default function AdminDashboardPage() {
  // ── 1. Authentication State ──
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null)
  const [authInput, setAuthInput] = useState<AdminCredentials>({ username: '', password: '' })
  const [authError, setAuthError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState<boolean>(false)

  // ── 2. Data & Tab State ──
  const [activeTab, setActiveTab] = useState<'applications' | 'inquiries'>('applications')
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([])
  const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ── 3. Search & Filter State ──
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>('ALL')
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('ALL')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  // ── 4. Inspection Modals & Clipboard State ──
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // ── 5. Session Storage & Title Lifecycle ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'Operations Dashboard | NEVOLYN Technology'
      const savedAuth = sessionStorage.getItem('nevolyn_admin_auth')
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth)
          if (parsed.username && parsed.password) {
            setCredentials(parsed)
          }
        } catch {
          sessionStorage.removeItem('nevolyn_admin_auth')
        }
      }
    }
  }, [])

  // Auto-dismiss toast feedback messages after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // ── 6. Authentication Actions ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setIsVerifying(true)

    const valid = await verifyAdminCredentials(authInput)
    setIsVerifying(false)

    if (valid) {
      setCredentials(authInput)
      sessionStorage.setItem('nevolyn_admin_auth', JSON.stringify(authInput))
    } else {
      setAuthError('Invalid administrator credentials. Access refused.')
    }
  }

  const handleLogout = () => {
    setCredentials(null)
    sessionStorage.removeItem('nevolyn_admin_auth')
    setApplications([])
    setInquiries([])
    setStats(DEFAULT_STATS)
  }

  // ── 7. Data Synchronization ──
  const loadData = useCallback(async () => {
    if (!credentials) return
    setIsLoading(true)

    try {
      const [appRes, inqRes, statsRes] = await Promise.all([
        fetchApplications(credentials, { size: 100 }),
        fetchInquiries(credentials, { size: 100 }),
        fetchAdminStats(credentials).catch(() => DEFAULT_STATS),
      ])
      setApplications(appRes.content || [])
      setInquiries(inqRes.content || [])
      setStats(statsRes)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to synchronize with server'
      setToastMessage({ type: 'error', text: msg })
    } finally {
      setIsLoading(false)
    }
  }, [credentials])

  useEffect(() => {
    if (credentials) {
      loadData()
    }
  }, [credentials, loadData])

  // ── 8. Status Mutations & Item Deletion ──
  const handleApplicationStatusChange = async (
    id: number,
    newStatus: ApplicationRecord['selectionStatus'],
    reviewNotes?: string
  ) => {
    if (!credentials) return
    try {
      const updated = await updateApplicationStatus(credentials, id, newStatus, reviewNotes)
      setApplications((prev) => prev.map((item) => (item.id === id ? updated : item)))
      if (selectedApplication?.id === id) setSelectedApplication(updated)
      setToastMessage({
        type: 'success',
        text: `Application ${updated.applicationId} updated to ${newStatus}`,
      })
      // Refresh stats in background
      fetchAdminStats(credentials).then(setStats).catch(() => { })
    } catch {
      setToastMessage({ type: 'error', text: 'Could not update application status.' })
    }
  }

  const handleInquiryStatusChange = async (
    id: number,
    newStatus: InquiryRecord['status']
  ) => {
    if (!credentials) return
    try {
      const updated = await updateInquiryStatus(credentials, id, newStatus)
      setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)))
      if (selectedInquiry?.id === id) setSelectedInquiry(updated)
      setToastMessage({
        type: 'success',
        text: `Inquiry ${updated.inquiryId} updated to ${newStatus}`,
      })
      // Refresh stats in background
      fetchAdminStats(credentials).then(setStats).catch(() => { })
    } catch {
      setToastMessage({ type: 'error', text: 'Could not update inquiry status.' })
    }
  }

  const handleDeleteApplication = async (id: number, ref: string) => {
    if (!credentials) return
    if (!window.confirm(`Are you sure you want to permanently delete application ${ref}?`)) return

    try {
      await deleteApplication(credentials, id)
      setApplications((prev) => prev.filter((item) => item.id !== id))
      if (selectedApplication?.id === id) setSelectedApplication(null)
      setToastMessage({ type: 'success', text: `Application ${ref} deleted.` })
      fetchAdminStats(credentials).then(setStats).catch(() => { })
    } catch {
      setToastMessage({ type: 'error', text: 'Failed to delete application.' })
    }
  }

  const handleDeleteInquiry = async (id: number, ref: string) => {
    if (!credentials) return
    if (!window.confirm(`Are you sure you want to permanently delete inquiry ${ref}?`)) return

    try {
      await deleteInquiry(credentials, id)
      setInquiries((prev) => prev.filter((item) => item.id !== id))
      if (selectedInquiry?.id === id) setSelectedInquiry(null)
      setToastMessage({ type: 'success', text: `Inquiry ${ref} deleted.` })
      fetchAdminStats(credentials).then(setStats).catch(() => { })
    } catch {
      setToastMessage({ type: 'error', text: 'Failed to delete inquiry.' })
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── 9. Filter & Sort Memoization ──
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesStatus =
          applicationStatusFilter === 'ALL' || app.selectionStatus === applicationStatusFilter
        const q = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !q ||
          app.applicationId.toLowerCase().includes(q) ||
          app.name.toLowerCase().includes(q) ||
          app.email.toLowerCase().includes(q) ||
          app.phone.toLowerCase().includes(q) ||
          (app.nid && app.nid.toLowerCase().includes(q)) ||
          (app.reason && app.reason.toLowerCase().includes(q))
        return matchesStatus && matchesSearch
      })
      .sort((a, b) => {
        const tA = new Date(a.createdAt).getTime()
        const tB = new Date(b.createdAt).getTime()
        return sortOrder === 'desc' ? tB - tA : tA - tB
      })
  }, [applications, applicationStatusFilter, searchTerm, sortOrder])

  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter((i) => {
        const effectiveStatus = (i.status === 'NEW' && i.isAcknowledged) ? 'ACKNOWLEDGED' : i.status
        const matchesStatus = inquiryStatusFilter === 'ALL' || effectiveStatus === inquiryStatusFilter
        const q = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !q ||
          i.inquiryId.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.subject.toLowerCase().includes(q) ||
          (i.message && i.message.toLowerCase().includes(q))
        return matchesStatus && matchesSearch
      })
      .sort((a, b) => {
        const tA = new Date(a.createdAt).getTime()
        const tB = new Date(b.createdAt).getTime()
        return sortOrder === 'desc' ? tB - tA : tA - tB
      })
  }, [inquiries, inquiryStatusFilter, searchTerm, sortOrder])

  // ── 10. Conditional Render: Login Gate ──
  if (!credentials) {
    return (
      <AdminLoginCard
        authInput={authInput}
        setAuthInput={setAuthInput}
        onLogin={handleLogin}
        isVerifying={isVerifying}
        authError={authError}
      />
    )
  }

  // ── 11. Authenticated Operations Workspace ──
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <AdminHeader
        username={credentials.username}
        isLoading={isLoading}
        onRefresh={loadData}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Context-Aware Interactive KPI Metrics */}
        <AdminMetricsBanner
          activeTab={activeTab}
          applications={applications}
          inquiries={inquiries}
          stats={stats}
          activeStatusFilter={activeTab === 'applications' ? applicationStatusFilter : inquiryStatusFilter}
          onStatusFilterSelect={(status) => {
            if (activeTab === 'applications') {
              setApplicationStatusFilter(status)
            } else {
              setInquiryStatusFilter(status)
            }
          }}
        />

        {/* Toolbar & Filter Switchers */}
        <AdminFilterToolbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab)
            setSearchTerm('')
          }}
          applications={applications}
          inquiries={inquiries}
          filteredCount={activeTab === 'applications' ? filteredApplications.length : filteredInquiries.length}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          applicationStatusFilter={applicationStatusFilter}
          setApplicationStatusFilter={setApplicationStatusFilter}
          inquiryStatusFilter={inquiryStatusFilter}
          setInquiryStatusFilter={setInquiryStatusFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Active Data Table */}
        {activeTab === 'applications' ? (
          <ApplicationsTable
            applications={filteredApplications}
            searchTerm={searchTerm}
            statusFilter={applicationStatusFilter}
            copiedId={copiedId}
            onCopy={handleCopyCode}
            onStatusChange={(id, newStatus) => handleApplicationStatusChange(id, newStatus)}
            onSelect={(app) => setSelectedApplication(app)}
            onDelete={handleDeleteApplication}
          />
        ) : (
          <InquiriesTable
            inquiries={filteredInquiries}
            searchTerm={searchTerm}
            statusFilter={inquiryStatusFilter}
            copiedId={copiedId}
            onCopy={handleCopyCode}
            onStatusChange={handleInquiryStatusChange}
            onSelect={(inq) => setSelectedInquiry(inq)}
            onDelete={handleDeleteInquiry}
          />
        )}
      </main>

      {/* Detail Inspection Modals */}
      <ApplicationDetailModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdateStatus={handleApplicationStatusChange}
      />

      <InquiryDetailModal
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
      />

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${toastMessage.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900'
                : 'bg-rose-50/95 border-rose-300 text-rose-900'
              }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
