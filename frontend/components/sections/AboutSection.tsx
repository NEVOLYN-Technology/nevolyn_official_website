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
  Cpu,
  Bot,
  Layers,
  Target,
  Globe,
  CheckCircle2,
  Code2,
  CircuitBoard,
  Eye,
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
          description="NEVOLYN is an advanced engineering company. We research, develop, and deploy production-ready software solutions and hardware automation systems built to solve complex industrial and technical challenges."
        />

        {/* ── 3 Action Pillars: Innovate · Automate · Elevate (1 col on mobile & vertical iPad, 3 cols on rotated iPad & web) ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 sm:mb-20">

          {/* Pillar 1: Innovate */}
          <motion.div
            {...fadeUpProps(0.15)}
            className="group relative rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-sky-50/20 to-white p-7 sm:p-8 shadow-sm transition-all duration-300 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 rounded-2xl border border-sky-200 bg-sky-50 flex items-center justify-center text-sky-600 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-sky-400/20">
                  <Cpu className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 uppercase tracking-wider">
                  01 / Innovate
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">
                Applied AI &amp; Edge Vision
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6 text-justify">
                Translating computer vision and deep learning models into optimized, real-time edge algorithms. We emphasize field accuracy, low latency, and efficient computation on embedded hardware.
              </p>
            </div>

            <div className="pt-5 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Custom optical defect classification (FABINS)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Sub-second inference on embedded GPU accelerators</span>
              </div>
            </div>
          </motion.div>

          {/* Pillar 2: Automate */}
          <motion.div
            {...fadeUpProps(0.25)}
            className="group relative rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-emerald-50/20 to-white p-7 sm:p-8 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-emerald-400/20">
                  <Bot className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                  02 / Automate
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                Industrial Automation &amp; Robotics
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6 text-justify">
                Designing automated inspection machinery, sensor telemetry, and embedded control hardware that replace manual bottleneck processes with continuous, reliable industrial operation.
              </p>
            </div>

            <div className="pt-5 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Automated quality control &amp; industrial sorting</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Microcontroller, PLC, and sensor-rig integration</span>
              </div>
            </div>
          </motion.div>

          {/* Pillar 3: Elevate */}
          <motion.div
            {...fadeUpProps(0.35)}
            className="group relative rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-indigo-50/20 to-white p-7 sm:p-8 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 rounded-2xl border border-indigo-200 bg-indigo-50 flex items-center justify-center text-indigo-600 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-indigo-400/20">
                  <Layers className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 uppercase tracking-wider">
                  03 / Elevate
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                Enterprise Digital Systems
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6 text-justify">
                Architecting resilient full-stack platforms, distributed backend services, and real-time operational telemetry dashboards that turn shop-floor sensor signals into strategic decision-making.
              </p>
            </div>

            <div className="pt-5 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Scalable Spring Boot &amp; TypeScript architectures</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Auditable industrial data pipelines &amp; live dashboards</span>
              </div>
            </div>
          </motion.div>

        </div>

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

            {/* Mission & Vision Cards (Equal size, vertically balanced with zero empty space) */}
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
                    To engineer intelligent software and hardware automation that eliminates operational bottlenecks, accelerates throughput, and creates verifiable industrial value.
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
                    To establish NEVOLYN as a premier deep-tech powerhouse recognized for transforming complex industrial challenges into scalable, high-precision automated systems.
                  </p>
                </div>
                <div className="mt-3 text-[10px] sm:text-[11px] font-semibold text-sky-700 bg-sky-50/80 px-2.5 py-0.5 rounded-md border border-sky-100 w-fit">
                  Deep-Tech &bull; Scalability &bull; Automation
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Core Engineering Disciplines */}
          <motion.div
            {...fadeUpProps(0.3)}
            className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-sky-50/15 to-white p-4 sm:p-7 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden group"
          >
            {/* Ambient soft glow */}
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-sky-400/10 blur-3xl pointer-events-none group-hover:bg-sky-400/15 transition-all duration-500" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 mb-5 sm:mb-6 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold text-sky-700 tracking-wider uppercase block mb-0.5">
                    Engineering Disciplines
                  </span>
                  <h4 className="text-[14px] min-[380px]:text-[15.5px] sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                    Core Engineering Disciplines
                  </h4>
                </div>
              </div>

              {/* 4 Rich Disciplines Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {/* 01: Vision */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group/card">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase">
                        01 / VISION &amp; AI
                      </span>
                      <Eye className="w-4 h-4 text-sky-500 group-hover/card:scale-110 transition-transform" />
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                      Computer Vision
                    </h5>
                    <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed mb-3">
                      Custom optical inspection rigs, defect classification, and real-time inference algorithms.
                    </p>
                  </div>
                  <div className="text-[10px] font-semibold text-sky-700 bg-sky-50/80 px-2 py-0.5 rounded-md border border-sky-100 w-fit">
                    Optical Rigs &bull; Edge Inference
                  </div>
                </div>

                {/* 02: Hardware Automation */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group/card">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                        02 / HARDWARE
                      </span>
                      <CircuitBoard className="w-4 h-4 text-emerald-500 group-hover/card:scale-110 transition-transform" />
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                      Automation Systems
                    </h5>
                    <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed mb-3">
                      Microcontroller controls, motor synchronization, PLC logic, and automated sorting hardware.
                    </p>
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100 w-fit">
                    PLCs &bull; Robotics &bull; Mechatronics
                  </div>
                </div>

                {/* 03: Software */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group/card">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                        03 / SOFTWARE
                      </span>
                      <Code2 className="w-4 h-4 text-indigo-500 group-hover/card:scale-110 transition-transform" />
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                      Digital Platforms
                    </h5>
                    <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed mb-3">
                      Java Spring Boot APIs, Next.js web applications, cloud infrastructure, and live telemetry databases.
                    </p>
                  </div>
                  <div className="text-[10px] font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100 w-fit">
                    Full-Stack Web &bull; APIs &bull; Cloud
                  </div>
                </div>

                {/* 04: Turnkey R&D */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white/95 hover:border-purple-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group/card">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase">
                        04 / R&amp;D
                      </span>
                      <Cpu className="w-4 h-4 text-purple-500 group-hover/card:scale-110 transition-transform" />
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                      Deep-Tech Products
                    </h5>
                    <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed mb-3">
                      Original intellectual property, proprietary industrial machinery, custom sensor rigs, and edge AI.
                    </p>
                  </div>
                  <div className="text-[10px] font-semibold text-purple-700 bg-purple-50/80 px-2 py-0.5 rounded-md border border-purple-100 w-fit">
                    Proprietary Machinery &bull; Edge AI
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Capability Badges — strictly 1 row across all screen sizes */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full">
              <span className="px-1.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 shadow-2xs min-w-0">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[8.5px] min-[380px]:text-[9.5px] min-[420px]:text-[10.5px] sm:text-xs font-semibold leading-tight text-center sm:text-left break-words">
                  Hardware Automation
                </span>
              </span>
              <span className="px-1.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-sky-50 text-sky-700 border border-sky-200/70 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 shadow-2xs min-w-0">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
                <span className="text-[8.5px] min-[380px]:text-[9.5px] min-[420px]:text-[10.5px] sm:text-xs font-semibold leading-tight text-center sm:text-left break-words">
                  Enterprise Software
                </span>
              </span>
              <span className="px-1.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 shadow-2xs min-w-0">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-600 shrink-0" />
                <span className="text-[8.5px] min-[380px]:text-[9.5px] min-[420px]:text-[10.5px] sm:text-xs font-semibold leading-tight text-center sm:text-left break-words">
                  Applied AI Research
                </span>
              </span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
