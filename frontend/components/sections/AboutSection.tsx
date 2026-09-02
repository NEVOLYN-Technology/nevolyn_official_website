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
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { fadeUpProps } from '@/lib/animations'
import { SectionHeader, GradText } from '@/components/ui/SectionHeader'

/**
 * About section presenting NEVOLYN Technology's mission, engineering pillars, and technical capabilities.
 *
 * @returns Rendered About section component
 */
export const AboutSection = (): JSX.Element => {
  return (
    <section id="about" className="py-20 sm:py-24 border-t border-sky-300/60 bg-[#deebf9] relative overflow-hidden">
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
          description="NEVOLYN Technology is an advanced engineering company. We research, build, and deploy production-ready industrial automation systems built to solve manufacturing challenges."
        />

        {/* ── 3 Action Pillars: Innovate · Automate · Elevate ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 sm:mb-20">

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

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
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

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
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

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Purpose & Operating Principles */}
          <motion.div
            {...fadeUpProps(0.2)}
            className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-slate-50/60 p-7 sm:p-9 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-700">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Our Purpose &amp; Operating Standards</h4>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1.5">
                    Our Mission
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    To build intelligent, dependable technology through rigorous engineering and applied AI research that solves physical manufacturing bottlenecks, improves throughput, and creates verifiable industrial value.
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block mb-1.5">
                    Our Vision
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    To establish NEVOLYN Technology as a premier deep-tech powerhouse recognized for transforming complex industrial problems into scalable, high-precision automated systems.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% In-House Hardware &amp; Software Design</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Engineered for Production Environments</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Core Technical Competencies */}
          <motion.div
            {...fadeUpProps(0.3)}
            className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-full bg-sky-500/15 flex items-center justify-center text-sky-700">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Core Engineering Disciplines</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-sky-50/40 hover:border-sky-200 transition-colors">
                  <span className="font-mono text-[11px] font-bold text-sky-600 block mb-1">01 / VISION</span>
                  <h5 className="text-sm font-bold text-slate-900 mb-1">Computer Vision</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Custom optical inspection rigs, defect classification, and real-time inference.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors">
                  <span className="font-mono text-[11px] font-bold text-emerald-600 block mb-1">02 / ROBOTICS</span>
                  <h5 className="text-sm font-bold text-slate-900 mb-1">Automation Systems</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Microcontroller controls, motor synchronization, and automated sorting hardware.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors">
                  <span className="font-mono text-[11px] font-bold text-indigo-600 block mb-1">03 / SOFTWARE</span>
                  <h5 className="text-sm font-bold text-slate-900 mb-1">Digital Platforms</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Java Spring Boot APIs, Next.js web applications, and live telemetry databases.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-purple-50/40 hover:border-purple-200 transition-colors">
                  <span className="font-mono text-[11px] font-bold text-purple-600 block mb-1">04 / R&amp;D</span>
                  <h5 className="text-sm font-bold text-slate-900 mb-1">Deep-Tech Products</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Original intellectual property, proprietary industrial machinery, and edge AI.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Engineered for enterprise production &amp; scale</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Continuous R&amp;D
              </span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
