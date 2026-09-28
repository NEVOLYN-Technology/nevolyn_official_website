/**
 * LeaderDetails — full-profile popup modal for a single team leader.
 *
 * Rendered via AnimatePresence in LeadersSection when the user clicks
 * "View Details" on a leadership card.
 *
 * @module components/ui/LeaderDetails
 */
'use client'

import { useId, useRef } from 'react'
import type { JSX } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { X, Mail, ExternalLink, User, ArrowLeft } from 'lucide-react'
import type { TeamMember } from '@/lib/data/leaders'
import { useModalHistory } from '@/lib/hooks/useModalHistory'

interface LeaderDetailsProps {
  member: TeamMember
  isFeatured: boolean
  onClose: () => void
}

/**
 * Full profile modal dialog displaying member biography, key responsibilities, and external profiles.
 * Includes mobile-first back navigation (physical back button, swipe back, and prominent on-screen buttons).
 */
export function LeaderDetails({ member, isFeatured: _isFeatured, onClose }: LeaderDetailsProps): JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null)
  const headingId = useId()

  // Integrates browser history so phone back button / edge swipe closes the modal smoothly
  const { handleClose } = useModalHistory({
    isOpen: true,
    onClose,
    modalId: 'leader-details',
  })

  const accentRing = 'ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
  const bioParagraphs: string[] = member.extendedBio ?? [member.bio]

  return (
    <>
      {/* Backdrop Overlay — dims the page and closes on tap */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm sm:backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Dialog panel — mobile-first full sheet or centered desktop dialog */}
      <motion.div
        key="panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50
                   w-full h-[100dvh] sm:h-auto sm:w-[94%] sm:max-w-3xl sm:max-h-[85vh] flex flex-col
                   bg-white rounded-none sm:rounded-[28px] shadow-2xl
                   border-0 sm:border-2 border-emerald-500/70 sm:ring-4 ring-emerald-500/10
                   overflow-hidden overscroll-contain"
      >
        {/* Top Decorative Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 shrink-0" />

        {/* ── Fixed Header: portrait, name, title, Back & close buttons ── */}
        <div className="flex shrink-0 items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 bg-white p-3.5 sm:p-6 md:px-8 z-10">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Quick Back Button on Mobile */}
            <button
              onClick={handleClose}
              type="button"
              aria-label="Back to leadership team"
              className="inline-flex sm:hidden items-center justify-center p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <div className={`relative flex h-12 w-12 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-white p-0.5 sm:p-1 ring-2 ${accentRing}`}>
              {member.image ? (
                <img
                  src={member.image}
                  alt={`${member.name} portrait`}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600/80" />
                </div>
              )}
            </div>

            {/* Name & title */}
            <div className="min-w-0">
              <h3
                id={headingId}
                className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 truncate leading-tight"
              >
                {member.name}
              </h3>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-base font-semibold text-emerald-700 truncate">
                {member.title}
              </p>
            </div>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClose}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleClose}
              type="button"
              aria-label="Close profile"
              className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body Content: biography, responsibilities, links ── */}
        <div
          className="flex-1 space-y-6 sm:space-y-7 overflow-y-auto no-scrollbar p-5 sm:p-8 text-sm leading-relaxed text-slate-600 sm:text-base overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Extended Biography */}
          <div className="space-y-4">
            {bioParagraphs.map((paragraph: string, index: number) => (
              <p key={index} className="leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Key Responsibilities */}
          {member.responsibilities && member.responsibilities.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-6">
              <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-900">
                Key Responsibilities
              </h4>
              <ul className="list-disc space-y-1.5 pl-5 text-slate-700">
                {member.responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Links & Profiles */}
          {(member.social || member.email) && (
            <div>
              <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-900">
                Links &amp; Profiles
              </h4>
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {member.social?.portfolio && (
                  <ProfileLink
                    href={member.social.portfolio}
                    label="Portfolio"
                    value={stripProtocol(member.social.portfolio)}
                  />
                )}
                {member.social?.github && (
                  <ProfileLink
                    href={member.social.github}
                    label="GitHub"
                    value={stripProtocol(member.social.github)}
                  />
                )}
                {member.social?.linkedin && (
                  <ProfileLink
                    href={member.social.linkedin}
                    label="LinkedIn"
                    value={stripProtocol(member.social.linkedin)}
                  />
                )}
                {member.social?.scholar && (
                  <ProfileLink
                    href={member.social.scholar}
                    label="Google Scholar"
                    value={member.social.scholarName || 'Google Scholar'}
                  />
                )}
                {member.social?.orcid && (
                  <ProfileLink
                    href={member.social.orcid}
                    label="ORCID"
                    value={member.social.orcid.split('/').pop() ?? member.social.orcid}
                  />
                )}
                {member.email && (
                  <ProfileLink
                    href={`mailto:${member.email}`}
                    label="Email"
                    value={member.email}
                    icon="mail"
                  />
                )}
              </div>
            </div>
          )}

          {/* Bottom Dismiss / Back Button */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleClose}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Leadership Team</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

/** Strips `https://` and a leading `www.` so long URLs read cleanly. */
function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '')
}

/**
 * One "Label: value" row in the links grid matching Fabins design.
 */
function ProfileLink({
  href,
  label,
  value,
  icon = 'external',
}: {
  href: string
  label: string
  value: string
  icon?: 'external' | 'mail'
}) {
  const Icon = icon === 'mail' ? Mail : ExternalLink
  const isExternal = href.startsWith('http')

  return (
    <Link
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex items-center gap-2 text-sm transition-colors hover:opacity-85 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-200"
    >
      <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
      <span className="font-bold text-slate-800">{label}:</span>
      <span className="text-emerald-700 truncate hover:underline">{value}</span>
    </Link>
  )
}
