/**
 * LatestNewsSection — Continuous auto-scrolling streams with seamless manual swipe & drag.
 *
 * Features prominent navigation buttons and a dedicated loop separator box between the
 * last and first card of each cycle for clear serial continuity.
 *
 * @module components/sections/LatestNewsSection
 */
'use client'

import type { JSX } from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Calendar,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { featuredMilestones } from '@/lib/data/featured-milestones'
import { fadeUpProps } from '@/lib/animations'
import { formatDate, cn } from '@/lib/utils'
import { SectionHeader, GradText } from '@/components/ui/SectionHeader'
import { SECTION_BG } from '@/lib/constants/theme'
import { NewsDetailModal, type NewsModalItem } from '@/components/ui/NewsDetailModal'
import { ImageLightboxModal } from '@/components/ui/ImageLightboxModal'

/**
 * News timeline section rendering featured institutional breakthroughs and
 * recent announcements in continuous, swipeable, auto-scrolling streams.
 *
 * @returns Rendered news section component
 */
export const LatestNewsSection = (): JSX.Element => {
  // Active selected item for the "View Details" pop-up modal
  const [selectedNews, setSelectedNews] = useState<NewsModalItem | null>(null)

  // Active selected photo gallery for the zero-lag fullscreen lightbox
  const [selectedPhoto, setSelectedPhoto] = useState<{
    title: string
    images: string[]
    initialIndex?: number
  } | null>(null)

  // Sort complete objects strictly by date descending: Newest -> Top/First, Oldest -> Bottom/Last
  const sortedFeatured = [...featuredMilestones].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // 4 cycles array for infinite loop math
  const cycles = [0, 1, 2, 3]

  // =========================================================================
  // 1. FEATURED NEWS: AUTO-SCROLL + SWIPE RESUME EXACT POSITION
  // =========================================================================
  const featuredRef = useRef<HTMLDivElement>(null)
  const featuredPosRef = useRef(0)
  const isFeaturedHoveredRef = useRef(false)
  const isFeaturedTouchingRef = useRef(false)
  const isFeaturedUserScrollingRef = useRef(false)
  const featuredScrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mouse drag state for Featured News
  const isFeaturedMouseDraggingRef = useRef(false)
  const featuredDragStartXRef = useRef(0)
  const featuredDragStartScrollRef = useRef(0)
  const featuredHasDraggedRef = useRef(false)

  // Initialize Featured News scroll position to Set 1 once layout is ready
  useEffect(() => {
    const container = featuredRef.current
    if (!container) return

    const initPos = () => {
      if (container.scrollWidth > container.clientWidth) {
        const setWidth = container.scrollWidth / 4
        container.scrollLeft = setWidth
        featuredPosRef.current = setWidth
      }
    }

    initPos()
    const timer = setTimeout(initPos, 200)
    return () => clearTimeout(timer)
  }, [sortedFeatured])

  // Continuous auto-glide RAF loop for Featured News
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

      const container = featuredRef.current
      if (
        container &&
        !isFeaturedHoveredRef.current &&
        !isFeaturedTouchingRef.current &&
        !isFeaturedUserScrollingRef.current &&
        !isWindowScrolling
      ) {
        const speed = getSpeed()
        featuredPosRef.current += speed * delta

        const setWidth = container.scrollWidth / 4
        if (setWidth > 0) {
          if (featuredPosRef.current >= setWidth * 2.5) {
            featuredPosRef.current -= setWidth
          } else if (featuredPosRef.current < setWidth * 0.5) {
            featuredPosRef.current += setWidth
          }
        }

        container.scrollLeft = featuredPosRef.current
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
  const handleFeaturedScroll = useCallback(() => {
    const container = featuredRef.current
    if (!container) return

    const diff = Math.abs(container.scrollLeft - featuredPosRef.current)

    if (diff > 2 || isFeaturedTouchingRef.current) {
      featuredPosRef.current = container.scrollLeft
      isFeaturedUserScrollingRef.current = true

      // Seamless infinite wrap during manual swipe
      const setWidth = container.scrollWidth / 4
      if (setWidth > 0) {
        if (container.scrollLeft >= setWidth * 3) {
          container.scrollLeft -= setWidth
          featuredPosRef.current = container.scrollLeft
        } else if (container.scrollLeft < setWidth * 0.3) {
          container.scrollLeft += setWidth
          featuredPosRef.current = container.scrollLeft
        }
      }

      if (featuredScrollEndTimerRef.current) clearTimeout(featuredScrollEndTimerRef.current)
      featuredScrollEndTimerRef.current = setTimeout(() => {
        if (featuredRef.current) {
          featuredPosRef.current = featuredRef.current.scrollLeft
        }
        if (!isFeaturedTouchingRef.current) {
          isFeaturedUserScrollingRef.current = false
        }
      }, 400)
    }
  }, [])

  // Manual Previous & Next buttons for Featured News
  const handleFeaturedPrev = () => {
    const container = featuredRef.current
    if (!container) return
    isFeaturedUserScrollingRef.current = true

    const setWidth = container.scrollWidth / 4
    if (setWidth > 0 && container.scrollLeft < setWidth * 0.8) {
      container.scrollLeft += setWidth
      featuredPosRef.current = container.scrollLeft
    }
    container.scrollBy({ left: -380, behavior: 'smooth' })

    if (featuredScrollEndTimerRef.current) clearTimeout(featuredScrollEndTimerRef.current)
    featuredScrollEndTimerRef.current = setTimeout(() => {
      if (featuredRef.current) {
        featuredPosRef.current = featuredRef.current.scrollLeft
      }
      isFeaturedUserScrollingRef.current = false
    }, 1200)
  }

  const handleFeaturedNext = () => {
    const container = featuredRef.current
    if (!container) return
    isFeaturedUserScrollingRef.current = true

    const setWidth = container.scrollWidth / 4
    if (setWidth > 0 && container.scrollLeft >= setWidth * 2.5) {
      container.scrollLeft -= setWidth
      featuredPosRef.current = container.scrollLeft
    }
    container.scrollBy({ left: 380, behavior: 'smooth' })

    if (featuredScrollEndTimerRef.current) clearTimeout(featuredScrollEndTimerRef.current)
    featuredScrollEndTimerRef.current = setTimeout(() => {
      if (featuredRef.current) {
        featuredPosRef.current = featuredRef.current.scrollLeft
      }
      isFeaturedUserScrollingRef.current = false
    }, 1200)
  }

  // Pointer / Mouse Drag handlers for Desktop (mouse only, touch handled via native onTouch*)
  const onFeaturedPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    isFeaturedMouseDraggingRef.current = true
    featuredHasDraggedRef.current = false
    featuredDragStartXRef.current = e.clientX
    if (featuredRef.current) {
      featuredDragStartScrollRef.current = featuredRef.current.scrollLeft
      featuredPosRef.current = featuredRef.current.scrollLeft
    }
  }

  const onFeaturedPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !isFeaturedMouseDraggingRef.current || !featuredRef.current) return
    const diff = e.clientX - featuredDragStartXRef.current
    if (Math.abs(diff) > 4) {
      featuredHasDraggedRef.current = true
    }
    featuredRef.current.scrollLeft = featuredDragStartScrollRef.current - diff
    featuredPosRef.current = featuredRef.current.scrollLeft
  }

  const onFeaturedPointerUp = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e && e.pointerType !== 'mouse') return
    isFeaturedMouseDraggingRef.current = false
    isFeaturedHoveredRef.current = false
    if (featuredRef.current) {
      featuredPosRef.current = featuredRef.current.scrollLeft
    }
  }

  /** Renders an individual Featured News card */
  const renderFeaturedCard = (item: typeof sortedFeatured[0], uniqueKey: string) => {
    const cat = item.category.toLowerCase()
    const isGreen = cat.includes('partner') || cat.includes('award') || cat.includes('prize')
    const isRed = cat.includes('poc') || cat.includes('demonstration')
    const colorClasses = isGreen
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 fill-emerald-600'
      : isRed
        ? 'bg-rose-50 text-rose-700 border-rose-200 fill-rose-600'
        : 'bg-sky-50 text-sky-700 border-sky-200 fill-sky-600'

    return (
      <div
        key={uniqueKey}
        onTouchStart={() => {
          isFeaturedTouchingRef.current = true
          isFeaturedUserScrollingRef.current = false
        }}
        onTouchEnd={(e) => {
          if (e.touches.length === 0) {
            isFeaturedTouchingRef.current = false
            if (featuredRef.current) {
              featuredPosRef.current = featuredRef.current.scrollLeft
            }
          }
        }}
        onTouchCancel={(e) => {
          if (e.touches.length === 0) {
            isFeaturedTouchingRef.current = false
            if (featuredRef.current) {
              featuredPosRef.current = featuredRef.current.scrollLeft
            }
          }
        }}
        className="w-[330px] min-[390px]:w-[350px] sm:w-[370px] h-[430px] sm:h-[470px] shrink-0 rounded-3xl overflow-hidden bg-white flex flex-col justify-between border border-slate-200 shadow-md hover:shadow-2xl hover:shadow-sky-500/15 hover:border-sky-300 hover:scale-[1.01] transition-all duration-300 relative group cursor-default select-none"
      >
        {/* Top ambient glowing accent beam */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 z-20" />

        {/* Card Image Header — Clicking opens zero-lag fullscreen photo lightbox */}
        <div
          onClick={(e) => {
            if (featuredHasDraggedRef.current) return
            e.stopPropagation()
            setSelectedPhoto({
              title: item.title,
              images: item.images && item.images.length > 0 ? item.images : [item.image],
            })
          }}
          className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-900 shrink-0 cursor-zoom-in group/photo"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover object-center group-hover/photo:scale-105 transition-transform duration-700 ease-out pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

          {/* Photo count indicator if gallery has multiple photos */}
          {item.images && item.images.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20">
              +{item.images.length} Photos
            </div>
          )}
        </div>

        {/* Card Content Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Dynamic Category & Date Header Row (guaranteed single line on all screens) */}
            <div className="flex items-center justify-between gap-2 mb-2 pt-0.5">
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide border shadow-xs shrink-0',
                  colorClasses
                )}
              >
                <Star className="w-3 h-3 shrink-0" />
                <span className="whitespace-nowrap">{item.category}</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 font-semibold shrink-0 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{formatDate(item.date)}</span>
              </div>
            </div>

            {/* Featured News Title — On desktop/web clicking opens details modal; on mobile/touch only View Details button opens it */}
            <h4
              onClick={(e) => {
                if (featuredHasDraggedRef.current) return
                if (typeof window !== 'undefined' && window.innerWidth < 1024) return
                e.stopPropagation()
                setSelectedNews({
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  content: item.content,
                  category: item.category,
                  date: item.date,
                  image: item.image,
                  secondaryImage: item.secondaryImage,
                  images: item.images,
                  linkedinUrl: item.linkedinUrl,
                  facebookUrl: item.facebookUrl,
                })
              }}
              className="text-[13px] min-[390px]:text-sm sm:text-base font-bold text-slate-900 lg:hover:text-sky-600 transition-colors duration-200 tracking-tight leading-snug lg:cursor-pointer line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] mb-2"
            >
              {item.title}
            </h4>

            {/* Tagline / Short Description — Strictly 3 lines across all cards */}
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-2.5 font-normal text-justify cursor-default select-text line-clamp-3">
              {item.description}
            </p>
          </div>

          {/* Actions and Social Links Row (Consistent full labels and leveled compact height) */}
          <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2 w-full mt-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {item.linkedinUrl && (
                <a
                  href={item.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (featuredHasDraggedRef.current) {
                      e.preventDefault()
                      return
                    }
                    e.stopPropagation()
                  }}
                  aria-label="View on LinkedIn"
                  className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 h-7 sm:h-[30px] rounded-full text-[10px] sm:text-[11px] font-semibold text-[#0a66c2] bg-white border border-[#0a66c2]/30 shadow-xs hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] active:bg-[#084e96] active:text-white transition-all duration-200 active:scale-95 shrink-0"
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}
              {item.facebookUrl && (
                <a
                  href={item.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (featuredHasDraggedRef.current) {
                      e.preventDefault()
                      return
                    }
                    e.stopPropagation()
                  }}
                  aria-label="View on Facebook"
                  className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 h-7 sm:h-[30px] rounded-full text-[10px] sm:text-[11px] font-semibold text-[#1877f2] bg-white border border-[#1877f2]/30 shadow-xs hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] active:bg-[#145dbf] active:text-white transition-all duration-200 active:scale-95 shrink-0"
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>
              )}
            </div>

            {/* View Details Button (Level compact height) */}
            <button
              type="button"
              onClick={(e) => {
                if (featuredHasDraggedRef.current) return
                e.stopPropagation()
                setSelectedNews({
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  content: item.content,
                  category: item.category,
                  date: item.date,
                  image: item.image,
                  secondaryImage: item.secondaryImage,
                  images: item.images,
                  linkedinUrl: item.linkedinUrl,
                  facebookUrl: item.facebookUrl,
                })
              }}
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 h-7 sm:h-[30px] px-2.5 sm:px-3 rounded-full text-[10px] sm:text-[11px] font-semibold text-sky-700 bg-white hover:bg-sky-600 hover:text-white border border-sky-600/30 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer shrink-0 ml-auto"
            >
              <Eye size={12} className="shrink-0" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  /** Renders the Loop Separator Space for Featured News */
  const renderFeaturedSeparator = (uniqueKey: string) => (
    <div
      key={uniqueKey}
      aria-hidden="true"
      className="w-[330px] min-[390px]:w-[350px] sm:w-[370px] h-[430px] sm:h-[470px] shrink-0 rounded-3xl border-2 border-dashed border-slate-300/60 bg-slate-100/30 select-none"
    />
  )

  return (
    <section id="news" className={`scroll-mt-24 sm:scroll-mt-28 relative pt-16 pb-16 sm:pt-20 sm:pb-20 ${SECTION_BG.primary} ${SECTION_BG.border} overflow-hidden`}>
      {/* Anchor for backward-compatible #latest-news navigation */}
      <div id="latest-news" className="absolute -top-24 left-0" />

      {/* Background Ambient Glow Orbs */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(99, 102, 241, 0.12) 35%, rgba(16, 185, 129, 0.08) 55%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ────────────────────────────────────────────── */}
        <SectionHeader
          pillLabel="UPDATES & FEATURED NEWS"
          title={
            <>
              News, Updates &amp; <GradText variant="sky">Breakthroughs</GradText>
            </>
          }
          description="Official announcements, industrial partnerships and technology breakthroughs"
          descriptionClassName="font-bold text-slate-700"
        />

        {/* ========================================================================= */}
        {/* FEATURED NEWS — CONTINUOUS AUTO-SCROLL + SWIPE + LOOP SEPARATOR           */}
        {/* ========================================================================= */}
        {sortedFeatured.length > 0 && (
          <motion.div {...fadeUpProps(0.15)}>
            {/* Header Controls Row: Arrow Navigation Buttons on Left, View All on Right (Both Ends on Mobile & Web) */}
            <div className="flex items-center justify-between w-full mb-5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={handleFeaturedPrev}
                  aria-label="Previous featured news"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-slate-300/90 hover:border-sky-500 bg-white text-slate-700 hover:bg-sky-600 hover:text-white shadow-sm hover:shadow-md hover:shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={handleFeaturedNext}
                  aria-label="Next featured news"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-slate-300/90 hover:border-sky-500 bg-white text-slate-700 hover:bg-sky-600 hover:text-white shadow-sm hover:shadow-md hover:shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <Link
                href="/news"
                className="group/link inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold text-sky-800 hover:text-white bg-white hover:bg-sky-600 border-2 border-sky-500/80 hover:border-sky-600 shadow-sm hover:shadow-md hover:shadow-sky-500/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ml-1"
              >
                <span>View News Archive</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover/link:translate-x-1" />
              </Link>
            </div>

            {/* Continuous Native Scroll Track with Auto-Glide, Touch Swipe & Mouse Drag */}
            <div className="relative w-full overflow-hidden py-2">
              <div
                ref={featuredRef}
                onScroll={handleFeaturedScroll}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') {
                    isFeaturedHoveredRef.current = true
                  }
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === 'mouse') {
                    isFeaturedHoveredRef.current = false
                    onFeaturedPointerUp()
                  }
                }}
                onTouchStart={() => {
                  isFeaturedHoveredRef.current = false
                  isFeaturedTouchingRef.current = true
                  isFeaturedUserScrollingRef.current = false
                  if (featuredScrollEndTimerRef.current) clearTimeout(featuredScrollEndTimerRef.current)
                }}
                onTouchMove={() => {
                  isFeaturedTouchingRef.current = true
                }}
                onTouchEnd={(e) => {
                  if (e.touches.length === 0) {
                    isFeaturedHoveredRef.current = false
                    isFeaturedTouchingRef.current = false
                    isFeaturedMouseDraggingRef.current = false
                    isFeaturedUserScrollingRef.current = false
                    if (featuredRef.current) {
                      featuredPosRef.current = featuredRef.current.scrollLeft
                    }
                    if (featuredScrollEndTimerRef.current) clearTimeout(featuredScrollEndTimerRef.current)
                  }
                }}
                onTouchCancel={(e) => {
                  if (e.touches.length === 0) {
                    isFeaturedHoveredRef.current = false
                    isFeaturedTouchingRef.current = false
                    isFeaturedMouseDraggingRef.current = false
                    isFeaturedUserScrollingRef.current = false
                    if (featuredRef.current) {
                      featuredPosRef.current = featuredRef.current.scrollLeft
                    }
                    if (featuredScrollEndTimerRef.current) clearTimeout(featuredScrollEndTimerRef.current)
                  }
                }}
                onPointerDown={onFeaturedPointerDown}
                onPointerMove={onFeaturedPointerMove}
                onPointerUp={onFeaturedPointerUp}
                onPointerCancel={onFeaturedPointerUp}
                className="flex items-stretch gap-6 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none px-4 pt-3 pb-8 scroll-smooth-touch"
              >
                {cycles.map((cIdx) => (
                  <div key={`featured-cycle-${cIdx}`} className="flex items-stretch gap-6 shrink-0">
                    {sortedFeatured.map((item, idx) =>
                      renderFeaturedCard(item, `featured-${cIdx}-${item.id}-${idx}`)
                    )}
                    {/* Empty box type space separator between the last featured news and the new start */}
                    {renderFeaturedSeparator(`featured-sep-${cIdx}`)}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pop-up Modal Window for View Details */}
      <NewsDetailModal
        item={selectedNews}
        isOpen={Boolean(selectedNews)}
        onClose={() => setSelectedNews(null)}
      />

      {/* Zero-Lag Fullscreen Photo Lightbox from Feed Clicks */}
      <ImageLightboxModal
        isOpen={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.title}
        images={selectedPhoto?.images || []}
        initialIndex={selectedPhoto?.initialIndex || 0}
      />
    </section>
  )
}
