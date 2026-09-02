/**
 * MarqueeTicker — Interactive infinite scrolling banner.
 *
 * Auto-scrolls smoothly at a relaxed speed.
 * When hovered, auto-scroll pauses and users can manually drag or wheel-scroll
 * horizontally left or right.
 *
 * @module components/sections/MarqueeTicker
 */
'use client'

import type { JSX } from 'react'
import { useRef, useEffect, useState } from 'react'

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

export const MarqueeTicker = (): JSX.Element => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isHoveredRef = useRef(false)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startScrollLeftRef = useRef(0)
  const [isGrabbing, setIsGrabbing] = useState(false)

  // Duplicate items 4 times for an uninterrupted continuous loop
  const duplicatedItems = [
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
  ]

  // Continuous auto-scroll loop with requestAnimationFrame
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let animId: number

    const tick = () => {
      if (!isHoveredRef.current && !isDraggingRef.current && el) {
        el.scrollLeft += 1.4 // Balanced, brisk glide speed

        // Seamless wrap-around when scrolled past half of duplicated content
        const halfWidth = el.scrollWidth / 2
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth
        }
      }
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    isDraggingRef.current = true
    setIsGrabbing(true)
    startXRef.current = e.pageX - el.offsetLeft
    startScrollLeftRef.current = el.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const el = scrollRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startXRef.current) * 1.3
    el.scrollLeft = startScrollLeftRef.current - walk

    // Wrap check during drag
    const halfWidth = el.scrollWidth / 2
    if (el.scrollLeft >= halfWidth) {
      el.scrollLeft -= halfWidth
      startScrollLeftRef.current -= halfWidth
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += halfWidth
      startScrollLeftRef.current += halfWidth
    }
  }

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
    setIsGrabbing(false)
  }

  // Wheel horizontal scroll on trackpad/mouse
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX

    const halfWidth = el.scrollWidth / 2
    if (el.scrollLeft >= halfWidth) {
      el.scrollLeft -= halfWidth
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += halfWidth
    }
  }

  return (
    <div
      className="relative w-full border-y border-sky-300/70 bg-[#c9ddf3]/95 backdrop-blur-md overflow-hidden py-3.5 sm:py-4 select-none"
      onMouseEnter={() => {
        isHoveredRef.current = true
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false
        handleMouseUpOrLeave()
      }}
    >
      {/* Left and Right Edge Fade Gradients */}
      <div className="absolute left-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-r from-[#e4ebf2] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-l from-[#e4ebf2] to-transparent pointer-events-none z-10" />

      {/* Interactive Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onWheel={handleWheel}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={`flex items-center overflow-x-auto whitespace-nowrap scroll-smooth cursor-grab ${isGrabbing ? 'cursor-grabbing select-none' : ''
          }`}
      >
        {duplicatedItems.map((item, idx) => (
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
    </div>
  )
}
