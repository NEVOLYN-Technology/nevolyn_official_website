/**
 * InnovationsSection — filterable grid of R&D projects, shown on the homepage.
 *
 * Reads from `lib/data/innovations.ts` (the single source of truth for project
 * data). Projects can be filtered by status using the tab buttons above the
 * grid. Framer Motion's `AnimatePresence` + `layout` prop handles the smooth
 * reflow animation when items enter/exit.
 *
 * ## How to add a project
 * Edit `lib/data/innovations.ts` — do NOT hard-code project data here.
 *
 * ## Filter tabs
 * The `filters` array maps UI labels to `Project['status']` values.
 * If a new status is added to the `Project` type, add a corresponding
 * entry to `filters` and `statusTone` here.
 *
 * ## Progress bar
 * Each project card shows an animated width bar driven by `project.progress`
 * (0–100). The animation fires once when the bar scrolls into view.
 *
 * @module components/sections/InnovationsSection
 */
'use client'

import type { JSX } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Calendar } from 'lucide-react'
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
 * Filterable projects grid section displaying current and planned R&D innovations.
 *
 * @returns Rendered innovations section component
 */
export const InnovationsSection = (): JSX.Element => {
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All')

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Ongoing') return project.status === 'active'
    if (activeFilter === 'Upcoming') return project.status === 'planning'
    if (activeFilter === 'Completed') return project.status === 'completed'
    return true
  })

  return (
    <section id="innovations" className="py-12 border-t border-slate-200 dark:border-blue-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUpProps(0.1)} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-500 uppercase">Our Innovations</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Pioneering the next generation of intelligent systems and sustainable textile solutions</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border",
                activeFilter === filter
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                  : "bg-transparent text-slate-600 border-slate-300 hover:border-orange-500 hover:text-orange-600 dark:text-slate-300 dark:border-slate-700 dark:hover:border-orange-400 dark:hover:text-orange-400"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Project Cards Grid */}
        <motion.div layout className="max-w-2xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                layout
                {...fadeUpProps(idx * 0.1)}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0a1526] border border-slate-200 dark:border-blue-950/60 hover:border-orange-500/60 hover:shadow-[0_0_40px_rgba(249,115,22,0.2)] transition-all duration-300 shadow-xl dark:shadow-none flex flex-col justify-between group"
              >
                {/* Top Accent Gradient Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-blue-500" />

                {/* Optional Image Banner if provided */}
                {project.image && (
                  <div className="mb-6 -mx-8 -mt-8 sm:-mx-10 sm:-mt-10 overflow-hidden relative h-48 border-b border-slate-100 dark:border-slate-800">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a1526] via-transparent to-transparent" />
                  </div>
                )}

                <div>
                  {/* Category & Status Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pt-1">
                    {/* Category Chip */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{project.category}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {project.status === 'active' && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                      )}
                      <Badge tone={STATUS_TONE[project.status]} capitalize className="font-semibold px-3 py-1 text-xs">
                        {project.status === 'active' ? 'Ongoing' : project.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-4 group-hover:text-orange-500 transition-colors">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8">
                    {project.description}
                  </p>
                </div>

                <div>
                  {/* Technology Tags */}
                  <div className="mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Tech Stack & Frameworks</span>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-blue-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-blue-900/50 hover:border-orange-500/50 hover:text-orange-500 transition-all duration-200 shadow-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Date Range & Metadata Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>Started {formatDate(project.startDate)}</span>
                      {project.endDate ? (
                        <span>• Concluded {formatDate(project.endDate)}</span>
                      ) : (
                        <span className="text-emerald-500 font-semibold">• Active R&D Project</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
