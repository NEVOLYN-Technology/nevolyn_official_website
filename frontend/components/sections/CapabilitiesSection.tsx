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

const FEATURES: {
  title: string
  description: string
  icon: LucideIcon
  colorClass: string
  badgeBg: string
  hoverBorder: string
  tag: string
  accentColor: string
}[] = [
  {
    title: 'ARTIFICIAL INTELLIGENCE',
    description: 'Designing and deploying production-ready AI systems, from deep learning models to end-to-end intelligent automation pipelines.',
    icon: Bot,
    colorClass: 'bg-sky-50 text-sky-600 border-sky-200 group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-sky-400/30',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm',
    hoverBorder: 'hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/15',
    tag: 'Core Intelligence',
    accentColor: 'text-sky-600',
  },
  {
    title: 'INDUSTRIAL AUTOMATION',
    description: 'Engineering intelligent automation platforms that transform complex industrial operations with precision, reliability, and scale.',
    icon: Sparkles,
    colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-400/30',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
    hoverBorder: 'hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15',
    tag: 'Smart Robotics',
    accentColor: 'text-emerald-600',
  },
  {
    title: 'COMPUTER VISION',
    description: 'Real-time visual intelligence systems using advanced imaging hardware, deep learning, and edge AI for critical inspection and analysis.',
    icon: Activity,
    colorClass: 'bg-rose-50 text-rose-600 border-rose-200 group-hover:bg-gradient-to-r group-hover:from-rose-400 group-hover:to-pink-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-rose-400/30',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm',
    hoverBorder: 'hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/15',
    tag: 'Edge Optical',
    accentColor: 'text-rose-600',
  },
  {
    title: 'SOFTWARE ENGINEERING',
    description: 'Full-stack digital systems, scalable REST APIs, and modern web platforms engineered to production-ready quality standards.',
    icon: Leaf,
    colorClass: 'bg-purple-50 text-purple-600 border-purple-200 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-400/30',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm',
    hoverBorder: 'hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/15',
    tag: 'Cloud & Systems',
    accentColor: 'text-purple-600',
  },
]

export const CapabilitiesSection = (): JSX.Element => {
  return (
    <section id="capabilities" className="py-20 sm:py-24 relative overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — Soft colorful typography */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-slate-900 tracking-tight uppercase">
            Innovate. <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Automate.</span> <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Elevate.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Discover how we build advanced AI, automation, and intelligent systems to engineer solutions that matter
          </p>
        </div>

        {/* Feature Cards — Classy Porcelain Cards with Emerald, Ruby, Sapphire, and Indigo Accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              {...fadeUpProps(idx * 0.08)}
              className={`group relative rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${feature.hoverBorder} flex flex-col justify-between`}
            >
              <div>
                {/* Header row with Icon and Colorful Badge */}
                <div className="mb-6 flex items-start justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 ${feature.colorClass}`}>
                    <feature.icon className="h-7 w-7" strokeWidth={1.6} />
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${feature.badgeBg}`}>
                    {feature.tag}
                  </span>
                </div>

                {/* Text */}
                <h3 className={`text-sm font-bold text-slate-900 mb-3 tracking-wider uppercase transition-colors group-hover:${feature.accentColor}`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
