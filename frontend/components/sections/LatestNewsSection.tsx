/**
 * LatestNewsSection — Featured Milestones (4 major institutional milestones in 3D carousel) and
 * Latest News (vertical scroll timeline showing 4 news at once, scrolling row-by-row).
 *
 * Ordering:
 * - Featured Milestones: Newest (Award/Prize) -> Earliest (First POC at Saturn)
 * - Latest News: Reverse chronological order (Newest -> Top, Oldest -> Bottom)
 *   with vertical row-by-row scrolling (4 news visible at once).
 *
 * @module components/sections/LatestNewsSection
 */
'use client'

import type { JSX } from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Star, Eye, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react'
import { featuredMilestones } from '@/lib/data/featured-milestones'
import { news, type NewsItem } from '@/lib/data/latest-news'
import { fadeLeftProps, fadeUpProps } from '@/lib/animations'
import { formatDate, cn } from '@/lib/utils'
import { SectionHeader, GradText } from '@/components/ui/SectionHeader'
import { CarouselCard } from '@/components/ui/CarouselCard'
import { CarouselArrows, CarouselDots } from '@/components/ui/CarouselControls'
import { useCarousel } from '@/lib/hooks/useCarousel'
import { SECTION_BG } from '@/lib/constants/theme'
import { NewsDetailModal, type NewsModalItem } from '@/components/ui/NewsDetailModal'

/**
 * News timeline section rendering featured project announcements in a 3D carousel and
 * recent updates in a smooth vertical row-by-row scroll stage.
 *
 * @returns Rendered news section component
 */
