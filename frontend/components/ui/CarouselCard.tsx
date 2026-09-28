/**
 * CarouselCard — 3D snap-scroll card shell for horizontal carousels.
 *
 * Renders the outer gradient-border wrapper and the inner white card surface
 * shared by both `InnovationsSection` and `LatestNewsSection`. The visual
 * "active / inactive" 3D effect (scale, opacity, gradient border) is
 * controlled by the `isCenter` prop.
 *
 * Performance-tuned for mobile: avoids heavy real-time CSS Gaussian blurs on phones,
 * ensuring smooth 60fps/120fps hardware-accelerated carousel scrolling.
 *
 * @module components/ui/CarouselCard
 *
 * @example
 * <CarouselCard
 *   isCenter={idx === safeCenteredIndex}
 *   image={project.image}
 *   onClick={() => scrollToCard(idx)}
 *   data-card-index={idx}
 * >
 *   <h3>{project.title}</h3>
 *   ...
 * </CarouselCard>
 */
import type { JSX, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CarouselCardProps {
  /** Whether this card is the currently centered (active) card in the carousel. */
  isCenter: boolean
  /** Optional image URL for a full-bleed banner at the top of the card. */
  image?: string
  /** Image alt text — required when `image` is provided for accessibility. */
  imageAlt?: string
  /** Click handler — typically calls `scrollToCard(idx)`. */
  onClick?: () => void
  /** Inner card content (category chips, title, description, tech stack, footer). */
  children: ReactNode
  /** data-* attribute string applied to the outer element for scroll detection. */
  dataIndex?: number
  /** data attribute name (e.g., "data-card-index" or "data-news-index"). */
  dataAttr?: string
}

/**
 * Outer gradient-border + inner white card shell for the horizontal 3D carousel.
 *
 * Handles all active/inactive visual state styling so individual section files
 * only need to define what goes *inside* each card.
 *
 * @param props.isCenter - Active state (gradient border, raised scale, sharp opacity)
 * @param props.image - Optional banner image URL
 * @param props.imageAlt - Alt text for image
 * @param props.onClick - Click handler (usually scrollToCard)
 * @param props.children - Card body content
 * @param props.dataIndex - Numeric index written to the data attribute
 * @param props.dataAttr - Name of the data attribute used by the scroll detector
 * @returns Rendered carousel card shell
 */
export function CarouselCard({
  isCenter,
  image,
  imageAlt = '',
  onClick,
  children,
  dataIndex,
  dataAttr = 'data-card-index',
}: CarouselCardProps): JSX.Element {
  // Build the data attribute object dynamically so we can spread it below
  const dataProps = dataIndex !== undefined ? { [dataAttr]: dataIndex } : {}

  return (
    <div
      {...dataProps}
      onClick={onClick}
      className={cn(
        // ── Fixed card size and snap behavior ──────────────────────────────
        'snap-center shrink-0 w-[300px] sm:w-[420px] lg:w-[460px]',
        'p-[1.5px] rounded-[26px] sm:rounded-[28px] transition-all duration-400 ease-out cursor-pointer group transform-gpu will-change-transform',
        // ── Active: gradient border, elevated, full opacity ─────────
        isCenter
          ? 'bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-500 shadow-[0_12px_30px_rgba(56,189,248,0.22)] sm:shadow-[0_20px_50px_rgba(56,189,248,0.25),0_0_25px_rgba(99,102,241,0.15)] -translate-y-2 sm:-translate-y-3 scale-[1.02] sm:scale-105 opacity-100 z-20'
          // ── Inactive: muted border, lowered, lightweight blur on desktop only ──
          : 'bg-slate-300/70 shadow-sm sm:shadow-lg shadow-slate-400/20 translate-y-1 sm:translate-y-2 scale-95 opacity-60 sm:opacity-50 z-10 sm:blur-[1.5px] blur-none hover:opacity-85 hover:blur-none'
      )}
    >
      {/* ── Inner card surface ─────────────────────────────────────── */}
      <div className="relative w-full h-full p-5 sm:p-7 rounded-[24px] sm:rounded-[26px] bg-white text-slate-900 shadow-sm flex flex-col justify-between overflow-hidden">

        {/* Subtle radial ambient glow in the top-right corner */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_55%)] pointer-events-none" />

        {/* Top accent beam — glowing when active, muted when inactive */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl transition-all duration-400',
            isCenter
              ? 'bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
              : 'bg-slate-200'
          )}
        />

        {/* Optional full-bleed image banner at the top */}
        {image && (
          <div className="mb-4 sm:mb-5 -mx-5 -mt-5 sm:-mx-7 sm:-mt-7 overflow-hidden relative h-36 sm:h-40 rounded-t-[23px] sm:rounded-t-[24px] border-b border-slate-200">
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient overlay fading the image into the white card surface */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Card content provided by the caller */}
        {children}
      </div>
    </div>
  )
}
