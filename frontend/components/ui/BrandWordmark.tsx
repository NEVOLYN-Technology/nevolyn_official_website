/**
 * BrandWordmark — NEVOLYN brand wordmark lockup.
 *
 * Renders the brand icon followed by the "NEVOLYN" text wordmark in the
 * Ethnocentric brand font. Used in both the Navbar (sm) and Footer (md).
 *
 * ## Sizes
 * - `"sm"` — navbar size (icon 36–40px, text scaled vertically)
 * - `"md"` — footer size (icon 44–48px, text scaled vertically)
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
 * "NEVOLYN" brand wordmark with icon.
 *
 * @param props.size - `"sm"` for navbar, `"md"` for footer
 * @returns Rendered brand wordmark (icon + vertically enlarged NEVOLYN text)
 */
export function BrandWordmark({ size = 'sm' }: BrandWordmarkProps): JSX.Element {
  const isSmall = size === 'sm'

  return (
    <>
      {/* Brand Icon */}
      <img
        src="/nevolyn-icon.png"
        alt="NEVOLYN"
        className={
          isSmall
            ? 'block h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-sm'
            : 'block h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-sm'
        }
      />

      {/* Primary brand name in Ethnocentric typeface */}
      <span
        className={
          isSmall
            ? 'block font-brand text-[13px] sm:text-[14px] tracking-[0.14em] text-slate-900 scale-y-110 origin-left select-none leading-none'
            : 'block font-brand text-[16px] sm:text-[18px] tracking-[0.14em] text-slate-900 scale-y-110 origin-left select-none leading-none'
        }
      >
        NEVOLYN
      </span>
    </>
  )
}

