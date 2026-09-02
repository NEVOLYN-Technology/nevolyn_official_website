/**
 * BrandWordmark — NEVOLYN Technology stacked logo lockup.
 *
 * Renders the brand icon followed by the stacked "NEVOLYN / Technology"
 * text wordmark in the Ethnocentric brand font. Used in both the Navbar
 * (small size) and the Footer (medium size) to ensure a consistent brand
 * identity without duplicating the markup.
 *
 * ## Sizes
 * - `"sm"` — compact navbar size (icon 36–40px, text 15–16px / 8.8–9.2px)
 * - `"md"` — footer size (icon 40–44px, text lg–xl / 10.5–11.5px)
 *
 * @module components/ui/BrandWordmark
 */
import type { JSX } from 'react'

/** Available size variants for the BrandWordmark component. */
export type BrandWordmarkSize = 'sm' | 'md'

interface BrandWordmarkProps {
  /** Size variant controlling icon and text dimensions. Defaults to "sm". */
  size?: BrandWordmarkSize
}

/**
 * Stacked "NEVOLYN / Technology" brand wordmark with icon.
 *
 * @param props.size - `"sm"` for navbar, `"md"` for footer
 * @returns Rendered brand wordmark (icon + stacked text)
 */
export function BrandWordmark({ size = 'sm' }: BrandWordmarkProps): JSX.Element {
  const isSmall = size === 'sm'

  return (
    <>
      {/* Brand Icon */}
      <img
        src="/nevolyn-icon.png"
        alt="NEVOLYN Technology"
        className={
          isSmall
            ? 'block h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-full drop-shadow-sm'
            : 'h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-full drop-shadow-sm'
        }
      />

      {/* Stacked Text Lockup */}
      <span className="flex flex-col justify-center leading-none">
        {/* Primary brand name in Ethnocentric typeface */}
        <span
          className={
            isSmall
              ? 'block font-brand text-[15px] sm:text-[16px] tracking-[0.16em] text-slate-900'
              : 'block font-brand text-lg sm:text-xl tracking-[0.16em] text-slate-900'
          }
        >
          NEVOLYN
        </span>

        {/* Sub-brand descriptor — same font, smaller size */}
        <span
          className={
            isSmall
              ? 'mt-1 block font-brand text-[8.8px] sm:text-[9.2px] uppercase tracking-[0.09em] text-slate-600'
              : 'mt-1.5 block font-brand text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.14em] text-slate-600'
          }
        >
          Technology
        </span>
      </span>
    </>
  )
}
