/**
 * LatestNewsSection — latest news and announcements with 3D horizontal carousel for featured milestones.
 *
 * Reads featured milestones from `lib/data/featured-milestones.ts` and recent news from `lib/data/latest-news.ts`.
 * Featured milestones are displayed in a smooth horizontal 3D card carousel with snap-center focus.
 *
 * @module components/sections/LatestNewsSection
 */
'use client'

import type { JSX } from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { featuredMilestones } from '@/lib/data/featured-milestones'
import { news } from '@/lib/data/latest-news'
import { fadeLeftProps, fadeUpProps } from '@/lib/animations'
import { formatDate, cn } from '@/lib/utils'

/**
 * News timeline section rendering featured project announcements in a 3D carousel and recent updates.
 *
 * @returns Rendered news section component
 */
export const LatestNewsSection = (): JSX.Element => {
  const sortedFeatured = [...featuredMilestones].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const sortedNews = [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const [centeredIndex, setCenteredIndex] = useState<number>(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Detect which card is closest to the middle of the scroll container
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const containerCenter = container.scrollLeft + container.clientWidth / 2

    let minDistance = Infinity
    let closestIndex = 0

    const cards = container.querySelectorAll<HTMLElement>('[data-news-index]')
    cards.forEach((card) => {
      const cardIndex = Number(card.getAttribute('data-news-index'))
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(containerCenter - cardCenter)

      if (distance < minDistance) {
        minDistance = distance
        closestIndex = cardIndex
      }
    })

    setCenteredIndex(closestIndex)
  }, [])

  // Smooth scroll to card by index
  const scrollToCard = useCallback((index: number) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cards = container.querySelectorAll<HTMLElement>('[data-news-index]')
    const targetCard = cards[index]

    if (targetCard) {
      const targetLeft = targetCard.offsetLeft - container.clientWidth / 2 + targetCard.offsetWidth / 2
      container.scrollTo({ left: targetLeft, behavior: 'smooth' })
    }
  }, [])

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, sortedFeatured.length])

  const safeCenteredIndex = Math.min(Math.max(0, centeredIndex), Math.max(0, sortedFeatured.length - 1))

  const handlePrev = () => {
    const prevIndex = safeCenteredIndex > 0 ? safeCenteredIndex - 1 : sortedFeatured.length - 1
    scrollToCard(prevIndex)
  }

  const handleNext = () => {
    const nextIndex = safeCenteredIndex < sortedFeatured.length - 1 ? safeCenteredIndex + 1 : 0
    scrollToCard(nextIndex)
  }

  return (
    <section id="latest-news" className="relative py-16 sm:py-20 bg-[#ecf1f6] border-t border-slate-200/90 overflow-hidden">
      {/* Background Ambient Glow Orbs - Multi-chromatic Soft Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-gradient-to-tr from-sky-400/20 via-indigo-400/15 to-emerald-400/15 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUpProps(0.1)} className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm mb-4 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="tracking-wide uppercase">UPDATES &amp; MILESTONES</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Progress.{' '}
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              Impact.
            </span>{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Momentum.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Official announcements, capital allocations, and technology milestones shaping the trajectory of NEVOLYN Technology.
          </p>
        </motion.div>

        {/* Featured News Carousel */}
        {sortedFeatured.length > 0 && (
          <motion.div {...fadeUpProps(0.15)} className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                Featured Milestones
              </h3>
            </div>

            {/* 3D Horizontal Carousel Stage */}
            <div className="relative w-full py-4">
              {/* Chevron Navigation Controls */}
              {sortedFeatured.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous milestone"
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-white/95 border border-slate-200 backdrop-blur-xl text-slate-700 hover:bg-gradient-to-r hover:from-sky-400 hover:to-blue-500 hover:border-transparent hover:text-white hover:-translate-y-1/2 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg shadow-slate-400/20 cursor-pointer group"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next milestone"
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-white/95 border border-slate-200 backdrop-blur-xl text-slate-700 hover:bg-gradient-to-r hover:from-sky-400 hover:to-blue-500 hover:border-transparent hover:text-white hover:-translate-y-1/2 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg shadow-slate-400/20 cursor-pointer group"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
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
                    <div
                      key={item.id}
                      data-news-index={idx}
                      onClick={() => scrollToCard(idx)}
                      className={cn(
                        "snap-center shrink-0 w-[320px] sm:w-[460px] lg:w-[500px]",
                        "p-[1.5px] rounded-[28px] transition-all duration-500 ease-out cursor-pointer group transform",
                        isCenter
                          ? "bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-500 shadow-[0_20px_50px_rgba(56,189,248,0.25),0_0_25px_rgba(99,102,241,0.15)] -translate-y-4 scale-105 filter blur-0 opacity-100 z-20"
                          : "bg-slate-300/70 shadow-lg shadow-slate-400/20 translate-y-2 scale-90 filter blur-[3.5px] opacity-50 z-10 hover:opacity-80 hover:blur-[1px]"
                      )}
                    >
                      {/* Inner Card Content Container */}
                      <div className="relative w-full h-full p-6 sm:p-7 rounded-[26px] bg-white text-slate-900 shadow-sm backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
                        {/* Inner Ambient Glow Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_55%)] pointer-events-none" />

                        {/* Top Neon Accent Beam */}
                        <div className={cn(
                          "absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl transition-all duration-500",
                          isCenter
                            ? "bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                            : "bg-slate-200"
                        )} />

                        {/* Optional Image Banner */}
                        {item.image && (
                          <div className="mb-5 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 overflow-hidden relative h-40 rounded-t-[24px] border-b border-slate-200">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                          </div>
                        )}

                        <div>
                          {/* Dynamic Category & Date Header Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pt-1">
                            {/* Glowing Category Chip with Green/Red/Blue distinction */}
                            {(() => {
                              const cat = item.category.toLowerCase()
                              const isGreen = cat.includes('fund') || cat.includes('partner') || cat.includes('growth')
                              const isRed = cat.includes('breakthrough') || cat.includes('hardware') || cat.includes('award')
                              const colorClasses = isGreen
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 fill-emerald-600'
                                : isRed
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 fill-rose-600'
                                  : 'bg-sky-50 text-sky-700 border-sky-200 fill-sky-600'

                              return (
                                <div className={cn(
                                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-sm",
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
                          <h4 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-all duration-300 tracking-tight leading-snug mb-3">
                            {item.title}
                          </h4>

                          {/* Description */}
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal min-h-[44px]">
                            {item.description}
                          </p>
                        </div>

                        {/* Author & NEVOLYN Technology Badge Footer */}
                        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-2">
                            <img src="/nevolyn-icon.png" alt="NEVOLYN Technology" className="w-4 h-4 object-contain shrink-0" />
                            <span>{item.author}</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold group-hover:border-sky-400 group-hover:text-sky-600 transition-all duration-300">
                            <img src="/nevolyn-icon.png" alt="NEVOLYN Technology" className="w-3.5 h-3.5 object-contain shrink-0" />
                            <span>NEVOLYN</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Navigation Dots */}
            {sortedFeatured.length > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                {sortedFeatured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToCard(i)}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-125",
                      i === safeCenteredIndex
                        ? "w-8 bg-gradient-to-r from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.45)]"
                        : "w-2.5 bg-slate-300 hover:bg-sky-400"
                    )}
                    aria-label={`Go to milestone ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Recent Updates List */}
        <motion.div {...fadeUpProps(0.2)}>
          <h3 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Recent Updates
          </h3>
          <div className="space-y-4">
            {sortedNews.map((item, idx) => {
              const isGreen = idx % 3 === 0
              const isRed = idx % 3 === 1
              const borderGlow = isGreen
                ? 'hover:border-emerald-300 hover:shadow-emerald-500/10'
                : isRed
                  ? 'hover:border-rose-300 hover:shadow-rose-500/10'
                  : 'hover:border-sky-300 hover:shadow-sky-500/10'
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
                  {...fadeLeftProps(idx * 0.05)}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 group cursor-pointer ${borderGlow}`}
                >
                  <div className="p-5 sm:p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                    {/* Left Colored Accent Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${barColor} transition-all duration-300`} />

                    <div className="mb-2 pl-2">
                      {/* Header Row: Date on Left, Category Badge on Right */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                          <Calendar size={14} className="text-slate-400 shrink-0" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${badgeToneClass}`}>
                          {item.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug mb-2">
                        {item.title}
                      </h4>

                      {/* Preview Description */}
                      <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-2">
                        {item.description}
                      </p>

                      {/* Full Body Copy Content */}
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
