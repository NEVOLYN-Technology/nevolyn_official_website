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
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { X, Mail, ExternalLink, User } from 'lucide-react'
import type { TeamMember } from '@/lib/data/leaders'

interface LeaderDetailsProps {
  member: TeamMember
  isFeatured: boolean
  onClose: () => void
}

/**
 * Full profile modal dialog displaying member biography, key responsibilities, and external profiles.
 *
 * @param props - Component props containing member data, featured status, and close handler
 * @returns Rendered modal dialog element
 */
export function LeaderDetails({ member, isFeatured, onClose }: LeaderDetailsProps): JSX.Element {
  // Lock background scroll while modal is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const accentRing = isFeatured
    ? 'ring-orange-500/80 shadow-[0_0_20px_rgba(249,115,22,0.35)]'
    : 'ring-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.35)]'

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        key="panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} — profile`}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                   w-[94%] max-w-4xl max-h-[85vh] flex flex-col
                   bg-white dark:bg-gradient-to-b dark:from-[#0f1d35] dark:via-[#0a1425] dark:to-[#060c17]
                   rounded-3xl shadow-[0_0_50px_rgba(249,115,22,0.35)]
                   border-2 border-orange-500/60 ring-4 ring-orange-500/20
                   overflow-hidden"
      >
        {/* Top Decorative Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 shrink-0" />

        {/* ── Fixed Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 p-5 sm:p-6 md:px-8 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0f1d35]/95 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full p-1 ring-2 ${accentRing} bg-white dark:bg-[#0b172a] transition-all`}>
              {member.image ? (
                <img
                  src={member.image}
                  alt={`${member.name} portrait`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-10 h-10 text-orange-500/80" />
                </div>
              )}
            </div>

            {/* Name & title */}
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {member.name}
              </h3>
              <p className="text-sm sm:text-base font-semibold text-blue-500 dark:text-blue-400 mt-0.5">
                {member.title}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="shrink-0 p-2.5 rounded-full text-slate-400
                       hover:text-slate-900 dark:hover:text-white
                       hover:bg-slate-100 dark:hover:bg-slate-800/80
                       transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ── Scrollable Body Content ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 md:p-10 space-y-8 text-slate-600 dark:text-slate-300 text-base leading-relaxed">

          {/* Extended Biography */}
          <div className="space-y-4">
            {member.extendedBio ? (
              member.extendedBio.map((para, i) => (
                <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed text-justify sm:text-left">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{member.bio}</p>
            )}
          </div>

          {/* Key Responsibilities */}
          {member.responsibilities && member.responsibilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3">
                Key Responsibilities
              </h4>
              <ul className="list-disc pl-5 space-y-1.5">
                {member.responsibilities.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Links & Profiles */}
          {(member.social || member.email) && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3">
                Links &amp; Profiles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {member.social?.portfolio && (
                  <Link href={member.social.portfolio} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700 dark:text-slate-200">Portfolio:</span> {member.social.portfolio.replace(/^https?:\/\//, '')}
                  </Link>
                )}
                {member.social?.github && (
                  <Link href={member.social.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700 dark:text-slate-200">GitHub:</span> {member.social.github.replace(/^https?:\/\//, '')}
                  </Link>
                )}
                {member.social?.linkedin && (
                  <Link href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700 dark:text-slate-200">LinkedIn:</span> {member.social.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                  </Link>
                )}
                {member.social?.scholar && (
                  <Link href={member.social.scholar} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700 dark:text-slate-200">Google Scholar:</span> {member.social.scholarName}
                  </Link>
                )}
                {member.social?.orcid && (
                  <Link href={member.social.orcid} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700 dark:text-slate-200">ORCID:</span> {member.social.orcid.split('/').pop()}
                  </Link>
                )}
                {member.email && (
                  <Link href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors">
                    <Mail className="w-4 h-4 shrink-0" /> <span className="font-semibold text-slate-700 dark:text-slate-200">Email:</span> {member.email}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
