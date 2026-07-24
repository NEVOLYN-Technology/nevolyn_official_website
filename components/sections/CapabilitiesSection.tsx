/**
 * CapabilitiesSection — four-column feature highlight strip, displayed
 * directly below the Hero on the homepage.
 *
 * Renders a horizontal row of icon + heading + description cards, each
 * animated in from below using `fadeUpProps` from `lib/animations`.
 * A decorative gradient line connects the icon circles on large screens.
 *
 * ## How to add or edit a capability
 * Edit the `FEATURES` constant below. Each entry needs:
 * - `title`       — short ALL-CAPS heading
 * - `description` — one to two sentences of supporting copy
 * - `icon`        — any Lucide component
 *
 * @module components/sections/CapabilitiesSection
 */
'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles, Activity, Leaf } from 'lucide-react'
import { fadeUpProps } from '@/lib/animations'
import type { LucideIcon } from 'lucide-react'

/** Feature card data — defined outside the component so it's not re-created on every render. */
const FEATURES: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'INTELLIGENT AUTOMATION',
    description: 'Automating textile processes to enhance precision, quality, and productivity.',
    icon: Bot,
  },
  {
    title: 'SMART TEXTILE INNOVATION',
    description: 'Developing advanced materials and intelligent solutions for performance and sustainability.',
    icon: Sparkles,
  },
  {
    title: 'QUALITY & EFFICIENCY',
    description: 'Data-driven insights and real-time monitoring to ensure superior quality and operational excellence.',
    icon: Activity,
  },
  {
    title: 'SUSTAINABLE FUTURE',
    description: 'Building eco-friendly and responsible solutions for a better tomorrow.',
    icon: Leaf,
  },
]

/**
 * Capabilities section highlighting core pillars of industrial research and technology development.
 *
 * @returns Rendered capabilities component element
 */
export const CapabilitiesSection = (): JSX.Element => {
  return (
    <section className="pt-4 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight uppercase">
            Innovate. <span className="text-orange-500">Automate.</span> <span className="text-blue-500">Elevate.</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover how we use research and develop technologies to build better solutions
          </p>
        </div>

        {/* Feature Cards */}
        <div className="relative">
          {/* Decorative horizontal connector line (desktop only) */}
          <div className="absolute top-12 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                {...fadeUpProps(idx * 0.1)}
                className="relative flex flex-col items-center lg:items-start text-center lg:text-left group"
              >
                {/* Icon Container */}
                <div className="relative mb-6">
                  {/* Glowing dot on the connector line (desktop only) */}
                  <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_2px_rgba(249,115,22,0.4)] dark:shadow-[0_0_8px_2px_rgba(249,115,22,0.6)] hidden lg:block" />

                  {/* Icon Circle */}
                  <div className="w-24 h-24 rounded-full border border-orange-500/20 dark:border-orange-500/30 flex items-center justify-center bg-white dark:bg-[#071526]/80 group-hover:border-orange-500/60 transition-colors relative z-10 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)] group-hover:shadow-[inset_0_0_30px_rgba(249,115,22,0.15)]">
                    <feature.icon className="w-10 h-10 text-orange-500" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 tracking-wider">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-0 lg:pr-4">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
