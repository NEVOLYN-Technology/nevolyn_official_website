/**
 * Hero section component — the primary landing view for NEVOLYN Technology.
 *
 * Cleanly proportioned two-column layout:
 * - **Left**: status pill, 3-color headline, subtitle paragraph, CTA buttons, trust badge
 * - **Right**: floating 3D presentation frame with the hero showcase image
 *
 * No data fetching — all content is static. To update copy, edit this file directly.
 *
 * @module components/sections/Hero
 */
'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { SECTION_BG } from '@/lib/constants/theme'

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
            className="lg:col-span-6 text-left"
          >
            {/* Status Pill — "ENGINEERING WHAT'S NEXT" live badge */}
            <StatusPill label="ENGINEERING WHAT'S NEXT" className="mb-5 px-5 py-2 text-sm font-semibold gap-2.5" />

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
              We build smart software and automation systems that help businesses work faster and smarter
            </p>

            {/* Social & CTA Action Buttons (Single line on both web and mobile) */}
            <div className="mt-6 flex items-center gap-1.5 min-[380px]:gap-2.5 sm:gap-3 max-w-full overflow-x-auto no-scrollbar py-1">
              <a
                href="https://www.linkedin.com/company/nevolyn/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NEVOLYN Technology on LinkedIn"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#0a66c2] bg-white border border-[#0a66c2]/25 shadow-sm hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              <a
                href="https://www.facebook.com/nevolyn/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NEVOLYN Technology on Facebook"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#1877f2] bg-white border border-[#1877f2]/25 shadow-sm hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>

              {/* Divider */}
              <span className="text-slate-300 text-sm sm:text-lg select-none shrink-0">|</span>

              <Link
                href="/join_us?from=home"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-emerald-300/80 sm:border-emerald-200 bg-emerald-50/90 px-3.5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-emerald-800 shadow-sm transition-all duration-200 hover:bg-emerald-100 hover:border-emerald-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <span>Join Our Team</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700" />
              </Link>
            </div>

            {/* Enterprise Trust Indicator Badge */}
            <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-blue-300/85 bg-blue-100/65 px-4.5 py-2 text-xs sm:text-sm font-medium text-slate-900 shadow-sm backdrop-blur-sm transition-all hover:bg-blue-100/85 hover:border-blue-400">
              <ShieldCheck className="h-4 w-4 text-blue-800 shrink-0" />
              <span>Enterprise-grade software engineering and automation solutions.</span>
            </div>
          </motion.div>

          {/* ── Right Column: Enlarged Edge-to-Edge Hero Showcase ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="relative lg:col-span-6 flex justify-center lg:justify-end w-full"
          >
            {/* Ambient Soft Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/25 via-indigo-400/20 to-emerald-400/20 blur-[80px] rounded-full pointer-events-none -z-10" />

            {/* Clean Presentation Frame - Edge-to-Edge flush fit */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className={`relative w-full max-w-[580px] sm:max-w-[620px] lg:max-w-[640px] aspect-[850/644] rounded-[2rem] border border-sky-300/60 ${SECTION_BG.heroCard} shadow-2xl shadow-sky-600/15 overflow-hidden flex items-center justify-center group`}
            >
              {/* Top Colorful Accent Beam */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400 z-10" />

              <img
                src="/nevolyn-image.png"
                alt="NEVOLYN Technology"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
