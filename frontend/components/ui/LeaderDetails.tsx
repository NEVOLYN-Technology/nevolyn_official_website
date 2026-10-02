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
      {/* Backdrop - dims the page and closes the dialog when clicked. */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm sm:backdrop-blur-md cursor-pointer"
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
        className="fixed inset-0 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-50
                   w-full h-[100dvh] lg:h-auto lg:w-[94%] lg:max-w-3xl lg:max-h-[85vh] flex flex-col
                   bg-white rounded-none lg:rounded-[28px] shadow-2xl
                   border-0 lg:border-2 border-emerald-500/70 lg:ring-4 ring-emerald-500/10
                   overflow-hidden overscroll-contain"
      >
        {/* Top Decorative Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 shrink-0" />

        {/* ── Fixed Header: portrait, name, title, & close button ── */}
        <div className="flex shrink-0 items-center justify-between gap-2.5 sm:gap-4 lg:gap-6 border-b border-slate-100 bg-white p-3 sm:p-5 lg:p-6 lg:px-8 z-10">
          <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-6 min-w-0 flex-1">
            {/* Avatar */}
            <div className={`relative flex h-11 w-11 sm:h-16 sm:w-16 lg:h-20 lg:w-20 shrink-0 items-center justify-center rounded-full bg-white p-0.5 lg:p-1 ring-2 ${accentRing}`}>
              {member.image ? (
                <img
                  src={member.image}
                  alt={`${member.name} portrait`}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <User className="h-5 w-5 sm:h-7 sm:h-7 lg:h-8 lg:w-8 text-emerald-600/80" />
                </div>
              )}
            </div>

            {/* Name & title */}
            <div className="min-w-0 flex-1">
              <h3
                id={headingId}
                className="text-[13px] min-[360px]:text-[14.5px] min-[390px]:text-base sm:text-xl lg:text-2xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap leading-tight"
              >
                {member.name}
              </h3>
              <p className="mt-0.5 lg:mt-1 text-[11px] sm:text-xs lg:text-base font-semibold text-emerald-700 truncate">
                {member.title}
              </p>
            </div>
          </div>

          {/* Top Right Close Button */}
          <div className="flex items-center shrink-0">
            <button
              onClick={handleClose}
              type="button"
              aria-label="Close profile"
              className="p-1.5 sm:p-2 lg:p-2.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 cursor-pointer touch-manipulation active:scale-95"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 stroke-[2.2]" />
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
              className="group w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 active:bg-black active:scale-95 font-bold text-sm transition-all duration-200 cursor-pointer shadow-xs touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
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
