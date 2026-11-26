/**
 * LeadersSection — leadership card stream with continuous auto-glide and manual controls.
 *
 * Renders an infinite, swipeable stream of leadership profiles with continuous auto-scrolling,
 * prominent previous/next controls, momentum swipe, and deep-link profile modal.
 *
 * ## Where the data comes from
 * Static content bundled at build time from `lib/data/leaders.ts` (`leaders`).
 *
 * @module components/sections/LeadersSection
 */
'use client'

import type { JSX } from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { leaders, findMemberBySlug } from '@/lib/data/leaders'
import { LeaderDetails } from '@/components/ui/LeaderDetails'
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

export function LeadersSection(): JSX.Element {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const selectedIdx = selectedMember ? leaders.indexOf(selectedMember) : -1

  // Deep-link URL hash synchronization and background alignment
  useEffect(() => {
    const syncFromHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const match = hash.match(/^#(?:team|leaders|innovators)\/([^/?#]+)/i)
      if (match) {
        const found = findMemberBySlug(match[1])
        if (found) {
          setSelectedMember(found)
          setTimeout(() => {
            const section = document.getElementById('team') || document.getElementById('leaders')
            if (section) {
              const targetTop = section.getBoundingClientRect().top + window.scrollY - 96
              window.scrollTo({ top: Math.max(0, targetTop), behavior: 'instant' })
            }
          }, 20)
          return
        }
      }
      if (
        hash === '#team' ||
        hash === '#leaders' ||
        hash === '#innovators' ||
        (!hash.startsWith('#team/') && !hash.startsWith('#leaders/') && !hash.startsWith('#innovators/'))
      ) {
        setSelectedMember(null)
      }
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  // 4 cycles for smooth infinite wrapping
  const cycles = [0, 1, 2, 3]

  // Continuous auto-glide stream state & refs
  const leadersRef = useRef<HTMLDivElement>(null)
  const posRef = useRef(0)
  const isHoveredRef = useRef(false)
  const isTouchingRef = useRef(false)
  const isUserScrollingRef = useRef(false)
  const scrollEndTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Mouse drag state
  const isMouseDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartScrollRef = useRef(0)
  const hasDraggedRef = useRef(false)

  // Initialize scroll position to cycle 1 once layout is ready
  useEffect(() => {
    const container = leadersRef.current
    if (!container) return

    const initPos = () => {
      if (container.scrollWidth > container.clientWidth) {
        const setWidth = container.scrollWidth / 4
        container.scrollLeft = setWidth
        posRef.current = setWidth
      }
    }

    initPos()
    const timer = setTimeout(initPos, 200)
    return () => clearTimeout(timer)
  }, [])

  // Continuous auto-glide RAF loop
  useEffect(() => {
    let animId: number
    let lastTime = performance.now()
    let isWindowScrolling = false
    let windowScrollTimer: ReturnType<typeof setTimeout> | null = null

    const handleWindowScroll = () => {
      isWindowScrolling = true
      if (windowScrollTimer) clearTimeout(windowScrollTimer)
      windowScrollTimer = setTimeout(() => {
        isWindowScrolling = false
        lastTime = performance.now()
      }, 80)
    }

    window.addEventListener('scroll', handleWindowScroll, { passive: true })

    const getSpeed = () => {
      if (typeof window === 'undefined') return 75
      if (window.innerWidth >= 1024) return 118 // Swift, energetic glide on desktop
      if (window.innerWidth >= 768) return 96   // Lively glide on tablets
      return 75                                // Fast and smooth on mobile
    }

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.032)
      lastTime = currentTime

      const container = leadersRef.current
      if (
        container &&
        !isHoveredRef.current &&
        !isTouchingRef.current &&
        !isUserScrollingRef.current &&
        !isWindowScrolling
      ) {
        const speed = getSpeed()
        posRef.current += speed * delta

        const setWidth = container.scrollWidth / 4
        if (setWidth > 0) {
          if (posRef.current >= setWidth * 2.5) {
            posRef.current -= setWidth
          } else if (posRef.current < setWidth * 0.5) {
            posRef.current += setWidth
          }
        }

        container.scrollLeft = posRef.current
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('scroll', handleWindowScroll)
      if (windowScrollTimer) clearTimeout(windowScrollTimer)
    }
  }, [])

  // Sync position on manual scroll or swipe (momentum, touch, wheel, drag)
  const handleScroll = useCallback(() => {
    const container = leadersRef.current
    if (!container) return

    const diff = Math.abs(container.scrollLeft - posRef.current)

    if (diff > 2 || isTouchingRef.current) {
      posRef.current = container.scrollLeft
      isUserScrollingRef.current = true

      // Seamless infinite wrap during manual swipe
      const setWidth = container.scrollWidth / 4
      if (setWidth > 0) {
        if (container.scrollLeft >= setWidth * 3) {
          container.scrollLeft -= setWidth
          posRef.current = container.scrollLeft
        } else if (container.scrollLeft < setWidth * 0.3) {
          container.scrollLeft += setWidth
          posRef.current = container.scrollLeft
        }
      }

      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
      scrollEndTimerRef.current = setTimeout(() => {
        if (leadersRef.current) {
          posRef.current = leadersRef.current.scrollLeft
        }
        if (!isTouchingRef.current) {
          isUserScrollingRef.current = false
        }
      }, 400)
    }
  }, [])

  // Manual Previous & Next buttons
  const handlePrev = () => {
    const container = leadersRef.current
    if (!container) return
    isUserScrollingRef.current = true

    const setWidth = container.scrollWidth / 4
    if (setWidth > 0 && container.scrollLeft < setWidth * 0.8) {
      container.scrollLeft += setWidth
      posRef.current = container.scrollLeft
    }
    container.scrollBy({ left: -380, behavior: 'smooth' })

    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
    scrollEndTimerRef.current = setTimeout(() => {
      if (leadersRef.current) {
        posRef.current = leadersRef.current.scrollLeft
      }
      isUserScrollingRef.current = false
    }, 1200)
  }

  const handleNext = () => {
    const container = leadersRef.current
    if (!container) return
    isUserScrollingRef.current = true

    const setWidth = container.scrollWidth / 4
    if (setWidth > 0 && container.scrollLeft >= setWidth * 2.5) {
      container.scrollLeft -= setWidth
      posRef.current = container.scrollLeft
    }
    container.scrollBy({ left: 380, behavior: 'smooth' })

    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
    scrollEndTimerRef.current = setTimeout(() => {
      if (leadersRef.current) {
        posRef.current = leadersRef.current.scrollLeft
      }
      isUserScrollingRef.current = false
    }, 1200)
  }

  // Pointer / Mouse Drag handlers for Desktop (mouse only, touch handled via native onTouch*)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    isMouseDraggingRef.current = true
    hasDraggedRef.current = false
    dragStartXRef.current = e.clientX
    if (leadersRef.current) {
      dragStartScrollRef.current = leadersRef.current.scrollLeft
      posRef.current = leadersRef.current.scrollLeft
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !isMouseDraggingRef.current || !leadersRef.current) return
    const diff = e.clientX - dragStartXRef.current
    if (Math.abs(diff) > 4) {
      hasDraggedRef.current = true
    }
    leadersRef.current.scrollLeft = dragStartScrollRef.current - diff
    posRef.current = leadersRef.current.scrollLeft
  }

  const onPointerUp = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e && e.pointerType !== 'mouse') return
    if (!isMouseDraggingRef.current) return
    isMouseDraggingRef.current = false
    isHoveredRef.current = false
    isUserScrollingRef.current = false
    if (leadersRef.current) {
      posRef.current = leadersRef.current.scrollLeft
    }
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
  }

  /** Renders an individual Leader Profile Card */
  const renderCard = (member: TeamMember, uniqueKey: string) => {
    const isDirector = member.id === 'chagla' || member.id === 'lutfar' || member.title.toLowerCase().includes('director')
    const ringBorder = isDirector
      ? 'border-2 border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.3)] ring-4 ring-emerald-500/10'
      : 'border-2 border-sky-400 shadow-[0_0_16px_rgba(14,165,233,0.25)] ring-4 ring-sky-400/10'

    const titleColor = isDirector ? 'text-emerald-700 font-semibold' : 'text-sky-700 font-semibold'
    const dividerBg = isDirector ? 'bg-emerald-500' : 'bg-sky-500'

    return (
      <div
        key={uniqueKey}
        onTouchStart={() => {
          isTouchingRef.current = true
          isUserScrollingRef.current = false
        }}
        onTouchEnd={(e) => {
          if (e.touches.length === 0) {
            isTouchingRef.current = false
            if (leadersRef.current) {
              posRef.current = leadersRef.current.scrollLeft
            }
          }
        }}
        onTouchCancel={(e) => {
          if (e.touches.length === 0) {
            isTouchingRef.current = false
            if (leadersRef.current) {
              posRef.current = leadersRef.current.scrollLeft
            }
          }
        }}
        className="group relative bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] hover:border-emerald-300 hover:-translate-y-1.5 w-[310px] min-[390px]:w-[335px] sm:w-[355px] lg:w-[380px] h-[370px] min-[390px]:h-[380px] sm:h-[435px] lg:h-[455px] shrink-0 select-none cursor-default overflow-hidden"
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
                className="w-full h-full object-cover rounded-full pointer-events-none"
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
        <div className="text-center flex-1 flex flex-col justify-between">
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
            <button
              type="button"
              onClick={(e) => {
                if (hasDraggedRef.current) return
                e.stopPropagation()
                setSelectedMember(member)
              }}
              className="group/btn inline-flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 sm:px-3.5 lg:px-4 lg:py-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 hover:bg-emerald-600 text-emerald-800 hover:text-white text-[10.5px] min-[390px]:text-[11px] lg:text-xs font-bold uppercase tracking-wide lg:tracking-wider transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 mb-0.5 sm:mb-1 cursor-pointer shadow-xs"
            >
              <span>View Profile</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Social footer slot */}
        <div
          className={`mt-2.5 sm:mt-4 pt-2.5 sm:pt-3.5 border-t ${member.social?.linkedin ? 'border-slate-100' : 'border-transparent'
            } min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center shrink-0`}
        >
          {member.social?.linkedin ? (
            <a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (hasDraggedRef.current) {
                  e.preventDefault()
                  return
                }
                e.stopPropagation()
              }}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-[#0a66c2] bg-transparent transition-colors duration-200 active:scale-95 group/link cursor-pointer"
              aria-label={`${member.name} LinkedIn`}
            >
              <LinkedinIcon className="w-4 h-4 shrink-0 group-hover/link:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide group-hover/link:underline">
                LinkedIn
              </span>
            </a>
          ) : (
            <div className="h-4" aria-hidden="true" />
          )}
        </div>
      </div>
    )
  }

  /** Renders the Loop Separator Space */
  const renderLeaderSeparator = (uniqueKey: string) => (
    <div
      key={uniqueKey}
      aria-hidden="true"
      className="w-[310px] min-[390px]:w-[335px] sm:w-[355px] lg:w-[380px] h-[370px] min-[390px]:h-[380px] sm:h-[435px] lg:h-[455px] shrink-0 rounded-2xl border-2 border-dashed border-slate-300/60 bg-slate-100/30 select-none"
    />
  )

  return (
    <section id="leaders" className={`scroll-mt-24 sm:scroll-mt-28 relative pt-16 pb-16 sm:pt-20 px-4 md:px-8 overflow-hidden ${SECTION_BG.alternate} ${SECTION_BG.border}`}>
      {/* Anchor aliases for #team and #innovators deep-linking and smooth scrolling */}
      <div id="team" className="scroll-mt-24 pointer-events-none absolute -top-24" aria-hidden="true" />
      <div id="innovators" className="scroll-mt-24 pointer-events-none absolute -top-24" aria-hidden="true" />

      <div className="max-w-7xl mx-auto">
        {/* ── Section Header ─────────────────────────────────── */}
        <div className="text-center mb-8 sm:mb-10">
          <StatusPill label="EXECUTIVE & RESEARCH LEADERSHIP" className="mb-4" />

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Leadership, Engineers &amp; <GradText variant="emerald">Innovators</GradText>
          </h2>

          <p className="text-base sm:text-lg text-slate-700 font-bold max-w-2xl mx-auto leading-relaxed">
            The minds turning breakthrough research into real-world industrial impact
          </p>
        </div>

        {/* ── Header Controls Row: Arrow Navigation Buttons on Left, View All on Right (Both Ends on Mobile & Web) ── */}
        <div className="flex items-center justify-between w-full mb-5">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous leader"
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-slate-300/90 hover:border-emerald-500 bg-white text-slate-700 hover:bg-emerald-600 hover:text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next leader"
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-slate-300/90 hover:border-emerald-500 bg-white text-slate-700 hover:bg-emerald-600 hover:text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <Link
            href="/team"
            className="group/link inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold text-emerald-800 hover:text-white bg-white hover:bg-emerald-600 border-2 border-emerald-500/80 hover:border-emerald-600 shadow-sm hover:shadow-md hover:shadow-emerald-500/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Explore Full Team</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover/link:translate-x-1" />
          </Link>
        </div>

        {/* ── Continuous Native Scroll Track with Auto-Glide, Touch Swipe & Mouse Drag ── */}
        <div className="relative w-full overflow-hidden py-2">
          {/* Left and Right Edge Blur/Fade Gradients (Desktop only: hidden on smaller screens) */}
          <div className="pointer-events-none absolute left-0 inset-y-0 hidden sm:block w-20 bg-gradient-to-r from-[#eef1f5] to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 inset-y-0 hidden sm:block w-20 bg-gradient-to-l from-[#eef1f5] to-transparent z-20" />

          <div
            ref={leadersRef}
            onScroll={handleScroll}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') {
                isHoveredRef.current = true
              }
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') {
                isHoveredRef.current = false
                onPointerUp()
              }
            }}
            onTouchStart={() => {
              isHoveredRef.current = false
              isTouchingRef.current = true
              isUserScrollingRef.current = false
              if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
            }}
            onTouchMove={() => {
              isTouchingRef.current = true
            }}
            onTouchEnd={(e) => {
              if (e.touches.length === 0) {
                isHoveredRef.current = false
                isTouchingRef.current = false
                isMouseDraggingRef.current = false
                isUserScrollingRef.current = false
                if (leadersRef.current) {
                  posRef.current = leadersRef.current.scrollLeft
                }
                if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
              }
            }}
            onTouchCancel={(e) => {
              if (e.touches.length === 0) {
                isHoveredRef.current = false
                isTouchingRef.current = false
                isMouseDraggingRef.current = false
                isUserScrollingRef.current = false
                if (leadersRef.current) {
                  posRef.current = leadersRef.current.scrollLeft
                }
                if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
              }
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="flex items-stretch gap-6 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none px-4 pt-3 pb-8 scroll-smooth-touch"
          >
            {cycles.map((cIdx) => (
              <div key={`leaders-cycle-${cIdx}`} className="flex items-stretch gap-6 shrink-0">
                {leaders.map((leader, idx) =>
                  renderCard(leader, `leader-${cIdx}-${leader.id}-${idx}`)
                )}
                {/* Empty box type space separator between the last leader and the new start */}
                {renderLeaderSeparator(`leaders-sep-${cIdx}`)}
              </div>
            ))}
          </div>
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

/** Scalable alias for TeamSection */
export const TeamSection = LeadersSection
