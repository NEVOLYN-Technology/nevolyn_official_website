'use client'

import type { JSX } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { User, ChevronDown, ArrowLeft, Search, X } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { BrandWordmark } from '@/components/ui/BrandWordmark'
import {
  allTeamMembers,
  directorMembers,
  nonDirectorMembers,
  findAnyMemberBySlug,
  type TeamMember,
} from '@/lib/data/team'
import { LeaderDetails } from '@/components/ui/LeaderDetails'
import { fadeInUpVariants, staggerContainer, defaultViewport } from '@/lib/animations'
import { GradText } from '@/components/ui/SectionHeader'

/** High-contrast official LinkedIn SVG logo badge */
const LinkedinIcon = ({ className = 'w-4 h-4' }: { className?: string }): JSX.Element => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="24" height="24" rx="5" fill="#0A66C2" />
    <path d="M19 19H15.8202V13.8407C15.8202 12.5199 15.3408 11.6163 14.1565 11.6163C13.2505 11.6163 12.716 12.2217 12.4795 12.808C12.3929 13.0182 12.3708 13.3108 12.3708 13.6046V19H9.18972C9.18972 19 9.2323 10.3709 9.18972 9.46736H12.3708V10.8202C12.7937 10.1659 13.5517 9.2323 15.2492 9.2323C17.3392 9.2323 18.9189 10.5975 18.9189 13.5414V19H19Z" fill="white" />
    <path d="M5.53906 8.01633C6.65089 8.01633 7.34509 7.28308 7.32454 6.36875C7.30399 5.43317 6.65089 4.7207 5.56116 4.7207C4.47143 4.7207 3.75488 5.43317 3.75488 6.36875C3.75488 7.28308 4.45088 8.01633 5.53906 8.01633ZM3.94824 19H7.12933V9.46736H3.94824V19Z" fill="white" />
  </svg>
)

