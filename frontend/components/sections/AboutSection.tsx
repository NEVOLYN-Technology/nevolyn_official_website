/**
 * AboutSection — Core overview of NEVOLYN Technology.
 *
 * Articulates the company's operating principles ("Innovate. Automate. Elevate."),
 * engineering methodology, mission, vision, and core technical competencies.
 *
 * @module components/sections/AboutSection
 */
'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Globe,
  CheckCircle2,
  Code2,
  CircuitBoard,
  Eye,
  Cpu,
} from 'lucide-react'
import { fadeUpProps } from '@/lib/animations'
import { SectionHeader, GradText } from '@/components/ui/SectionHeader'
import { SECTION_BG } from '@/lib/constants/theme'

/**
 * About section presenting NEVOLYN Technology's mission, engineering pillars, and technical capabilities.
 *
 * @returns Rendered About section component
 */
export const AboutSection = (): JSX.Element => {
  return (
    <section id="about" className={`py-20 sm:py-24 ${SECTION_BG.border} ${SECTION_BG.alternate} relative overflow-hidden`}>
      {/* Anchor alias so any legacy references to #capabilities resolve smoothly */}
      <div id="capabilities" className="absolute -top-24 left-0" />

      {/* Subtle colorful ambient mesh */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-sky-400/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-2/3 -right-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ────────────────────────────────────────── */}
        <SectionHeader
          className="text-center mb-16 sm:mb-20"
          pillLabel="ABOUT NEVOLYN TECHNOLOGY"
          title={
            <>
              Innovate.{' '}
              <GradText variant="sky">Automate.</GradText>{' '}
              <GradText variant="emerald">Elevate.</GradText>
            </>
          }
          description="NEVOLYN builds software and web solutions, hardware solutions and automation solutions that help industries work faster, smarter, and more reliably."
        />

        {/* ── Mission, Vision & Core Technical Competencies ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* Left Column: Purpose, Mission & Vision */}
          <motion.div
            {...fadeUpProps(0.2)}
            className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-emerald-50/15 to-white p-4 sm:p-7 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden group"
          >
            {/* Ambient soft glow */}
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none group-hover:bg-emerald-400/15 transition-all duration-500" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 mb-5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-700 tracking-wider uppercase block mb-0.5">
                  Purpose &amp; Standards
                </span>
                <h4 className="text-[13px] min-[360px]:text-[14px] min-[390px]:text-[15.5px] sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  Our Purpose &amp; Operating Standards
                </h4>
              </div>
            </div>

            {/* Mission & Vision Cards (Spacious, elegant stacked layout matching web) */}
            <div className="flex-1 flex flex-col justify-between gap-4 py-1">
              {/* Mission */}
              <div className="flex-1 p-5 sm:p-5.5 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-emerald-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                      OUR MISSION
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <h5 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
                    Mission Statement
                  </h5>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    To deliver software and web solutions, hardware solutions, and AI-powered automation that remove bottlenecks and create measurable industrial value.
                  </p>
                </div>
                <div className="mt-3 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-md border border-emerald-100 w-fit">
                  Precision &bull; Throughput &bull; Value
                </div>
              </div>

              {/* Vision */}
              <div className="flex-1 p-5 sm:p-5.5 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-sky-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase">
                      OUR VISION
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  </div>
                  <h5 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
                    Long-Term Vision
                  </h5>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    To become a trusted leader in industrial automation, turning complex challenges into scalable, high-precision, AI-driven systems.
                  </p>
                </div>
                <div className="mt-3 text-[10px] sm:text-[11px] font-semibold text-sky-700 bg-sky-50/80 px-2.5 py-0.5 rounded-md border border-sky-100 w-fit">
                  Innovation &bull; Scalability &bull; Automation
                </div>
              </div>
            </div>

            {/* Bottom Accent Beam */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Engineering Discipline &amp; Quality
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-semibold">
                NEVOLYN &bull; STANDARDS
              </span>
            </div>
          </motion.div>

          {/* Right Column: 4 Core Disciplines */}
          <motion.div
            {...fadeUpProps(0.3)}
            className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-sky-50/15 to-white p-4 sm:p-7 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden group"
          >
            {/* Ambient soft glow */}
            <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-sky-400/10 blur-3xl pointer-events-none group-hover:bg-sky-400/15 transition-all duration-500" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 mb-5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-sky-700 tracking-wider uppercase block mb-0.5">
                  Engineering Disciplines
                </span>
                <h4 className="text-[13px] min-[360px]:text-[14px] min-[390px]:text-[15.5px] sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  Core Engineering Disciplines
                </h4>
              </div>
            </div>

            {/* 4 Disciplines Grid (Spacious responsive layout matching web view) */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 h-full">
                {/* 01: Vision & AI */}
                <div className="p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group/card">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase">
                        VISION &amp; AI
                      </span>
                      <Eye className="w-4 h-4 text-sky-500 group-hover/card:scale-110 transition-transform shrink-0" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 mb-1">
                      AI &amp; Computer Vision
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      AI systems that see, learn, and decide, like spotting defects automatically from camera images.
                    </p>
                  </div>
                  <div className="text-[10px] font-semibold text-sky-700 bg-sky-50/80 px-2.5 py-1 rounded-md border border-sky-100 w-fit">
                    Computer Vision &bull; Machine Learning
                  </div>
                </div>

                {/* 02: Hardware */}
                <div className="p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group/card">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                        HARDWARE
                      </span>
                      <CircuitBoard className="w-4 h-4 text-emerald-500 group-hover/card:scale-110 transition-transform shrink-0" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 mb-1">
                      Hardware Solutions
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      Machines and control electronics, from sensors and microcontrollers to PLC-based automatic sorting.
                    </p>
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-100 w-fit">
                    PLCs &bull; Robotics &bull; Mechatronics
                  </div>
                </div>

                {/* 03: Software */}
                <div className="p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group/card">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                        SOFTWARE
                      </span>
                      <Code2 className="w-4 h-4 text-indigo-500 group-hover/card:scale-110 transition-transform shrink-0" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 mb-1">
                      Software &amp; Web Solutions
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      Websites, web apps, and backend systems that run your business online, hosted in the cloud.
                    </p>
                  </div>
                  <div className="text-[10px] font-semibold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-100 w-fit">
                    Full-Stack Web &bull; APIs &bull; Cloud
                  </div>
                </div>

                {/* 04: Turnkey R&D */}
                <div className="p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-purple-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group/card">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase">
                        AUTOMATION
                      </span>
                      <Cpu className="w-4 h-4 text-purple-500 group-hover/card:scale-110 transition-transform shrink-0" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 mb-1">
                      Industrial Automation
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      Automated systems for factories that cut manual work and speed up production.
                    </p>
                  </div>
                  <div className="text-[10px] font-semibold text-purple-700 bg-purple-50/80 px-2.5 py-1 rounded-md border border-purple-100 w-fit">
                    Factory Automation &bull; Custom Machines
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Capability Badges — strictly 1 row across all screen sizes */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full">
              <span className="px-1.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 shadow-2xs min-w-0">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[8.5px] min-[380px]:text-[9.5px] min-[420px]:text-[10.5px] sm:text-xs font-semibold leading-tight text-center sm:text-left break-words">
                  AI Automation
                </span>
              </span>
              <span className="px-1.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-sky-50 text-sky-700 border border-sky-200/70 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 shadow-2xs min-w-0">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
                <span className="text-[8.5px] min-[380px]:text-[9.5px] min-[420px]:text-[10.5px] sm:text-xs font-semibold leading-tight text-center sm:text-left break-words">
                  Software Automation
                </span>
              </span>
              <span className="px-1.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 shadow-2xs min-w-0">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-600 shrink-0" />
                <span className="text-[8.5px] min-[380px]:text-[9.5px] min-[420px]:text-[10.5px] sm:text-xs font-semibold leading-tight text-center sm:text-left break-words">
                  Hardware Automation
                </span>
              </span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
