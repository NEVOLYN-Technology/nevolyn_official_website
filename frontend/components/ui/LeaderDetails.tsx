/**
 * LeaderDetails — full-profile popup modal for a single team leader.
 *
 * Rendered via AnimatePresence in LeadersSection when the user clicks
 * "View Details" on a leadership card.
 *
 * @module components/ui/LeaderDetails
 */
'use client'

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
 *
 * @param props - Component props containing member data, featured status, and close handler
 * @returns Rendered modal dialog element
 */
export function LeaderDetails({ member, isFeatured: _isFeatured, onClose }: LeaderDetailsProps): JSX.Element {
  // Integrates browser history so phone back button / edge swipe closes the modal smoothly
  const { handleClose } = useModalHistory({
    isOpen: true,
    onClose,
    modalId: 'leader-details',
  })

  const accentRing = 'ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'

  return (
    <>
      {/* Backdrop Overlay */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm sm:backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal Dialog Panel */}
      <motion.div
        key="panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} — profile`}
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50
                   w-full h-[100dvh] sm:h-auto sm:w-[94%] sm:max-w-4xl sm:max-h-[85vh] flex flex-col
                   bg-white rounded-none sm:rounded-3xl shadow-2xl
                   border-0 sm:border border-slate-200 ring-0 sm:ring-4 ring-emerald-500/10
                   overflow-hidden overscroll-contain"
      >
        {/* Top Decorative Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 shrink-0" />

        {/* ── Fixed Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-6 md:px-8 border-b border-slate-100 bg-white shrink-0 z-10">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Quick Back Button on Mobile */}
            <button
              onClick={handleClose}
              type="button"
              aria-label="Back to team"
              className="inline-flex sm:hidden items-center justify-center p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <div className={`w-12 h-12 sm:w-20 sm:h-20 shrink-0 rounded-full p-0.5 sm:p-1 ring-2 ${accentRing} bg-white transition-all`}>
              {member.image ? (
                <img
                  src={member.image}
                  alt={`${member.name} portrait`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="w-7 h-7 sm:w-10 sm:h-10 text-emerald-600/80" />
                </div>
              )}
            </div>

            {/* Name & title */}
            <div className="min-w-0">
              <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                {member.name}
              </h3>
              <p className="text-xs sm:text-base font-semibold text-emerald-700 truncate mt-0.5">
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
              className="p-2 sm:p-2.5 rounded-full text-slate-400
                         hover:text-slate-900 hover:bg-slate-100
                         transition-all duration-200 cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body Content ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8 text-slate-600 text-sm sm:text-base leading-relaxed overscroll-contain">

          {/* Extended Biography */}
          <div className="space-y-3.5">
            {member.extendedBio ? (
              member.extendedBio.map((para, i) => (
                <p key={i} className="text-slate-700 leading-relaxed text-left">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-slate-700 leading-relaxed">{member.bio}</p>
            )}
          </div>

          {/* Key Responsibilities */}
          {member.responsibilities && member.responsibilities.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
                Key Responsibilities
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                {member.responsibilities.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Links & Profiles */}
          {(member.social || member.email) && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
                Links &amp; Profiles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {member.social?.portfolio && (
                  <Link href={member.social.portfolio} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700">Portfolio:</span> <span className="truncate">{member.social.portfolio.replace(/^https?:\/\//, '')}</span>
                  </Link>
                )}
                {member.social?.github && (
                  <Link href={member.social.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700">GitHub:</span> <span className="truncate">{member.social.github.replace(/^https?:\/\//, '')}</span>
                  </Link>
                )}
                {member.social?.linkedin && (
                  <Link href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700">LinkedIn:</span> <span className="truncate">{member.social.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </Link>
                )}
                {member.social?.scholar && (
                  <Link href={member.social.scholar} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700">Google Scholar:</span> <span className="truncate">{member.social.scholarName}</span>
                  </Link>
                )}
                {member.social?.orcid && (
                  <Link href={member.social.orcid} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700">ORCID:</span> <span>{member.social.orcid.split('/').pop()}</span>
                  </Link>
                )}
                {member.email && (
                  <Link href={`mailto:${member.email}`}
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600 transition-colors">
                    <Mail className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700">Email:</span> <span className="truncate">{member.email}</span>
                  </Link>
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
