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
export type BrandWordmarkSize = 'sm' | 'md' | 'lg'

interface BrandWordmarkProps {
  /** Size variant controlling icon and text dimensions. Defaults to "sm". */
  size?: BrandWordmarkSize
  /** Optional additional CSS classes for the text. */
  textClassName?: string
  /** Optional additional CSS classes for the icon. */
  iconClassName?: string
  /** Whether to render the tagline ("Engineering What's Next") spanning the exact width of the wordmark. */
  withTagline?: boolean
}

/**
 * "NEVOLYN" brand wordmark with icon.
 *
 * @param props.size - `"sm"` for navbar, `"md"` for standard, `"lg"` for prominent footer
 * @param props.withTagline - whether to include the tagline directly under the wordmark
 * @returns Rendered brand wordmark
 */
export function BrandWordmark({
  size = 'sm',
  textClassName = '',
  iconClassName = '',
  withTagline = false,
}: BrandWordmarkProps): JSX.Element {
  const iconClasses = {
    sm: 'h-7 w-7 sm:h-8 sm:w-8',
    md: 'h-8 w-8 sm:h-9 sm:w-9',
    lg: 'h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12',
  }[size]

  const textClasses = {
    sm: 'text-[13px] sm:text-[14px] tracking-[0.14em]',
    md: 'text-[16px] sm:text-[18px] tracking-[0.14em]',
    lg: 'text-[21px] sm:text-[23px] md:text-[25px] tracking-[0.14em]',
  }[size]

  const taglineClasses = {
    sm: 'text-[8px] sm:text-[9px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-[10px] sm:text-[11px] md:text-[11.5px]',
  }[size]

  if (withTagline) {
    return (
      <div className="inline-flex items-center gap-2.5 sm:gap-3">
        {/* Brand Icon on the side of both lines */}
        <img
          src="/nevolyn-icon.png"
          alt="NEVOLYN"
          className={`block object-contain drop-shadow-sm shrink-0 ${iconClasses} ${iconClassName}`}
        />

        {/* Text column: NEVOLYN + tagline matching exact width */}
        <div className="flex flex-col gap-1 sm:gap-1.5 justify-center">
          <span
            className={`block font-brand text-slate-900 scale-y-110 origin-left select-none leading-none ${textClasses} ${textClassName}`}
          >
            NEVOLYN
          </span>
          <div
            className={`w-full flex justify-between font-medium text-slate-500 leading-none select-none tracking-normal ${taglineClasses}`}
          >
            <span>Engineering</span>
            <span>What&apos;s</span>
            <span>Next</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Brand Icon */}
      <img
        src="/nevolyn-icon.png"
        alt="NEVOLYN"
        className={`block object-contain drop-shadow-sm shrink-0 ${iconClasses} ${iconClassName}`}
      />

      {/* Primary brand name in Ethnocentric typeface */}
      <span
        className={`block font-brand text-slate-900 scale-y-110 origin-left select-none leading-none ${textClasses} ${textClassName}`}
      >
        NEVOLYN
      </span>
    </>
  )
}

