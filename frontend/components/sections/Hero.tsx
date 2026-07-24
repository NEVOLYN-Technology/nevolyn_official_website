/**
 * Hero — full-width landing section at the very top of the homepage.
 *
 * Renders a two-column grid: left side has the headline copy and CTA buttons;
 * right side displays the Saturn Textiles hero image. Both columns animate in
 * on mount using Framer Motion (not scroll-triggered — the hero is already
 * visible on load).
 *
 * ## How to update the CTA buttons
 * The three Link buttons are inline in the JSX below. Edit their `href` or
 * label text directly.
 *
 * ## How to update the hero image
 * Replace `/public/saturn-image.png` with a new file of the same name, or
 * update the `src` attribute in the `<img>` tag below.
 *
 * @module components/sections/Hero
 */
'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Top hero landing section featuring primary value proposition CTAs and animated graphic.
 *
 * @returns Rendered hero section element
 */
export const Hero = (): JSX.Element => (
  <section className="relative text-slate-900 dark:text-slate-100">
    <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-6 sm:px-8 lg:px-10 lg:pt-10">
      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left — Copy & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.75rem]">
            <span className="text-slate-900 dark:text-white">Leading the Future of</span><br />
            <span className="bg-gradient-to-r from-orange-600 via-orange-200 to-blue-400 bg-clip-text text-transparent">Textile Innovation</span><br />
            <span className="text-slate-600 dark:text-slate-400">and Automation</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 text-left">
            We build smart solutions that modernize production, drive efficiency, and solve complex challenges in the textile industry.
          </p>
          <div className="mt-8 flex flex-nowrap items-center gap-2">
            <Link href="/#innovations" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 dark:shadow-orange-950/50 transition-all duration-300 hover:brightness-110 hover:-translate-y-1 hover:scale-105 hover:shadow-orange-500/50 whitespace-nowrap">
              Explore Our Innovations <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/#leaders" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 dark:shadow-orange-950/50 transition-all duration-300 hover:brightness-110 hover:-translate-y-1 hover:scale-105 hover:shadow-orange-500/50 whitespace-nowrap">
              Meet Our Leaders <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/join_us" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 dark:shadow-orange-950/50 transition-all duration-300 hover:brightness-110 hover:-translate-y-1 hover:scale-105 hover:shadow-orange-500/50 whitespace-nowrap">
              Join Our Team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Right — Hero Image with Floating Motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="relative lg:-mt-20 flex items-center justify-center"
        >
          {/* Deep Dark Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700/25 via-orange-600/20 to-amber-600/25 blur-[100px] rounded-full -z-10 transform scale-110 pointer-events-none" />

          {/* Smooth Floating Weightless Motion for Logo Graphic & Stable Border */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-full scale-[1.28] flex items-center justify-center"
          >
            {/* Seamlessly Matched Glowing Neon Border Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-75"
              viewBox="0 0 1280 720"
              preserveAspectRatio="none"
              style={{ mixBlendMode: 'screen' }}
            >
              <defs>
                <linearGradient id="matched-border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="45%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>

              {/* Matched Glowing Border Line */}
              <rect
                x="76"
                y="160"
                width="1128"
                height="398"
                rx="62"
                ry="62"
                fill="none"
                stroke="url(#matched-border-gradient)"
                strokeWidth="7.8"
                vectorEffect="non-scaling-stroke"
                style={{ filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.75)) drop-shadow(0 0 12px rgba(56,189,248,0.75))' }}
              />
            </svg>

            <img
              src="/saturn-image.png"
              alt="Saturn Textiles Limited Research and Development Division"
              className="mx-auto block h-auto w-full object-contain drop-shadow-[0_0_35px_rgba(57,120,206,0.4)] drop-shadow-[0_0_35px_rgba(249,115,22,0.4)]"
              style={{
                mixBlendMode: 'lighten',
                filter: 'contrast(1.45) brightness(1.06) saturate(1.5) hue-rotate(16deg)',
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
)
