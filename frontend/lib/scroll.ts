'use client'

/**
 * SCROLL BEHAVIOUR — shared smooth-scrolling and scroll-spy for the one-page site.
 * Follows the proven FABINS architecture.
 *
 * If the header height changes, update `HEADER_OFFSET_PX` below AND the matching
 * `scroll-padding-top` in `app/globals.css`.
 */

import { useEffect, useState } from 'react'

/**
 * Height reserved for the fixed navbar, in pixels.
 * A section scrolled to with `scrollToSection` stops this far from the top so
 * its heading clears the header instead of hiding behind it.
 */
export const HEADER_OFFSET_PX = 96

/**
 * How far down the viewport the scroll-spy probe sits, in pixels.
 * A section counts as "active" once it has passed this line.
 */
const SPY_PROBE_OFFSET_PX = 200

/** Scroll distance, in pixels, after which the navbar switches to its scrolled style. */
const SCROLLED_THRESHOLD_PX = 16

/**
 * Smoothly scrolls to a section by its DOM `id`, accounting for the fixed header.
 *
 * @param sectionId - The `id` of a `<section>` on the page, or `'home'` to
 *                    return to the very top of the document.
 */
export function scrollToSection(sectionId: string): void {
  if (sectionId === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const element = document.getElementById(sectionId)
  if (!element) return

  // getBoundingClientRect() is viewport-relative, so add the current scroll
  // position to convert it to a document-absolute coordinate.
  const targetTop = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX

  window.scrollTo({ top: targetTop, behavior: 'smooth' })
}

/**
 * Tracks which section the visitor is currently looking at, for navbar highlighting.
 * Walks the given ids from last to first and returns the first one whose top
 * edge has already passed the probe line.
 *
 * @param sectionIds - Section ids in top-to-bottom order.
 * @returns The id of the active section. Defaults to the first id.
 */
export function useActiveSection(sectionIds: readonly string[]): string {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const probeLine = window.scrollY + SPY_PROBE_OFFSET_PX
          let current = sectionIds[0] ?? ''

          for (let i = sectionIds.length - 1; i >= 0; i--) {
            const element = document.getElementById(sectionIds[i])
            if (!element) continue

            const elementTop = element.getBoundingClientRect().top + window.scrollY
            if (elementTop <= probeLine) {
              current = sectionIds[i]
              break
            }
          }

          setActiveSection((prev) => (prev !== current ? current : prev))
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Run once so the correct link is highlighted on first paint.

    return () => window.removeEventListener('scroll', handleScroll)
  }, [sectionIds])

  return activeSection
}

/**
 * Returns `true` once the page has been scrolled past `SCROLLED_THRESHOLD_PX`.
 */
export function useIsScrolled(): boolean {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled((prev) => {
            const next = window.scrollY > SCROLLED_THRESHOLD_PX
            return prev !== next ? next : prev
          })
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return isScrolled
}
