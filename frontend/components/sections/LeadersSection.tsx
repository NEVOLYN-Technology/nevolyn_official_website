/**
 * LeadersSection — leadership card grid.
 *
 * Renders a 3-column card grid with scroll-triggered entrance animations, and
 * the full-profile popup handled by `components/ui/LeaderDetails.tsx`.
 *
 * ## Where the data comes from
 * Static content bundled at build time from `lib/data/leaders.ts` (`leaders`).
 *
 * Keep this section synchronous. The roster is static content, so rendering it
 * from the bundle avoids a loading flash on every visit and an empty section
 * whenever the backend is cold starting.
 *
 * ## How to add a team member
 * Edit the relevant data file — do NOT hard-code member data here.
 * The first member of `teamDepartments[0].members` is visually distinguished
 * with an orange accent (instead of blue) to indicate their MD/director role.
 *
 * ## How to add a second department
 * Append a new `Department` to `teamDepartments` in `lib/data/leaders.ts`,
 * then add a second grid block here to render it.
 *
 * @module components/sections/LeadersSection
 */
'use client'

import type { JSX } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { User, ChevronDown } from 'lucide-react'
import { leaders } from '@/lib/data/leaders'
import { LeaderDetails } from '@/components/ui/LeaderDetails'
import { fadeInUpVariants, staggerContainer, defaultViewport } from '@/lib/animations'
import type { TeamMember } from '@/lib/data/leaders'
import { SECTION_BG } from '@/lib/constants/theme'
import { StatusPill } from '@/components/ui/StatusPill'
import { GradText } from '@/components/ui/SectionHeader'

/** High-contrast official LinkedIn SVG logo badge */
const LinkedinIcon = ({ className = 'w-5 h-5' }: { className?: string }): JSX.Element => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="24" height="24" rx="5" fill="#0A66C2" />
    <path d="M19 19H15.8202V13.8407C15.8202 12.5199 15.3408 11.6163 14.1565 11.6163C13.2505 11.6163 12.716 12.2217 12.4795 12.808C12.3929 13.0182 12.3708 13.3108 12.3708 13.6046V19H9.18972C9.18972 19 9.2323 10.3709 9.18972 9.46736H12.3708V10.8202C12.7937 10.1659 13.5517 9.2323 15.2492 9.2323C17.3392 9.2323 18.9189 10.5975 18.9189 13.5414V19H19Z" fill="white" />
    <path d="M5.53906 8.01633C6.65089 8.01633 7.34509 7.28308 7.32454 6.36875C7.30399 5.43317 6.65089 4.7207 5.56116 4.7207C4.47143 4.7207 3.75488 5.43317 3.75488 6.36875C3.75488 7.28308 4.45088 8.01633 5.53906 8.01633ZM3.94824 19H7.12933V9.46736H3.94824V19Z" fill="white" />
  </svg>
)

/**
 * Leadership section displaying team member profile cards.
 *
 * @returns Rendered leaders section element
 */
export function LeadersSection(): JSX.Element {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const selectedIdx = selectedMember ? leaders.indexOf(selectedMember) : -1

  const executiveLeaders = leaders.filter(
    (m) => m.id === 'chagla' || m.id === 'lutfar' || m.title.toLowerCase().includes('director')
  )
  const otherLeaders = leaders.filter((m) => !executiveLeaders.some((e) => e.id === m.id))

  const containerVariants = staggerContainer()
  const itemVariants = fadeInUpVariants

  const renderCard = (member: TeamMember, _idx: number = 0) => {
    const ringBorder = 'border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
    const titleColor = 'text-emerald-700'
    const dividerBg = 'bg-emerald-500'
    const btnStyle = 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 hover:shadow-sm'
    const hoverBorder = 'hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10'

    return (
      <div className={`bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 min-[360px]:p-5 sm:p-7 flex flex-col transition-all duration-300 shadow-sm hover:-translate-y-1 h-full max-w-[390px] mx-auto w-full ${hoverBorder}`}>
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-white ${ringBorder}`}>
            {member.image ? (
              <img
                src={member.image}
                alt={`${member.name} portrait`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User className={`w-12 h-12 sm:w-14 sm:h-14 ${titleColor}`} />
              </div>
            )}
          </div>
        </div>

        {/* Name · Title · CTA */}
        <div className="text-center flex-1 flex flex-col">
          <div>
            <h3 className="text-[13px] min-[360px]:text-[14px] min-[390px]:text-[15.5px] sm:text-lg md:text-xl font-bold text-slate-900 mb-1.5 min-h-[2.25rem] sm:min-h-[3rem] flex items-center justify-center leading-tight whitespace-nowrap tracking-tight">
              {member.name}
            </h3>
            <p className={`text-xs sm:text-sm font-semibold ${titleColor}`}>{member.title}</p>
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 max-w-xs mx-auto leading-relaxed">{member.bio}</p>
          </div>

          <div className="mt-auto">
            <div className={`w-8 h-[2px] mx-auto mt-4 mb-4 rounded-full ${dividerBg}`} />
            <button
              onClick={() => setSelectedMember(member)}
              className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 mb-1 cursor-pointer ${btnStyle}`}
            >
              View Details <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Social footer slot — consistent height across cards to align View Details buttons */}
        <div className={`mt-4 pt-3.5 border-t ${member.social?.linkedin ? 'border-slate-100' : 'border-transparent'} min-h-[3rem] flex items-center justify-center`}>
          {member.social?.linkedin ? (
            <Link
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-slate-700 hover:text-[#0a66c2] bg-transparent transition-colors duration-200 active:scale-95 group cursor-pointer"
              aria-label={`${member.name} LinkedIn`}
            >
              <LinkedinIcon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide group-hover:underline">LinkedIn</span>
            </Link>
          ) : (
            <div className="h-4" aria-hidden="true" />
          )}
        </div>
      </div>
    )
  }

  return (
    <section id="leaders" className={`relative pt-12 pb-16 px-4 md:px-8 overflow-hidden ${SECTION_BG.alternate} ${SECTION_BG.border}`}>
      <div className="max-w-7xl mx-auto">

        {/* ── Section Header ─────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-center mb-10 sm:mb-12"
        >
          {/* Status pill — uses shared StatusPill component */}
          <StatusPill label="EXECUTIVE & RESEARCH LEADERSHIP" />

          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4"
          >
            Vision.{' '}
            <GradText variant="sky">Integrity.</GradText>{' '}
            <GradText variant="emerald">Execution.</GradText>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Meet the leaders and engineers driving NEVOLYN from deep-tech research to high-precision industrial reality.
          </motion.p>
        </motion.div>

        {/* ── Two Rows: 1st for MD & ED, 2nd for Other Leaders ── */}
        <div className="space-y-6 max-w-[840px] mx-auto">
          {/* Row 1: MD & ED */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center"
          >
            {executiveLeaders.map((leader, idx) => (
              <motion.div key={leader.id} variants={itemVariants} className="flex justify-center">
                {renderCard(leader, idx)}
              </motion.div>
            ))}
          </motion.div>

          {/* Row 2: Other Leaders */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center"
          >
            {otherLeaders.map((leader, idx) => (
              <motion.div key={leader.id} variants={itemVariants} className="flex justify-center">
                {renderCard(leader, executiveLeaders.length + idx)}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Member Profile Modal ──────────────────────────────── */}
      <AnimatePresence>
        {selectedMember && (
          <LeaderDetails
            member={selectedMember}
            isFeatured={selectedIdx === 0}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}


