/**
 * MarqueeTicker — Hardware-accelerated infinite scrolling announcement banner.
 *
 * Runs on the GPU compositor thread via CSS keyframe animation for butter-smooth,
 * continuous glide across all browsers and devices without freezing or touch-locking.
 *
 * @module components/sections/MarqueeTicker
 */
import type { JSX } from 'react'
import { SECTION_BG } from '@/lib/constants/theme'

interface TickerItem {
  tag: string
  tagColor: string
  dotColor: string
  text: string
}

const TICKER_ITEMS: TickerItem[] = [
  {
    tag: 'WELCOME',
    tagColor: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/80',
    dotColor: 'bg-emerald-500',
    text: 'WELCOME TO THE HORIZON OF NEXT-GENERATION INDUSTRIAL AUTOMATION & INNOVATION',
  },
  {
    tag: 'ANNOUNCEMENT',
    tagColor: 'bg-sky-100/90 text-sky-800 border-sky-300/80',
    dotColor: 'bg-sky-500',
    text: 'FABINS IS COMING SOON — NEXT-GENERATION AI FABRIC INSPECTION SYSTEM',
  },
  {
    tag: 'RETROFIT SOLUTION',
    tagColor: 'bg-teal-100/90 text-teal-800 border-teal-300/80',
    dotColor: 'bg-teal-500',
    text: 'FABINS IS AN INDUSTRIAL RETROFIT SOLUTION FOR EXISTING TEXTILE MACHINERY, NOT A REPLACEMENT',
  },
  {
    tag: 'PILOT PROGRAM',
    tagColor: 'bg-indigo-100/90 text-indigo-800 border-indigo-300/80',
    dotColor: 'bg-indigo-500',
    text: 'NOW ACCEPTING ENTERPRISE PILOTS & INDUSTRIAL DEMONSTRATION INQUIRIES',
  },
]

function TickerGroup({ ariaHidden }: { ariaHidden?: boolean }): JSX.Element {
  return (
    <div
      className="flex items-center shrink-0"
      aria-hidden={ariaHidden ? 'true' : undefined}
    >
      {TICKER_ITEMS.map((item, idx) => (
        <div key={idx} className="inline-flex items-center shrink-0">
          {/* Pill Tag */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider mr-3.5 border shadow-xs ${item.tagColor}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${item.dotColor}`} />
            {item.tag}
          </span>

          {/* Slogan / Announcement Text */}
          <span className="font-mono text-xs sm:text-sm font-extrabold tracking-[0.14em] text-slate-800 uppercase hover:text-emerald-700 transition-colors">
            {item.text}
          </span>

          {/* Glowing Accent Separator */}
          <span className="mx-8 sm:mx-12 inline-flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          </span>
        </div>
      ))}
    </div>
  )
}

export const MarqueeTicker = (): JSX.Element => {
  return (
    <div
      className={`relative w-full border-y border-sky-300/70 ${SECTION_BG.ticker}/95 backdrop-blur-md overflow-hidden py-3.5 sm:py-4 select-none`}
    >
      {/* Left and Right Edge Fade Gradients */}
      <div className="absolute left-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-r from-[#e4ebf2] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-l from-[#e4ebf2] to-transparent pointer-events-none z-10" />

      {/* Hardware-accelerated continuous scrolling track */}
      <div className="animate-marquee flex items-center">
        <TickerGroup />
        <TickerGroup ariaHidden />
      </div>
    </div>
  )
}