export const LatestNewsSection = (): JSX.Element => {
  // Active selected item for the "View Details" pop-up modal
  const [selectedNews, setSelectedNews] = useState<NewsModalItem | null>(null)

  // Ref for the vertical scroll feed
  const verticalScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(true)

  // Sort complete objects strictly by date descending: Newest -> Top/First, Oldest -> Bottom/Last
  const sortedFeatured = [...featuredMilestones].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const sortedNews = [...news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Carousel state for Featured Milestones
  const { scrollContainerRef, safeCenteredIndex, handlePrev, handleNext, scrollToCard } =
    useCarousel(sortedFeatured.length, 'data-news-index')

  // Check scroll boundary state for vertical scroll arrows
  const checkVerticalScroll = () => {
    if (!verticalScrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = verticalScrollRef.current
    setCanScrollUp(scrollTop > 20)
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 20)
  }

  useEffect(() => {
    const el = verticalScrollRef.current
    if (!el) return
    checkVerticalScroll()
    el.addEventListener('scroll', checkVerticalScroll, { passive: true })
    return () => el.removeEventListener('scroll', checkVerticalScroll)
  }, [sortedNews.length])

  // Scroll exactly one line / row of news
  const scrollVertical = (direction: 'up' | 'down') => {
    if (!verticalScrollRef.current) return
    const cardEl = verticalScrollRef.current.querySelector<HTMLElement>('[data-news-card]')
    const rowStep = cardEl ? cardEl.offsetHeight + 20 : 220
    const scrollAmount = direction === 'down' ? rowStep : -rowStep

    verticalScrollRef.current.scrollBy({
      top: scrollAmount,
      behavior: 'smooth',
    })

    setTimeout(checkVerticalScroll, 350)
  }

  return (
    <section id="latest-news" className={`relative py-16 sm:py-20 ${SECTION_BG.primary} ${SECTION_BG.border} overflow-hidden`}>
      {/* Background Ambient Glow Orbs - Multi-chromatic Soft Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-gradient-to-tr from-sky-400/20 via-indigo-400/15 to-emerald-400/15 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* —— Section Header —————————————————————————————————————————————— */}
        <SectionHeader
          pillLabel="UPDATES & MILESTONES"
          title={
            <>
              Progress.{' '}
              <GradText variant="sky">Impact.</GradText>{' '}
              <GradText variant="emerald">Momentum.</GradText>
            </>
          }
          description="Official announcements, industrial partnerships, capital allocations, and technology breakthroughs shaping the trajectory of NEVOLYN Technology."
        />

        {/* ========================================================================= */}
        {/* 1. FEATURED MILESTONES (4 Major Milestones in 3D Stage Carousel) */}
        {/* ========================================================================= */}
        {sortedFeatured.length > 0 && (
          <motion.div {...fadeUpProps(0.15)} className="mb-20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                  Featured Milestones
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Key institutional breakthroughs and partnerships
                </p>
              </div>
            </div>

            {/* 3D Horizontal Carousel Stage */}
            <div className="relative w-full py-4">
              {/* Prev / Next arrow buttons */}
              {sortedFeatured.length > 1 && (
                <CarouselArrows
                  onPrev={handlePrev}
                  onNext={handleNext}
                  prevLabel="Previous milestone"
                  nextLabel="Next milestone"
                />
              )}

              {/* Native Smooth Scroll Track */}
              <div
                ref={scrollContainerRef}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 py-8 px-[calc(50%-160px)] sm:px-[calc(50%-230px)] lg:px-[calc(50%-250px)] select-none no-scrollbar"
              >
                {sortedFeatured.map((item, idx) => {
                  const isCenter = idx === safeCenteredIndex

                  return (
                    <CarouselCard
                      key={item.id}
                      isCenter={isCenter}
                      image={item.image}
                      imageAlt={item.title}
                      onClick={() => scrollToCard(idx)}
                      dataIndex={idx}
                      dataAttr="data-news-index"
                    >
                      <div className="flex flex-col flex-1 justify-between">
                        <div>
                          {/* Dynamic Category & Date Header Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pt-1">
                            {(() => {
                              const cat = item.category.toLowerCase()
                              const isGreen = cat.includes('partner') || cat.includes('award') || cat.includes('prize')
                              const isRed = cat.includes('poc') || cat.includes('demonstration')
                              const colorClasses = isGreen
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 fill-emerald-600'
                                : isRed
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 fill-rose-600'
                                  : 'bg-sky-50 text-sky-700 border-sky-200 fill-sky-600'

                              return (
                                <div className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-sm",
                                  colorClasses
                                )}>
                                  <Star className="w-3.5 h-3.5" />
                                  <span>{item.category}</span>
                                </div>
                              )
                            })()}

                            <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-sky-500" />
                              <span>{formatDate(item.date)}</span>
                            </div>
                          </div>

                          {/* Milestone Title */}
                          <h4 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-sky-600 transition-all duration-300 tracking-tight leading-snug mb-2">
                            {item.title}
                          </h4>

                          {/* Clean short description summary */}
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 font-normal line-clamp-3">
                            {item.description}
                          </p>
                        </div>

                        {/* Actions and Social Links Row */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          {/* Social links */}
                          <div className="flex items-center gap-2">
                            {item.linkedinUrl && (
                              <a
                                href={item.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="View on LinkedIn"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-white hover:bg-[#0a66c2] bg-slate-100 transition-colors shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
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
                                onClick={(e) => e.stopPropagation()}
                                aria-label="View on Facebook"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-white hover:bg-[#1877f2] bg-slate-100 transition-colors shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                              </a>
                            )}
                          </div>

                          {/* View Details Button - Sized Prominently with News Section Color Grading */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedNews({
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                content: item.content,
                                category: item.category,
                                date: item.date,
                                image: item.image,
                                linkedinUrl: item.linkedinUrl,
                                facebookUrl: item.facebookUrl,
                              })
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white transition-all duration-200 active:scale-95 shadow-sm border border-sky-100/90 cursor-pointer"
                          >
                            <Eye size={15} />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </CarouselCard>
                  )
                })}
              </div>
            </div>

            {/* Dot indicators */}
            {sortedFeatured.length > 1 && (
              <CarouselDots
                count={sortedFeatured.length}
                activeIndex={safeCenteredIndex}
                onDotClick={scrollToCard}
                itemLabel="milestone"
              />
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 2. LATEST NEWS — VERTICAL SCROLL STAGE (4 News Visible at Once, Scroll by Row) */}
        {/* ========================================================================= */}
        <motion.div {...fadeUpProps(0.2)}>
          {/* Header Row with Title */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                News
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Recent updates and institutional announcements
              </p>
            </div>
          </div>

          {/* Vertical Scroll Stage Viewport (Displays 4 Cards: 2 Rows x 2 Columns) */}
          <div className="relative rounded-3xl p-1 sm:p-2 bg-gradient-to-b from-slate-200/40 via-slate-100/20 to-slate-200/40 border border-slate-200/80">
            {/* Top subtle fade gradient mask */}
            {canScrollUp && (
              <div className="pointer-events-none absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-white/90 via-white/40 to-transparent z-20 rounded-t-3xl transition-opacity duration-300" />
            )}

            {/* Scrollable Track: exactly 2 rows (4 news) visible at once */}
            <div
              ref={verticalScrollRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="h-[460px] sm:h-[490px] overflow-y-auto scroll-smooth snap-y snap-mandatory select-none no-scrollbar p-2 sm:p-3 pb-16 sm:pb-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                {sortedNews.map((item: NewsItem, idx: number) => {
                  const isGreen = idx % 3 === 0
                  const isRed = idx % 3 === 1
                  const barColor = isGreen
                    ? 'bg-emerald-500'
                    : isRed
                      ? 'bg-rose-500'
                      : 'bg-sky-400'
                  const badgeToneClass = isGreen
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isRed
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'

                  return (
                    <motion.div
                      key={item.id}
                      data-news-card
                      {...fadeLeftProps(idx * 0.02)}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="snap-start rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between overflow-hidden relative min-h-[200px]"
                    >
                      {/* Left Colored Accent Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${barColor} transition-all duration-300`} />

                      <div className="p-4 sm:p-5 pl-5 sm:pl-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Top Header Row: Publication Date on Left, Category Badge on Right */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                              <Calendar size={13} className="text-slate-400 shrink-0" />
                              <span>{formatDate(item.date)}</span>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badgeToneClass}`}>
                              {item.category}
                            </span>
                          </div>

                          {/* Main News Title & Short Description with image thumbnail */}
                          <div className="flex gap-3.5 items-start mb-3">
                            {item.image && (
                              <div className="w-16 h-16 sm:w-18 sm:h-18 shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-100 shadow-inner">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2 mb-1">
                                {item.title}
                              </h4>
                              <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-normal">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Action Footer: View Details button & Social links */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {item.linkedinUrl && (
                              <a
                                href={item.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View on LinkedIn"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-white hover:bg-[#0a66c2] bg-slate-100 transition-colors"
                              >
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                <span className="hidden sm:inline">LinkedIn</span>
                              </a>
                            )}

                            {item.facebookUrl && (
                              <a
                                href={item.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View on Facebook"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-white hover:bg-[#1877f2] bg-slate-100 transition-colors"
                              >
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="hidden sm:inline">Facebook</span>
                              </a>
                            )}
                          </div>

                          {/* Prominent View Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedNews(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Bottom subtle fade gradient mask */}
            {canScrollDown && (
              <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-14 bg-gradient-to-t from-white/90 via-white/40 to-transparent z-20 rounded-b-3xl transition-opacity duration-300" />
            )}

            {/* Floating Arrowhead Controls: Styled to match website theme (white glassmorphic, sky gradient hover) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg shadow-slate-300/40 ring-4 ring-sky-400/10">
                {/* Upward Arrow: Inactive when on top */}
                <button
                  type="button"
                  onClick={() => scrollVertical('up')}
                  disabled={!canScrollUp}
                  aria-label="Scroll up"
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                    canScrollUp
                      ? "text-slate-700 bg-slate-50/80 hover:bg-gradient-to-r hover:from-sky-400 hover:to-blue-500 hover:text-white cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                      : "text-slate-300 bg-transparent opacity-40 cursor-not-allowed"
                  )}
                >
                  <ChevronUp size={20} className={canScrollUp ? "hover:-translate-y-0.5 transition-transform" : ""} />
                </button>

                <div className="w-px h-5 bg-slate-200" />

                {/* Downward Arrow: Inactive when reached bottom */}
                <button
                  type="button"
                  onClick={() => scrollVertical('down')}
                  disabled={!canScrollDown}
                  aria-label="Scroll down"
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                    canScrollDown
                      ? "text-slate-700 bg-slate-50/80 hover:bg-gradient-to-r hover:from-sky-400 hover:to-blue-500 hover:text-white cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                      : "text-slate-300 bg-transparent opacity-40 cursor-not-allowed"
                  )}
                >
                  <ChevronDown size={20} className={canScrollDown ? "hover:translate-y-0.5 transition-transform" : ""} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pop-up Modal Window for View Details */}
      <NewsDetailModal
        item={selectedNews}
        isOpen={Boolean(selectedNews)}
        onClose={() => setSelectedNews(null)}
      />
    </section>
  )
}
