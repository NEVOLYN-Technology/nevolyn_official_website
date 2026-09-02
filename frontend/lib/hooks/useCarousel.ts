/**
 * useCarousel.ts — Custom hook encapsulating all 3D snap-scroll carousel logic.
 *
 * Both `InnovationsSection` and `LatestNewsSection` use an identical scroll
 * detection + center tracking + smooth navigation pattern. This hook extracts
 * that shared logic so neither section file needs to re-implement it.
 *
 * ## Usage
 * ```tsx
 * const { scrollContainerRef, safeCenteredIndex, handlePrev, handleNext, scrollToCard } =
 *   useCarousel(items, 'data-card-index')
 *
 * // Attach ref to the scroll container:
 * <div ref={scrollContainerRef}>
 *   {items.map((item, idx) => (
 *     <div data-card-index={idx} onClick={() => scrollToCard(idx)}>
 *       ...
 *     </div>
 *   ))}
 * </div>
 * ```
 *
 * @module lib/hooks/useCarousel
 */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

/** Return shape of the `useCarousel` hook. */
export interface UseCarouselReturn {
  /** Ref to attach to the horizontally scrollable container element */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  /** Raw centered card index as detected by the scroll listener */
  centeredIndex: number
  /**
   * Safe clamped index — always within [0, items.length - 1].
   * Use this for conditional styling and navigation math.
   */
  safeCenteredIndex: number
  /** Scroll to the previous card (wraps around) */
  handlePrev: () => void
  /** Scroll to the next card (wraps around) */
  handleNext: () => void
  /**
   * Smooth-scroll the container so the card at `index` is centered.
   * @param index - Zero-based index of the target card
   */
  scrollToCard: (index: number) => void
}

/**
 * Manages scroll position tracking, centered-card detection, and navigation
 * for a horizontal snap-scroll 3D carousel.
 *
 * @param itemCount - Total number of cards in the carousel (used for wrap-around math)
 * @param dataAttribute - The `data-*` attribute name used to identify card elements
 *   (e.g., `'data-card-index'` or `'data-news-index'`). Must match what you put on each card div.
 * @returns Carousel state and control callbacks — spread them onto your markup.
 */
export function useCarousel(itemCount: number, dataAttribute: string): UseCarouselReturn {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [centeredIndex, setCenteredIndex] = useState(0)

  // ── Scroll detection: find the card closest to the container center ──────
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const containerCenter = container.scrollLeft + container.clientWidth / 2
    let minDistance = Infinity
    let closestIndex = 0

    const cards = container.querySelectorAll<HTMLElement>(`[${dataAttribute}]`)
    cards.forEach((card) => {
      const cardIndex = Number(card.getAttribute(dataAttribute))
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(containerCenter - cardCenter)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = cardIndex
      }
    })

    setCenteredIndex(closestIndex)
  }, [dataAttribute])

  // ── Smooth scroll a specific card into the center ────────────────────────
  const scrollToCard = useCallback(
    (index: number) => {
      const container = scrollContainerRef.current
      if (!container) return
      const cards = container.querySelectorAll<HTMLElement>(`[${dataAttribute}]`)
      const target = cards[index]
      if (target) {
        const targetLeft =
          target.offsetLeft - container.clientWidth / 2 + target.offsetWidth / 2
        container.scrollTo({ left: targetLeft, behavior: 'smooth' })
      }
    },
    [dataAttribute]
  )

  // ── Attach / detach the passive scroll listener ───────────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Compute initial centered index on mount
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll, itemCount])

  // ── Clamp: guard against stale index after filtering ─────────────────────
  const safeCenteredIndex = Math.min(
    Math.max(0, centeredIndex),
    Math.max(0, itemCount - 1)
  )

  // ── Prev / Next with wrap-around ──────────────────────────────────────────
  const handlePrev = useCallback(() => {
    const prevIndex =
      safeCenteredIndex > 0 ? safeCenteredIndex - 1 : itemCount - 1
    scrollToCard(prevIndex)
  }, [safeCenteredIndex, itemCount, scrollToCard])

  const handleNext = useCallback(() => {
    const nextIndex =
      safeCenteredIndex < itemCount - 1 ? safeCenteredIndex + 1 : 0
    scrollToCard(nextIndex)
  }, [safeCenteredIndex, itemCount, scrollToCard])

  return {
    scrollContainerRef,
    centeredIndex,
    safeCenteredIndex,
    handlePrev,
    handleNext,
    scrollToCard,
  }
}
