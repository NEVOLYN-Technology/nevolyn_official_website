/**
 * InnovationsSection — Smooth horizontal carousel of R&D projects.
 *
 * Uses native smooth momentum scrolling with snap-center focus, multi-layered dark glass,
 * gradient border frames, glowing neon accent beams, and interactive CTA buttons.
 *
 * Reads from `lib/data/innovations.ts` (the single source of truth for project data).
 *
 * @module components/sections/InnovationsSection
 */
'use client'

import type { JSX } from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Tag, Calendar, ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { projects, type Project } from '@/lib/data/innovations'
import { fadeUpProps } from '@/lib/animations'
import { formatDate, cn } from '@/lib/utils'

/** Maps each project status to the appropriate Badge tone (color). */
const STATUS_TONE: Record<Project['status'], BadgeTone> = {
  active: 'success',
  planning: 'warning',
  completed: 'info',
}

/** UI filter labels and the project status they correspond to. */
const FILTERS = ['All', 'Ongoing', 'Upcoming', 'Completed'] as const
type FilterLabel = typeof FILTERS[number]

/**
 * Filterable 3D horizontal projects carousel displaying current and planned R&D innovations.
 *
 * @returns Rendered innovations section component
 */
export const InnovationsSection = (): JSX.Element => {
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All')
  const [centeredIndex, setCenteredIndex] = useState<number>(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Ongoing') return project.status === 'active'
    if (activeFilter === 'Upcoming') return project.status === 'planning'
    if (activeFilter === 'Completed') return project.status === 'completed'
    return true
  })

  // Detect which card is closest to the middle of the scroll container
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const containerCenter = container.scrollLeft + container.clientWidth / 2

    let minDistance = Infinity
    let closestIndex = 0

    const cards = container.querySelectorAll<HTMLElement>('[data-card-index]')
    cards.forEach((card) => {
      const cardIndex = Number(card.getAttribute('data-card-index'))
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
    const cards = container.querySelectorAll<HTMLElement>('[data-card-index]')
    const targetCard = cards[index]

    if (targetCard) {
      const targetLeft = targetCard.offsetLeft - container.clientWidth / 2 + targetCard.offsetWidth / 2
      container.scrollTo({ left: targetLeft, behavior: 'smooth' })
    }
  }, [])

  // Reset scroll position when filter changes
  useEffect(() => {
    setCenteredIndex(0)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [activeFilter])

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, filteredProjects.length])

  const safeCenteredIndex = Math.min(Math.max(0, centeredIndex), Math.max(0, filteredProjects.length - 1))

  const handlePrev = () => {
    const prevIndex = safeCenteredIndex > 0 ? safeCenteredIndex - 1 : filteredProjects.length - 1
    scrollToCard(prevIndex)
  }

  const handleNext = () => {
    const nextIndex = safeCenteredIndex < filteredProjects.length - 1 ? safeCenteredIndex + 1 : 0
    scrollToCard(nextIndex)
  }

  const currentCenteredProject = filteredProjects[safeCenteredIndex]

  return (
    <section id="innovations" className="relative py-12 sm:py-16 overflow-hidden border-t border-slate-200 dark:border-blue-950/40">
      {/* Background Ambient Glow Orbs - Perfectly Balanced Vibrancy */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-orange-500/14 via-amber-500/8 to-blue-600/8 rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUpProps(0.1)} className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-orange-500 uppercase tracking-tight drop-shadow-sm">
            Our Innovations
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
            Pioneering The Next Generation of Intelligent Systems and Textile Solutions
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div {...fadeUpProps(0.15)} className="flex flex-wrap justify-center gap-3 mb-8 sm:mb-10">
          {FILTERS.map((filter) => {
            const isSelected = activeFilter === filter
            const isMatchingCenteredStatus =
              currentCenteredProject &&
              ((filter === 'Completed' && currentCenteredProject.status === 'completed') ||
               (filter === 'Ongoing' && currentCenteredProject.status === 'active') ||
               (filter === 'Upcoming' && currentCenteredProject.status === 'planning'))

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 border transform cursor-pointer",
                  "hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95",
                  isSelected
                    ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white border-orange-400 shadow-md shadow-orange-500/30 -translate-y-1 scale-105 font-extrabold"
                    : isMatchingCenteredStatus
                    ? "bg-orange-500/15 text-orange-400 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.25)] -translate-y-1 scale-105 font-bold"
                    : "bg-slate-900/60 dark:bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-orange-500/80 hover:text-orange-400 hover:shadow-[0_0_12px_rgba(249,115,22,0.2)] backdrop-blur-md"
                )}
              >
                {filter}
              </button>
            )
          })}
        </motion.div>

        {/* 3D Horizontal Carousel Stage with Native Smooth Scrolling */}
        <motion.div {...fadeUpProps(0.25)} className="relative w-full py-4">
          {/* Previous / Next Arrow Controls */}
          {filteredProjects.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous project"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl text-slate-200 hover:bg-orange-500 hover:border-orange-400 hover:text-white hover:-translate-y-1/2 hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next project"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl text-slate-200 hover:bg-orange-500 hover:border-orange-400 hover:text-white hover:-translate-y-1/2 hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer group"
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
            {filteredProjects.map((project, idx) => {
              const isCenter = idx === safeCenteredIndex

              return (
                <div
                  key={project.id}
                  data-card-index={idx}
                  onClick={() => scrollToCard(idx)}
                  className={cn(
                    "snap-center shrink-0 w-[320px] sm:w-[460px] lg:w-[500px]",
                    "p-[1.5px] rounded-[28px] transition-all duration-500 ease-out cursor-pointer group transform",
                    isCenter
                      ? "bg-gradient-to-b from-orange-500/70 via-amber-500/40 to-orange-500/30 shadow-[0_20px_50px_rgba(249,115,22,0.22),0_0_25px_rgba(249,115,22,0.15)] -translate-y-4 scale-105 filter blur-0 opacity-100 z-20"
                      : "bg-slate-800/60 shadow-lg translate-y-2 scale-90 filter blur-[3.5px] opacity-50 z-10 hover:opacity-80 hover:blur-[1px]"
                  )}
                >
                  {/* Inner Card Content Container */}
                  <div className="relative w-full h-full p-6 sm:p-7 rounded-[26px] bg-slate-950/95 dark:bg-[#070f1e]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
                    {/* Inner Ambient Glow Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_55%)] pointer-events-none" />

                    {/* Top Neon Accent Beam */}
                    <div className={cn(
                      "absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl transition-all duration-500",
                      isCenter
                        ? "bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                        : "bg-slate-800"
                    )} />

                    {/* Optional Image Banner if provided */}
                    {project.image && (
                      <div className="mb-5 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 overflow-hidden relative h-40 rounded-t-[24px] border-b border-slate-800/80">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 dark:from-[#070f1e] via-slate-950/40 to-transparent" />
                      </div>
                    )}

                    <div>
                      {/* Category & Status Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pt-1">
                        {/* Glowing Category Chip */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-orange-500/18 via-amber-500/12 to-transparent text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)]">
                          <Tag className="w-3.5 h-3.5 text-orange-400" />
                          <span>{project.category}</span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {project.status === 'active' && (
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                            </span>
                          )}
                          <Badge tone={STATUS_TONE[project.status]} capitalize className="font-bold px-3 py-1 text-xs tracking-wide">
                            {project.status === 'active' ? 'Ongoing' : project.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Gradient Project Title */}
                      <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-200 group-hover:from-orange-400 group-hover:to-amber-300 transition-all duration-300 tracking-tight leading-snug mb-3 drop-shadow-sm">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-300/90 text-xs sm:text-sm leading-relaxed mb-6 font-normal min-h-[44px]">
                        {project.description}
                      </p>
                    </div>

                    <div>
                      {/* Technology Stack Badges */}
                      <div className="mb-5">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Tech Stack & Frameworks</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 text-slate-200 border border-slate-700/80 group-hover:border-orange-400/60 hover:text-orange-300 hover:bg-orange-950/40 hover:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all duration-200 shadow-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Date & Interactive CTA Footer */}
                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>
                            {project.status === 'completed' && project.endDate
                              ? `Completed ${formatDate(project.endDate)}`
                              : project.status === 'planning'
                              ? 'Upcoming R&D Initiative'
                              : `Started ${formatDate(project.startDate)}`}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-slate-800 text-xs font-semibold group-hover:border-orange-500/40 group-hover:text-orange-400 transition-all duration-300">
                          <img src="/saturn-icon.png" alt="Saturn R&D" className="w-3.5 h-3.5 object-contain shrink-0" />
                          <span>Saturn R&D</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        {/* Horizontal Navigation Dots */}
        {filteredProjects.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {filteredProjects.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToCard(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-125",
                  i === safeCenteredIndex
                    ? "w-8 bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]"
                    : "w-2.5 bg-slate-700 hover:bg-orange-400/60"
                )}
                aria-label={`Go to project ${i + 1}`}
              />
            ))}
          </div>
        )}
        </motion.div>
      </div>
    </section>
  )
}
