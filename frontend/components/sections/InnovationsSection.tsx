/**
 * InnovationsSection — Smooth horizontal carousel of R&D projects.
 *
 * Uses native smooth momentum scrolling with snap-center focus, multi-layered dark glass,
 * gradient border frames, glowing neon accent beams, and interactive CTA buttons.
 *
 * Reads from `lib/data/innovations.ts` (the single source of truth for project data).
 * Carousel state (scroll detection, nav, index) is managed by the `useCarousel` hook.
 *
 * @module components/sections/InnovationsSection
 */
'use client'

import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tag, Calendar, Sparkles } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { projects, type Project } from '@/lib/data/innovations'
import { fadeUpProps } from '@/lib/animations'
import { formatDate, cn } from '@/lib/utils'
import { SectionHeader, GradText } from '@/components/ui/SectionHeader'
import { CarouselCard } from '@/components/ui/CarouselCard'
import { CarouselArrows, CarouselDots } from '@/components/ui/CarouselControls'
import { useCarousel } from '@/lib/hooks/useCarousel'

/** Maps each project status to the appropriate Badge tone (color). */
const STATUS_TONE: Record<Project['status'], BadgeTone> = {
  active: 'success',
  planning: 'warning',
  completed: 'info',
}

/** UI filter labels and the project status they correspond to. */
const FILTERS = ['All', 'Ongoing', 'Completed'] as const
type FilterLabel = typeof FILTERS[number]

/**
 * Filterable 3D horizontal projects carousel displaying current and planned R&D innovations.
 *
 * @returns Rendered innovations section component
 */
export const InnovationsSection = (): JSX.Element => {
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All')

  // ── Filtered project list ─────────────────────────────────────────────────
  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Ongoing') return project.status === 'active'
    if (activeFilter === 'Completed') return project.status === 'completed'
    return true
  })

  // ── Carousel state managed by shared hook — no duplicate scroll logic ─────
  const { scrollContainerRef, safeCenteredIndex, handlePrev, handleNext, scrollToCard } =
    useCarousel(filteredProjects.length, 'data-card-index')

  // ── Reset carousel to first card when active filter changes ──────────────
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [activeFilter, scrollContainerRef])

  const currentCenteredProject = filteredProjects[safeCenteredIndex]

  return (
    <section id="innovations" className="relative py-14 sm:py-20 overflow-hidden border-t border-sky-300/60 bg-[#d5e4f6]">
      {/* Background Ambient Glow Orbs - Multi-chromatic Soft Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-gradient-to-tr from-sky-400/20 via-indigo-400/15 to-emerald-400/15 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ────────────────────────────────────────── */}
        <SectionHeader
          pillLabel="RESEARCH & COMMERCIAL PRODUCTS"
          title={
            <>
              Research.{' '}
              <GradText variant="sky">Develop.</GradText>{' '}
              <GradText variant="emerald">Deploy.</GradText>
            </>
          }
          description="Pioneering next-generation intelligent systems, automated computer vision, and scalable software platforms engineered for real-world execution."
        />

        {/* Filter Tabs */}
        <motion.div {...fadeUpProps(0.15)} className="flex flex-wrap justify-center gap-3 mb-8 sm:mb-10">
          {FILTERS.map((filter) => {
            const isSelected = activeFilter === filter
            const isMatchingCenteredStatus =
              currentCenteredProject &&
              ((filter === 'Ongoing' && currentCenteredProject.status === 'active') ||
                (filter === 'Completed' && currentCenteredProject.status === 'completed'))

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 border transform cursor-pointer",
                  "hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-95",
                  isSelected
                    ? "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-white border-transparent shadow-lg shadow-sky-500/30 -translate-y-0.5 scale-105 font-extrabold"
                    : isMatchingCenteredStatus
                      ? "bg-sky-50 text-sky-700 border-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)] -translate-y-0.5 scale-105 font-bold"
                      : "bg-white text-slate-600 border-slate-300 hover:border-sky-400 hover:text-sky-600 hover:shadow-[0_0_12px_rgba(56,189,248,0.2)] shadow-sm"
                )}
              >
                {filter}
              </button>
            )
          })}
        </motion.div>

        {/* ── 3D Horizontal Carousel Stage ─────────────────────────────── */}
        <motion.div {...fadeUpProps(0.25)} className="relative w-full py-4">
          {/* Prev / Next arrow buttons (shared CarouselArrows component) */}
          {filteredProjects.length > 1 && (
            <CarouselArrows
              onPrev={handlePrev}
              onNext={handleNext}
              prevLabel="Previous project"
              nextLabel="Next project"
            />
          )}

          {/* Native smooth scroll track */}
          <div
            ref={scrollContainerRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 py-8 px-[calc(50%-160px)] sm:px-[calc(50%-230px)] lg:px-[calc(50%-250px)] select-none no-scrollbar"
          >
            {filteredProjects.map((project, idx) => {
              const isCenter = idx === safeCenteredIndex

              return (
                // ── CarouselCard handles the gradient border, inner glow, beam, and image ──
                <CarouselCard
                  key={project.id}
                  isCenter={isCenter}
                  image={project.image}
                  imageAlt={project.title}
                  onClick={() => scrollToCard(idx)}
                  dataIndex={idx}
                  dataAttr="data-card-index"
                >

                    <div>
                      {/* Category & Status Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pt-1">
                        {/* Dynamic Colorful Category Chip */}
                        {(() => {
                          const cat = project.category.toLowerCase()
                          const isGreen = cat.includes('auto') || cat.includes('system') || cat.includes('clean')
                          const isRed = cat.includes('vision') || cat.includes('optic') || cat.includes('robot')
                          const colorClasses = isGreen
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isRed
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'

                          return (
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-sm",
                              colorClasses
                            )}>
                              <Tag className="w-3.5 h-3.5" />
                              <span>{project.category}</span>
                            </div>
                          )
                        })()}

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

                      {/* Project Title */}
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-all duration-300 tracking-tight leading-snug mb-3">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal min-h-[44px]">
                        {project.description}
                      </p>
                    </div>

                    <div>
                      {/* Technology Stack Badges */}
                      <div className="mb-5">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Tech Stack & Frameworks</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 group-hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 shadow-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Date & Interactive CTA Footer */}
                      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                          <span>
                            {project.status === 'completed' && project.endDate
                              ? `Completed ${formatDate(project.endDate)}`
                              : project.status === 'planning'
                                ? 'Upcoming R&D Initiative'
                                : `Started ${formatDate(project.startDate)}`}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold group-hover:border-sky-400 group-hover:text-sky-600 transition-all duration-300">
                          <img src="/nevolyn-icon.png" alt="NEVOLYN Technology" className="w-3.5 h-3.5 object-contain shrink-0" />
                          <span className="font-brand tracking-wider text-[10px]">NEVOLYN</span>
                        </div>
                      </div>
                    </div>
                </CarouselCard>
              )
            })}
          </div>

          {/* Dot indicators (shared CarouselDots component) */}
          {filteredProjects.length > 1 && (
            <CarouselDots
              count={filteredProjects.length}
              activeIndex={safeCenteredIndex}
              onDotClick={scrollToCard}
              itemLabel="project"
            />
          )}
        </motion.div>
      </div>
    </section>
  )
}
