/**
 * AboutSection — mission, vision, what-we-do, and focus-area pillars,
 * followed immediately by the `LeadershipTeam` section.
 *
 * Rendered as `id="about"` on the homepage so the Navbar's "About" link
 * can scroll directly to it.
 *
 * ## Layout
 * Four icon cards arranged in a 4-column grid (stacked on mobile) with a
 * decorative gradient line connecting the icon circles on desktop.
 * The `LeadershipTeam` component is embedded at the bottom — it has its own
 * `id="leadership"` anchor so both nav links work correctly.
 *
 * ## How to update the mission/vision copy
 * Edit the paragraph text directly in the JSX below. There is no data file
 * for this section — the copy is intentionally inline because it rarely
 * changes and is tightly coupled to the layout.
 *
 * @module components/sections/AboutSection
 */
'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'
import { Target, Globe, Cpu, Layers, CheckCircle2 } from 'lucide-react'
import { fadeUpProps } from '@/lib/animations'

/**
 * About section presenting Saturn R&D mission, vision, core engineering activities, and focus pillars.
 *
 * @returns Rendered About section component
 */
export const AboutSection = (): JSX.Element => {
  return (
    <section id="about" className="pt-12 pb-6 border-t border-slate-200 dark:border-blue-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps(0.1)} className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-orange-500 tracking-tight uppercase">About Us</h2>

          {/* Decorative Divider */}
          <div className="relative max-w-xl mx-auto h-[1px] mb-8 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_2px_rgba(249,115,22,0.6)]" />
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            The R&D Department of Saturn Textiles Limited is committed to advancing the textile industry through smart automation and sustainable technology
          </p>
        </motion.div>

        {/* Mission, Vision, What We Do, Focus Areas */}
        <div className="relative mb-8 sm:mb-12">
          {/* Decorative horizontal connector line (desktop only) */}
          <div className="absolute top-12 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">

            {/* Our Mission */}
            <motion.div {...fadeUpProps(0.1)} className="relative flex flex-col items-center lg:items-start text-center lg:text-left group">
              <div className="relative mb-6">
                <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_2px_rgba(249,115,22,0.4)] dark:shadow-[0_0_8px_2px_rgba(249,115,22,0.6)] hidden lg:block" />
                <div className="w-24 h-24 rounded-full border border-orange-500/20 dark:border-orange-500/30 flex items-center justify-center bg-white dark:bg-[#071526]/80 group-hover:border-orange-500/60 transition-colors relative z-10 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)] group-hover:shadow-[inset_0_0_30px_rgba(249,115,22,0.15)]">
                  <Target className="w-10 h-10 text-orange-500" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 tracking-wider uppercase">OUR MISSION</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-0 lg:pr-4">
                To develop intelligent, sustainable, and automated textile solutions through advanced research and innovation that drive efficiency, quality, and value.
              </p>
            </motion.div>

            {/* Our Vision */}
            <motion.div {...fadeUpProps(0.2)} className="relative flex flex-col items-center lg:items-start text-center lg:text-left group">
              <div className="relative mb-6">
                <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.4)] dark:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)] hidden lg:block" />
                <div className="w-24 h-24 rounded-full border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center bg-white dark:bg-[#071526]/80 group-hover:border-blue-500/60 transition-colors relative z-10 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] group-hover:shadow-[inset_0_0_30px_rgba(59,130,246,0.15)]">
                  <Globe className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 tracking-wider uppercase">OUR VISION</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-0 lg:pr-4">
                To be a global leader in textile innovation, recognized for transforming challenges into sustainable technologies that empower the industry.
              </p>
            </motion.div>

            {/* What We Do */}
            <motion.div {...fadeUpProps(0.3)} className="relative flex flex-col items-center lg:items-start text-center lg:text-left group">
              <div className="relative mb-6">
                <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_2px_rgba(249,115,22,0.4)] dark:shadow-[0_0_8px_2px_rgba(249,115,22,0.6)] hidden lg:block" />
                <div className="w-24 h-24 rounded-full border border-orange-500/20 dark:border-orange-500/30 flex items-center justify-center bg-white dark:bg-[#071526]/80 group-hover:border-orange-500/60 transition-colors relative z-10 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)] group-hover:shadow-[inset_0_0_30px_rgba(249,115,22,0.15)]">
                  <Cpu className="w-10 h-10 text-orange-500" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 tracking-wider uppercase">WHAT WE DO</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-0 lg:pr-4">
                We research, design, and develop smart systems, advanced materials, and automation solutions that enhance performance, productivity, and sustainability.
              </p>
            </motion.div>

            {/* Our Focus Areas */}
            <motion.div {...fadeUpProps(0.4)} className="relative flex flex-col items-center lg:items-start text-center lg:text-left group">
              <div className="relative mb-6">
                <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.4)] dark:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)] hidden lg:block" />
                <div className="w-24 h-24 rounded-full border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center bg-white dark:bg-[#071526]/80 group-hover:border-blue-500/60 transition-colors relative z-10 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] group-hover:shadow-[inset_0_0_30px_rgba(59,130,246,0.15)]">
                  <Layers className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 tracking-wider uppercase">OUR FOCUS AREAS</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2 w-full text-left lg:pr-4">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Smart Textile Automation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Advanced Materials & Finishing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Data Intelligence & Analytics</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Sustainability & Circularity</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