export default function TeamPage(): JSX.Element {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedIdx = selectedMember ? allTeamMembers.indexOf(selectedMember) : -1

  // Deep-link URL hash synchronization
  useEffect(() => {
    const syncFromHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const match = hash.match(/^#(?:team|leaders|innovators|employees)\/([^/?#]+)/i)
      if (match) {
        const found = findAnyMemberBySlug(match[1])
        if (found) {
          setSelectedMember(found)
          return
        }
      }
      if (
        hash === '#team' ||
        hash === '#leaders' ||
        (!hash.startsWith('#team/') && !hash.startsWith('#leaders/') && !hash.startsWith('#employees/'))
      ) {
        setSelectedMember(null)
      }
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  // Filtered members when user types in search bar
  const isSearching = searchQuery.trim().length > 0

  const filteredMembers = useMemo(() => {
    if (!isSearching) return allTeamMembers

    const q = searchQuery.toLowerCase().trim()
    return allTeamMembers.filter((m) => {
      return (
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        m.responsibilities.some((r) => r.toLowerCase().includes(q))
      )
    })
  }, [searchQuery, isSearching])

  const containerVariants = staggerContainer()
  const itemVariants = fadeInUpVariants

  const renderMemberCard = (member: TeamMember) => {
    const isDirector = directorMembers.some((d) => d.id === member.id)
    const ringBorder = isDirector
      ? 'border-2 border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.3)] ring-4 ring-emerald-500/10'
      : 'border-2 border-sky-400 shadow-[0_0_16px_rgba(14,165,233,0.25)] ring-4 ring-sky-400/10'

    const titleColor = isDirector ? 'text-emerald-700 font-semibold' : 'text-sky-700 font-semibold'
    const dividerBg = isDirector ? 'bg-emerald-500' : 'bg-sky-500'

    return (
      <div
        className="group relative bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] hover:border-emerald-300 hover:-translate-y-1.5 h-full min-h-[370px] min-[390px]:min-h-[380px] sm:min-h-[465px] w-full min-w-0 max-w-[310px] min-[390px]:max-w-[340px] sm:max-w-[380px] overflow-hidden"
      >
        {/* Subtle Top Gradient Accent */}
        <div className={`absolute inset-x-6 top-0 h-[2px] rounded-full transition-all duration-300 ${isDirector ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-transparent' : 'bg-gradient-to-r from-sky-400 via-emerald-300 to-transparent'} group-hover:inset-x-2`} />

        {/* Avatar */}
        <div className="flex justify-center mb-2 sm:mb-4 mt-0.5 sm:mt-1 shrink-0">
          <div className={`w-20 h-20 min-[390px]:w-22 min-[390px]:h-22 sm:w-28 sm:h-28 rounded-full p-1 bg-white transition-transform duration-300 group-hover:scale-105 ${ringBorder}`}>
            {member.image ? (
              <img
                src={member.image}
                alt={`${member.name} portrait`}
                className="w-full h-full object-cover rounded-full"
                style={{ objectPosition: member.imagePosition ?? 'center' }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-600" />
              </div>
            )}
          </div>
        </div>

        {/* Name · Title · Bio */}
        <div className="text-center flex-1 flex flex-col">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1 leading-tight tracking-tight min-h-[2.25rem] sm:min-h-[2.75rem] flex items-center justify-center">
              {member.name}
            </h3>
            <p className={`text-xs sm:text-[13px] ${titleColor}`}>{member.title}</p>
            <p className="text-xs text-slate-600 mt-1.5 sm:mt-2 line-clamp-2 max-w-xs mx-auto leading-relaxed">
              {member.bio}
            </p>
          </div>

          <div className="mt-auto">
            <div className={`w-7 lg:w-8 h-[2px] mx-auto mt-2.5 mb-2.5 lg:mt-3.5 lg:mb-3.5 rounded-full ${dividerBg}`} />
            <a
              href={`#team/${member.slug || member.id}`}
              onClick={(e) => {
                e.preventDefault()
                setSelectedMember(member)
              }}
              className="group/btn inline-flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 sm:px-3.5 lg:px-4 lg:py-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 hover:bg-emerald-600 text-emerald-800 hover:text-white text-[10.5px] min-[390px]:text-[11px] lg:text-xs font-bold uppercase tracking-wide lg:tracking-wider transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 mb-0.5 sm:mb-1 cursor-pointer"
            >
              <span>View Profile</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Social footer slot */}
        <div
          className={`mt-2.5 sm:mt-4 pt-2.5 sm:pt-3.5 border-t ${member.social?.linkedin ? 'border-slate-100' : 'border-transparent'
            } min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center`}
        >
          {member.social?.linkedin ? (
            <Link
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-slate-700 hover:text-[#0a66c2] bg-transparent transition-colors duration-200 active:scale-95 group/link cursor-pointer"
              aria-label={`${member.name} LinkedIn`}
            >
              <LinkedinIcon className="w-4 h-4 shrink-0 group-hover/link:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide group-hover/link:underline">
                LinkedIn
              </span>
            </Link>
          ) : (
            <div className="h-4" aria-hidden="true" />
          )}
        </div>
      </div>
    )
  }

  return (
    <PageShell hideNavbar>
      <div className="relative pt-4 sm:pt-6 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-x-clip w-full min-w-0">
        {/* ── Ambient High-Tech Atmospheric Glows ───────────────────── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
          <div
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1100px] h-[550px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(14,165,233,0.18) 0%, rgba(16,185,129,0.14) 38%, rgba(99,102,241,0.05) 65%, transparent 75%)',
            }}
          />
        </div>

        {/* Background Dot Matrix Texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        />

        {/* ── Signature Floating Header Bar ── */}
        <div className="sticky top-3 sm:top-4 z-40 mb-8 sm:mb-10">
          <div className="flex items-center justify-between gap-2 sm:gap-6 max-w-7xl mx-auto rounded-full border border-sky-200/80 bg-white/95 px-3 py-1.5 sm:px-6 sm:py-2.5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 hover:border-emerald-400/80 hover:shadow-[0_12px_40px_rgba(16,185,129,0.16)]">
            {/* Left: Quick Back Navigation & Brand Wordmark */}
            <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
              <Link
                href="/#leaders"
                className="group inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/90 hover:border-emerald-300 text-xs sm:text-[13px] font-bold shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
                aria-label="Back to Homepage"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span className="hidden min-[380px]:inline">Back</span>
              </Link>

              <div className="h-4 w-px bg-slate-200 shrink-0" />

              <Link
                href="/"
                className="group flex items-center shrink-0 rounded-full py-0.5 transition-all duration-200 hover:-translate-y-0.5"
                aria-label="Back to NEVOLYN Home"
              >
                <BrandWordmark size="sm" />
              </Link>
            </div>

            {/* Right: Prominent Top-Bar Search Console */}
            <div className="w-full min-w-0 max-w-[150px] min-[390px]:max-w-[200px] min-[420px]:max-w-[260px] sm:max-w-md md:max-w-lg lg:max-w-xl ml-auto">
              <div className="group/search relative flex items-center rounded-full bg-white border-2 border-emerald-500/70 hover:border-emerald-500 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/20 px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 shadow-[0_2px_12px_rgba(16,185,129,0.12)]">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0 mr-1 sm:mr-1.5 transition-transform duration-200 group-hover/search:scale-110" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full min-w-0 bg-transparent text-xs sm:text-[13px] font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal placeholder:text-xs outline-none"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                    {allTeamMembers.length} Members
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div className="text-center mb-10 sm:mb-12">
          {/* Glowing Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-emerald-200/90 shadow-[0_2px_12px_rgba(16,185,129,0.12)] text-emerald-800 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>NEVOLYN · PEOPLE &amp; TALENT</span>
          </div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3"
          >
            Leadership, Engineers &amp; <GradText variant="emerald">Innovators</GradText>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-sm sm:text-base md:text-lg text-slate-700 font-bold max-w-2xl mx-auto leading-relaxed"
          >
            The minds turning breakthrough research into real-world industrial impact
          </motion.p>

          {/* Real-time search status indicator */}
          {isSearching && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs sm:text-sm text-slate-500 text-center mt-5"
            >
              Found <span className="font-bold text-emerald-700">{filteredMembers.length}</span>{' '}
              {filteredMembers.length === 1 ? 'member' : 'members'} matching &ldquo;
              <span className="font-semibold text-slate-800">{searchQuery}</span>&rdquo;
            </motion.p>
          )}
        </div>

        {/* ── Search Results View ─────────────────────────────────── */}
        {isSearching ? (
          filteredMembers.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap justify-center gap-y-6 sm:gap-8 max-w-7xl mx-auto w-full min-w-0"
            >
              {filteredMembers.map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="w-full min-w-0 sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] max-w-[310px] min-[390px]:max-w-[340px] sm:max-w-[380px] flex justify-center"
                >
                  {renderMemberCard(member)}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/60 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No team members found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed">
                We couldn&apos;t find anyone matching your search query.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )
        ) : (
          /* ── Default Complete Directory View ─────────────────────── */
          <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
            {/* 1. First Line: Two Directors (Aligned Justified) */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-8 max-w-[820px] mx-auto justify-center w-full min-w-0"
            >
              {directorMembers.map((director) => (
                <motion.div
                  key={director.id}
                  variants={itemVariants}
                  className="flex justify-center w-full min-w-0"
                >
                  {renderMemberCard(director)}
                </motion.div>
              ))}
            </motion.div>

            {/* 2. Second Line & Onwards: 3 people per line (2 iPad, 1 phone):
                 - If 1 entry remains in the row -> centered in the middle automatically.
                 - If 2 entries remain in the row -> aligned justified side-by-side in the center.
            */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="flex flex-wrap justify-center gap-y-6 sm:gap-8 max-w-7xl mx-auto w-full min-w-0"
            >
              {nonDirectorMembers.map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="w-full min-w-0 sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] max-w-[310px] min-[390px]:max-w-[340px] sm:max-w-[380px] flex justify-center"
                >
                  {renderMemberCard(member)}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Member Profile Modal */}
      <AnimatePresence>
        {selectedMember && (
          <LeaderDetails
            member={selectedMember}
            isFeatured={selectedIdx === 0}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </PageShell>
  )
}
