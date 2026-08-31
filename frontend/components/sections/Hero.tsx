/**
 * Hero section component — the primary landing view for NEVOLYN Technology.
 *
 * Cleanly proportioned layout with balanced typography and an empty
 * presentation card ready for /nevolyn-image.png.
 *
 * @module components/sections/Hero
 */
'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export const Hero = (): JSX.Element => {
  return (
    <section className="relative text-slate-900 overflow-hidden pt-14 sm:pt-16 lg:pt-18 pb-10 sm:pb-14">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 w-full">

          {/* ── Left Column: Headline, Description & CTAs ────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7 text-left"
          >
            {/* Status Pill with Emerald Accent - Bigger & Classy */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-5 py-2 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur-sm mb-5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="tracking-wide">Engineering What&apos;s Next</span>
            </div>

            {/* Headline with Balanced 3-Line, 3-Color Signature Structure */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold leading-[1.16] tracking-tight text-slate-900">
              <span className="block text-slate-900">Engineering the Future of</span>
              <span className="block bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                Intelligent Systems &amp;
              </span>
              <span className="block bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
                Industrial Automation
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
              From applied AI and machine learning to industrial automation and enterprise software, we engineer end-to-end technology solutions for complex challenges.
            </p>

            {/* CTAs with Matching Green Vibe & Pill Appearance */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/#innovations"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/90 bg-emerald-50/90 px-6 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition-all duration-200 hover:bg-emerald-100 hover:border-emerald-400 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <span>Explore Our Work</span>
                <ArrowRight className="h-4 w-4 text-emerald-700" />
              </Link>
              <Link
                href="/#leaders"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/70 px-6 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition-all duration-200 hover:bg-emerald-100 hover:border-emerald-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <span>Meet Our Team</span>
                <ArrowRight className="h-4 w-4 text-emerald-700" />
              </Link>
              <Link
                href="/join_us"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-6 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition-all duration-200 hover:bg-emerald-100 hover:border-emerald-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <span>Join Our Team</span>
                <ArrowRight className="h-4 w-4 text-emerald-700" />
              </Link>
            </div>

            {/* Enterprise Trust Indicator Badge - Darker Navy Blue */}
            <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-blue-300/85 bg-blue-100/65 px-4.5 py-2 text-xs sm:text-sm font-medium text-slate-900 shadow-sm backdrop-blur-sm transition-all hover:bg-blue-100/85 hover:border-blue-400">
              <ShieldCheck className="h-4 w-4 text-blue-800 shrink-0" />
              <span>Enterprise-grade software engineering and automation solutions.</span>
            </div>
          </motion.div>

          {/* ── Right Column: Clean Empty Box Ready for nevolyn-image.png ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="relative lg:col-span-5 flex justify-center w-full"
          >
            {/* Ambient Soft Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 via-indigo-400/15 to-emerald-400/15 blur-[80px] rounded-full pointer-events-none -z-10" />

            {/* Clean Empty Presentation Frame */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full max-w-[460px] sm:max-w-[490px] aspect-[4/3] rounded-[2rem] border border-slate-200/90 bg-white/85 p-3 sm:p-3.5 shadow-xl shadow-slate-300/25 backdrop-blur-xl transition-all overflow-hidden flex items-center justify-center"
            >
              {/* Top Colorful Accent Beam */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400 z-10" />

              {/* Inner Presentation Surface */}
              <div className="relative w-full h-full rounded-[1.6rem] bg-gradient-to-br from-slate-50/80 via-white to-sky-50/20 border border-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src="/nevolyn-image.png"
                  alt="NEVOLYN Technology"
                  className="w-full h-full object-contain rounded-[1.6rem] transition-transform duration-500 hover:scale-[1.02]"
                  onError={(e) => {
                    // Cleanly hide broken img icon until user pastes nevolyn-image.png
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
