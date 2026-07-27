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
import { Badge } from '@/components/ui/badge'
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
    <section id="latest-news" className="relative py-12 sm:py-16 bg-slate-50 dark:bg-[#0a1526]/30 border-t border-slate-200 dark:border-blue-950/40 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-orange-500/14 via-amber-500/8 to-blue-600/8 rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUpProps(0.1)} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-orange-500 uppercase tracking-tight drop-shadow-sm">
            Latest News &amp; Milestones
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
            Official updates, funding announcements, and technology breakthroughs from Saturn R&amp;D
          </p>
        </motion.div>

        {/* Featured News Carousel */}
        {sortedFeatured.length > 0 && (
          <motion.div {...fadeUpProps(0.15)} className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
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
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-white/90 border border-slate-300 backdrop-blur-xl text-slate-700 hover:bg-orange-500 hover:border-orange-400 hover:text-white hover:-translate-y-1/2 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg shadow-slate-400/25 dark:bg-slate-900/90 dark:border-slate-700/80 dark:text-slate-200 dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer group"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next milestone"
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-white/90 border border-slate-300 backdrop-blur-xl text-slate-700 hover:bg-orange-500 hover:border-orange-400 hover:text-white hover:-translate-y-1/2 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg shadow-slate-400/25 dark:bg-slate-900/90 dark:border-slate-700/80 dark:text-slate-200 dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer group"
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
                          ? "bg-gradient-to-b from-orange-500/70 via-amber-500/40 to-orange-500/30 shadow-[0_20px_50px_rgba(249,115,22,0.22),0_0_25px_rgba(249,115,22,0.15)] -translate-y-4 scale-105 filter blur-0 opacity-100 z-20"
                          : "bg-slate-300/70 shadow-lg shadow-slate-400/20 dark:bg-slate-800/60 dark:shadow-black/20 translate-y-2 scale-90 filter blur-[3.5px] opacity-50 z-10 hover:opacity-80 hover:blur-[1px]"
                      )}
                    >
                      {/* Inner Card Container */}
                      <div className="relative w-full h-full p-6 sm:p-7 rounded-[26px] bg-white/95 text-slate-900 dark:bg-[#070f1e]/95 dark:text-slate-100 backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
                        {/* Ambient Glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_55%)] pointer-events-none" />

                        {/* Top Neon Accent Beam */}
                        <div className={cn(
                          "absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl transition-all duration-500",
                          isCenter
                            ? "bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                            : "bg-slate-300 dark:bg-slate-800"
                        )} />

                        {/* Optional Image Banner */}
                        {item.image && (
                          <div className="mb-5 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 overflow-hidden relative h-40 rounded-t-[24px] border-b border-slate-200 dark:border-slate-800/80">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#070f1e] via-white/40 dark:via-slate-950/40 to-transparent" />
                          </div>
                        )}

                        <div>
                          {/* Category & Date Header Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pt-1">
                            {/* Glowing Star Category Chip */}
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-orange-500/18 via-amber-500/12 to-transparent text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)]">
                              <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                              <span>{item.category}</span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-orange-400 font-semibold">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDate(item.date)}</span>
                            </div>
                          </div>

                          {/* Gradient Milestone Title */}
                          <h4 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-700 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-200 group-hover:from-orange-500 group-hover:to-amber-600 dark:group-hover:from-orange-400 dark:group-hover:to-amber-300 transition-all duration-300 tracking-tight leading-snug mb-3 drop-shadow-sm">
                            {item.title}
                          </h4>

                          {/* Description */}
                          <p className="text-slate-600 dark:text-slate-300/90 text-xs sm:text-sm leading-relaxed mb-6 font-normal min-h-[44px]">
                            {item.description}
                          </p>
                        </div>

                        {/* Author & Saturn R&D Badge Footer */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-2">
                            <img src="/saturn-icon.png" alt="Saturn R&D" className="w-4 h-4 object-contain shrink-0" />
                            <span>{item.author}</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900/90 dark:text-slate-300 dark:border-slate-800 text-xs font-semibold group-hover:border-orange-500/40 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-all duration-300">
                            <img src="/saturn-icon.png" alt="Saturn R&D" className="w-3.5 h-3.5 object-contain shrink-0" />
                            <span>Saturn R&D</span>
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
                        ? "w-8 bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]"
                        : "w-2.5 bg-slate-400 dark:bg-slate-700 hover:bg-orange-400/60"
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
          <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            Recent Updates
          </h3>
          <div className="space-y-4">
            {sortedNews.map((item, idx) => (
              <motion.div
                key={item.id}
                {...fadeLeftProps(idx * 0.05)}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="p-[1.5px] rounded-2xl bg-gradient-to-r from-slate-200 via-slate-300/70 to-slate-200 dark:from-slate-800/80 dark:via-slate-700/50 dark:to-slate-800/80 hover:from-orange-500/60 hover:via-amber-500/40 hover:to-orange-500/30 hover:shadow-[0_10px_30px_rgba(249,115,22,0.18)] transition-all duration-500 group cursor-pointer"
              >
                <div className="p-5 sm:p-6 rounded-[14px] bg-white/95 dark:bg-[#070e1a]/95 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                  {/* Left Accent Beam */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 group-hover:bg-gradient-to-b group-hover:from-orange-500 group-hover:via-amber-400 group-hover:to-orange-500 group-hover:shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-300" />

                  <div className="mb-2 pl-2">
                    {/* Header Row: Date on Left, Category Badge on Right */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-orange-400 font-semibold">
                        <Calendar size={14} className="text-orange-400 shrink-0" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                      <Badge tone="info" className="shrink-0 bg-orange-50 text-orange-600 border border-orange-500/20 dark:bg-slate-900 dark:text-orange-400 group-hover:border-orange-500/40">
                        {item.category}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors leading-snug mb-2">
                      {item.title}
                    </h4>

                    {/* Preview Description */}
                    <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium leading-relaxed mb-2">
                      {item.description}
                    </p>

                    {/* Full Body Copy Content */}
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
