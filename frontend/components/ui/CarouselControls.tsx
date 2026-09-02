/**
 * CarouselControls — Navigation arrows and dot indicators for horizontal carousels.
 *
 * Both `InnovationsSection` and `LatestNewsSection` use the same Prev/Next arrow
 * buttons and dot navigation row. Extracting them here removes duplicate markup
 * and keeps carousel navigation styling consistent across the site.
 *
 * ## Exports
 * - `CarouselArrows` — floating Prev/Next chevron buttons (absolutely positioned)
 * - `CarouselDots` — centered row of clickable dot indicators
 *
 * @module components/ui/CarouselControls
 */
import type { JSX } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── CarouselArrows ───────────────────────────────────────────────────────────

interface CarouselArrowsProps {
  /** Callback fired when the user clicks the "previous" button. */
  onPrev: () => void
  /** Callback fired when the user clicks the "next" button. */
  onNext: () => void
  /** Accessible label for the previous button. Defaults to "Previous". */
  prevLabel?: string
  /** Accessible label for the next button. Defaults to "Next". */
  nextLabel?: string
}

/**
 * Pair of absolutely-positioned Prev/Next chevron navigation buttons.
 *
 * Must be rendered inside a `position: relative` parent so the `absolute`
 * positioning resolves correctly (the carousel stage wrapper already provides this).
 *
 * @param props.onPrev - Previous click handler
 * @param props.onNext - Next click handler
 * @param props.prevLabel - aria-label for the prev button
 * @param props.nextLabel - aria-label for the next button
 * @returns Rendered prev/next button pair
 */
export function CarouselArrows({
  onPrev,
  onNext,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}: CarouselArrowsProps): JSX.Element {
  // Shared button styles — white frosted pill, sky hover gradient
  const btnClass =
    'absolute top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-white/95 border border-slate-200 backdrop-blur-xl text-slate-700 hover:bg-gradient-to-r hover:from-sky-400 hover:to-blue-500 hover:border-transparent hover:text-white hover:-translate-y-1/2 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg shadow-slate-400/20 cursor-pointer group'

  return (
    <>
      <button
        onClick={onPrev}
        aria-label={prevLabel}
        className={cn(btnClass, 'left-2 sm:left-6')}
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={onNext}
        aria-label={nextLabel}
        className={cn(btnClass, 'right-2 sm:right-6')}
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </>
  )
}

// ── CarouselDots ─────────────────────────────────────────────────────────────

interface CarouselDotsProps {
  /** Total number of dots to render (one per carousel item). */
  count: number
  /** Zero-based index of the currently active (selected) dot. */
  activeIndex: number
  /** Callback fired with the target index when a dot is clicked. */
  onDotClick: (index: number) => void
  /** Prefix for aria-labels (e.g., "project" → "Go to project 1"). Defaults to "item". */
  itemLabel?: string
}

/**
 * Centered row of clickable dot indicators for a horizontal carousel.
 * The active dot expands into a wider pill with a sky-blue gradient glow.
 *
 * @param props.count - Number of dots
 * @param props.activeIndex - Currently active dot index
 * @param props.onDotClick - Click handler receiving the target index
 * @param props.itemLabel - Noun used in aria-labels (e.g., "project", "milestone")
 * @returns Rendered dot navigation row
 */
export function CarouselDots({
  count,
  activeIndex,
  onDotClick,
  itemLabel = 'item',
}: CarouselDotsProps): JSX.Element {
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Go to ${itemLabel} ${i + 1}`}
          className={cn(
            'h-2.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-125',
            i === activeIndex
              ? 'w-8 bg-gradient-to-r from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.45)]'
              : 'w-2.5 bg-slate-300 hover:bg-sky-400'
          )}
        />
      ))}
    </div>
  )
}
