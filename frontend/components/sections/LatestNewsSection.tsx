/**
 * LatestNewsSection — latest news and announcements with 3D horizontal carousel for featured milestones.
 *
 * Reads featured milestones from `lib/data/featured-milestones.ts` and recent news from `lib/data/latest-news.ts`.
 * Featured milestones are displayed in a smooth horizontal 3D card carousel with snap-center focus.
 * Carousel state is managed by the shared `useCarousel` hook.
 *
 * @module components/sections/LatestNewsSection
 */
'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Star } from 'lucide-react'
import { featuredMilestones } from '@/lib/data/featured-milestones'
import { news } from '@/lib/data/latest-news'
import { fadeLeftProps, fadeUpProps } from '@/lib/animations'
import { formatDate, cn } from '@/lib/utils'
import { SectionHeader, GradText } from '@/components/ui/SectionHeader'
import { CarouselCard } from '@/components/ui/CarouselCard'
import { CarouselArrows, CarouselDots } from '@/components/ui/CarouselControls'
import { useCarousel } from '@/lib/hooks/useCarousel'

/**
 * News timeline section rendering featured project announcements in a 3D carousel and recent updates.
 *
 * @returns Rendered news section component
 */
export const LatestNewsSection = (): JSX.Element => {
  // Sort both lists newest-first
  const sortedFeatured = [...featuredMilestones].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const sortedNews = [...news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // —— Carousel state managed by the shared useCarousel hook ——————————————
  const { scrollContainerRef, safeCenteredIndex, handlePrev, handleNext, scrollToCard } =
    useCarousel(sortedFeatured.length, 'data-news-index')

  return (
    <section id="latest-news" className="relative py-16 sm:py-20 bg-[#d5e4f6] border-t border-sky-300/60 overflow-hidden">
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
          description="Official announcements, capital allocations, and technology milestones shaping the trajectory of NEVOLYN Technology."
        />

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
              {/* Prev / Next arrow buttons (shared CarouselArrows component) */}
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
                    // —— CarouselCard handles gradient border, inner glow, beam, and image ——
                    <CarouselCard
                      key={item.id}
                      isCenter={isCenter}
                      image={item.image}
                      imageAlt={item.title}
                      onClick={() => scrollToCard(idx)}
                      dataIndex={idx}
                      dataAttr="data-news-index"
                    >
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
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold group-hover:border-sky-400 group-hover:text-sky-600 transition-all duration-300">
                          <img src="/nevolyn-icon.png" alt="NEVOLYN Technology" className="w-3.5 h-3.5 object-contain shrink-0" />
                          <span className="font-brand tracking-wider text-[10px]">NEVOLYN</span>
                        </div>
                      </div>
                    </CarouselCard>
                  )
                })}
              </div>
            </div>

            {/* Dot indicators (shared CarouselDots component) */}
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
