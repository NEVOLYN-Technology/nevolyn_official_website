/**
 * ProductsSection — Smooth horizontal carousel of R&D and commercial products.
 *
 * Uses native smooth momentum scrolling with snap-center focus, multi-layered dark glass,
 * gradient border frames, glowing neon accent beams, and interactive CTA buttons.
 *
 * Reads from `lib/data/products.ts` (the single source of truth for product data).
 * Carousel state (scroll detection, nav, index) is managed by the `useCarousel` hook.
 *
 * @module components/sections/ProductsSection
 */
'use client'

import type { JSX } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Tag, Globe, Mail } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { projects, type Project } from '@/lib/data/products'
import { fadeUpProps } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { SectionHeader, GradText } from '@/components/ui/SectionHeader'
import { CarouselCard } from '@/components/ui/CarouselCard'
import { CarouselArrows, CarouselDots } from '@/components/ui/CarouselControls'
import { useCarousel } from '@/lib/hooks/useCarousel'
import { SECTION_BG } from '@/lib/constants/theme'
import { ImageLightboxModal } from '@/components/ui/ImageLightboxModal'

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
 * Filterable 3D horizontal projects carousel displaying current and planned R&D and commercial products.
 *
 * @returns Rendered products section component
 */
export const ProductsSection = (): JSX.Element => {
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All')
  // Active photo for the full-screen photo lightbox
  const [selectedPhoto, setSelectedPhoto] = useState<{ image: string; title: string } | null>(null)

  const handleClosePhoto = useCallback(() => {
    setSelectedPhoto(null)
  }, [])


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
    <section id="products" className={`relative py-14 sm:py-20 overflow-hidden ${SECTION_BG.border} ${SECTION_BG.primary}`}>
      {/* Background Ambient Glow Orbs - Multi-chromatic Soft Aura */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at center, rgba(56,189,248,0.16) 0%, rgba(129,140,248,0.10) 35%, rgba(52,211,153,0.06) 55%, transparent 70%)' }}
      />

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

        {/* Filter Tabs — shown when multiple projects are available */}
        {projects.length > 1 && (
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
        )}

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
            className={cn(
              "flex overflow-x-auto snap-x snap-mandatory gap-6 py-8 no-scrollbar",
              filteredProjects.length === 1
                ? "justify-center px-4"
                : "px-[calc(50%-150px)] sm:px-[calc(50%-240px)] lg:px-[calc(50%-270px)]"
            )}
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
                  onImageClick={project.image ? () => setSelectedPhoto({ image: project.image!, title: project.title }) : undefined}
                  dataIndex={idx}
                  dataAttr="data-card-index"
                >
                  <div>
                    {/* Category & Status Header Row */}
                    <div className="flex items-center justify-between gap-2 mb-2 pt-0.5">
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
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider border shadow-xs min-w-0 max-w-[62%]",
                            colorClasses
                          )}>
                            {project.websiteLogo || project.id === 'fabins' ? (
                              <img
                                src={project.websiteLogo || '/fabins-logo.png'}
                                alt={`${project.title} Logo`}
                                className="w-3.5 h-3.5 object-contain shrink-0"
                              />
                            ) : (
                              <Tag className="w-3 h-3 shrink-0" />
                            )}
                            <span className="truncate">{project.category}</span>
                          </div>
                        )
                      })()}

                      {/* Status Badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {project.status === 'active' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                          </span>
                        )}
                        <Badge tone={STATUS_TONE[project.status]} capitalize className="font-bold px-2.5 py-0.5 text-[10px] sm:text-[11px] tracking-wide">
                          {project.status === 'active' ? 'Ongoing' : project.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Project Title: Logo + FABINS on top line (clickable only), Subtitle on second line */}
                    {(() => {
                      const parts = project.title.split(' - ')
                      const brand = parts[0]
                      const subtitle = parts.slice(1).join(' - ')

                      if (subtitle && project.url) {
                        return (
                          <div className="mb-1.5">
                            {/* Top line: FABINS Logo + FABINS (Only this is clickable) */}
                            <div>
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="group/brand inline-flex items-center gap-1.5 hover:opacity-100 transition-all duration-300 ease-out cursor-pointer mb-0.5 transform-gpu hover:-translate-y-0.5"
                                title={`Visit ${brand} (${project.url})`}
                              >
                                <img
                                  src={project.websiteLogo || '/fabins-logo.png'}
                                  alt={`${brand} Logo`}
                                  className="w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain shrink-0 group-hover/brand:scale-110 group-hover/brand:-rotate-3 transition-transform duration-300 ease-out drop-shadow-xs"
                                />
                                <span className="text-base sm:text-lg font-black tracking-tight transition-transform duration-300 group-hover/brand:scale-[1.02]">
                                  {brand === 'FABINS' ? (
                                    <>
                                      <span className="text-slate-900">FAB</span>
                                      <span className="text-[#0a829d] group-hover/brand:text-[#07687d] transition-colors">INS</span>
                                    </>
                                  ) : (
                                    <span className="text-slate-900 group-hover/brand:text-[#0a829d] transition-colors">{brand}</span>
                                  )}
                                </span>
                              </a>
                            </div>

                            {/* Second line: Subtitle (Non-clickable) */}
                            <h3 className="text-xs sm:text-[13px] font-semibold text-slate-700 tracking-tight leading-snug line-clamp-1">
                              {subtitle}
                            </h3>
                          </div>
                        )
                      }

                      return (
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug mb-1.5">
                          {project.title}
                        </h3>
                      )
                    })()}

                    {/* Description — Full text displayed cleanly without truncation */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-2.5 font-normal text-justify">
                      {project.description}
                    </p>
                  </div>

                  {/* Bottom Action Footer (Tech Stack removed, leveled compact buttons) */}
                  <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2 w-full mt-auto">
                    {project.email && (
                      <a
                        href={`mailto:${project.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-1.5 h-7 sm:h-[30px] px-2.5 sm:px-3 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300/80 text-[10px] sm:text-[11px] font-bold transition-all duration-200 shadow-xs active:scale-95 cursor-pointer max-w-[55%] truncate"
                        title={`Email ${project.email}`}
                        aria-label={`Send email to ${project.email}`}
                      >
                        <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">{project.email}</span>
                      </a>
                    )}

                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-1.5 h-7 sm:h-[30px] px-3 sm:px-3.5 rounded-full bg-white hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-500/80 hover:border-sky-600 text-[10px] sm:text-[11px] font-bold transition-all duration-200 shadow-xs active:scale-95 cursor-pointer shrink-0 ml-auto"
                        title={`Visit Official Website (${project.url})`}
                        aria-label={`Visit ${project.title} official website`}
                      >
                        <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span>View Details</span>
                      </a>
                    )}
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

      {/* Full-screen Photo Lightbox Modal for clicking machine photo */}
      <ImageLightboxModal
        isOpen={Boolean(selectedPhoto)}
        images={selectedPhoto?.image ? [selectedPhoto.image] : []}
        title={selectedPhoto?.title}
        onClose={handleClosePhoto}
      />
    </section>
  )
}
