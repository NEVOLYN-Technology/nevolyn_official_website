/**
 * LeadersSection — leadership card grid, plus an expandable engineering roster.
 *
 * Renders a 3-column card grid with scroll-triggered entrance animations, and
 * the full-profile popup handled by `components/ui/LeaderDetails.tsx`.
 *
 * ## Where the data comes from
 * Two static files, both bundled at build time — there is no API call here:
 *
 * - **`lib/data/leaders.ts`** → `teamDepartments` — leadership profiles, always
 *   visible.
 * - **`lib/data/team.ts`** → `engineeringTeamMembers` — the engineering roster,
 *   shown in the collapsible "R&D Engineering Team" subsection below. The toggle
 *   button hides itself entirely while that array is empty.
 *
 * Both files share the `TeamMember` interface declared in `leaders.ts`, so an
 * entry can be moved between them unchanged.
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
import { ChevronDown, ChevronUp, User, Users } from 'lucide-react'
import { teamDepartments } from '@/lib/data/leaders'
import { engineeringTeamMembers } from '@/lib/data/team'
import { LeaderDetails } from '@/components/ui/LeaderDetails'
import { fadeInUpVariants, staggerContainer, defaultViewport } from '@/lib/animations'
import type { TeamMember } from '@/lib/data/leaders'

/** High-contrast official LinkedIn SVG logo badge */
const LinkedinIcon = ({ className = 'w-5 h-5' }: { className?: string }): JSX.Element => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="24" height="24" rx="5" fill="#0A66C2" />
    <path d="M19 19H15.8202V13.8407C15.8202 12.5199 15.3408 11.6163 14.1565 11.6163C13.2505 11.6163 12.716 12.2217 12.4795 12.808C12.3929 13.0182 12.3708 13.3108 12.3708 13.6046V19H9.18972C9.18972 19 9.2323 10.3709 9.18972 9.46736H12.3708V10.8202C12.7937 10.1659 13.5517 9.2323 15.2492 9.2323C17.3392 9.2323 18.9189 10.5975 18.9189 13.5414V19H19Z" fill="white" />
    <path d="M5.53906 8.01633C6.65089 8.01633 7.34509 7.28308 7.32454 6.36875C7.30399 5.43317 6.65089 4.7207 5.56116 4.7207C4.47143 4.7207 3.75488 5.43317 3.75488 6.36875C3.75488 7.28308 4.45088 8.01633 5.53906 8.01633ZM3.94824 19H7.12933V9.46736H3.94824V19Z" fill="white" />
  </svg>
)

/**
 * Leadership section displaying team member profile cards and expandable team member grid.
 *
 * @returns Rendered leaders section element
 */
export function LeadersSection(): JSX.Element {
  const department = teamDepartments[0]
  const leaders = department.members

  const [showTeam, setShowTeam] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const allMembers = [...leaders, ...engineeringTeamMembers]
  const selectedIdx = selectedMember ? allMembers.indexOf(selectedMember) : -1

  const containerVariants = staggerContainer()
  const itemVariants = fadeInUpVariants

  const renderCard = (member: TeamMember, _idx: number = 0) => {
    const ringBorder = 'border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
    const titleColor = 'text-emerald-700'
    const dividerBg = 'bg-emerald-500'
    const btnStyle = 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 hover:shadow-sm'
    const hoverBorder = 'hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10'

    return (
      <div className={`bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-[2rem] p-8 flex flex-col transition-all duration-300 shadow-sm hover:-translate-y-1 h-full ${hoverBorder}`}>
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className={`w-40 h-40 rounded-full p-1 bg-white ${ringBorder}`}>
            {member.image ? (
              <img
                src={member.image}
                alt={`${member.name} portrait`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User className={`w-20 h-20 ${titleColor}`} />
              </div>
            )}
          </div>
        </div>

        {/* Name · Title · CTA */}
        <div className="text-center flex-1 flex flex-col">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 min-h-[3.5rem] flex items-center justify-center leading-tight">
              {member.name}
            </h3>
            <p className={`text-sm font-semibold ${titleColor}`}>{member.title}</p>
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 max-w-xs mx-auto">{member.bio}</p>
          </div>

          <div className="mt-auto">
            <div className={`w-8 h-[2px] mx-auto mt-5 mb-6 rounded-full ${dividerBg}`} />
            <button
              onClick={() => setSelectedMember(member)}
              className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 mb-2 cursor-pointer ${btnStyle}`}
            >
              View Details <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Social footer */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center">
            <Link
              href={member.social?.linkedin || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-transparent bg-transparent text-slate-800 hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105 active:scale-95 group cursor-pointer"
              aria-label={`${member.name} LinkedIn`}
            >
              <LinkedinIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold tracking-wide">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section id="leaders" className="relative pt-12 pb-16 px-4 md:px-8 overflow-hidden bg-[#deebf9] border-t border-sky-300/60">
      <div className="max-w-7xl mx-auto">

        {/* ── Section Header ─────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm mb-4 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="tracking-wide uppercase">EXECUTIVE &amp; RESEARCH LEADERSHIP</span>
          </div>

          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4"
          >
            Vision.{' '}
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              Integrity.
            </span>{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Execution.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Meet the leaders and engineering specialists driving NEVOLYN Technology from deep-tech research to high-precision industrial reality.
          </motion.p>
        </motion.div>

        {/* ── 3 Core Leaders Grid ─────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {leaders.map((leader, idx) => (
            <motion.div key={leader.id} variants={itemVariants}>
              {renderCard(leader, idx)}
            </motion.div>
          ))}
        </motion.div>

        {/* ── Toggle Button for R&D Engineering Team ───────────────── */}
        {engineeringTeamMembers.length > 0 && (
          <div className="flex justify-center pt-10">
            <button
              onClick={() => setShowTeam(!showTeam)}
              className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-sky-300 bg-gradient-to-r from-sky-50 to-blue-50/70 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-sky-700 hover:text-white hover:border-transparent text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-sky-400/30 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{showTeam ? 'Hide Team Members' : 'Show Team Members'}</span>
              {showTeam ? (
                <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              )}
            </button>
          </div>
        )}

        {/* ── Expandable R&D Engineering Team Grid ───────────────── */}
        <AnimatePresence>
          {showTeam && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden pt-10"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
                  R&D Engineering Team
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Engineering specialists driving computer vision, machine learning models, and edge hardware systems
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {engineeringTeamMembers.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    {renderCard(member, idx)}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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


