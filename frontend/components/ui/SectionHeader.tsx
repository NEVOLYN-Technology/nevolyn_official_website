/**
 * SectionHeader — Reusable section title block.
 *
 * Every major section on the page shares the same three-part header layout:
 *   1. A `<StatusPill>` label badge
 *   2. An `<h2>` heading (supports JSX children for gradient word coloring)
 *   3. A subtitle `<p>` description
 *
 * Extracting this eliminates ~20 lines of duplicated markup from each of the
 * six section components that previously had their own copy.
 *
 * @module components/ui/SectionHeader
 *
 * @example
 * <SectionHeader
 *   pillLabel="ABOUT NEVOLYN TECHNOLOGY"
 *   title={<>Innovate. <GradText variant="sky">Automate.</GradText> <GradText variant="emerald">Elevate.</GradText></>}
 *   description="NEVOLYN Technology is an advanced engineering company."
 * />
 */
import type { JSX, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { StatusPill } from '@/components/ui/StatusPill'
import { fadeUpProps } from '@/lib/animations'

interface SectionHeaderProps {
  /** Text passed to the StatusPill label (auto-uppercased by StatusPill) */
  pillLabel: string
  /**
   * The h2 content. Accepts JSX so callers can insert gradient spans.
   * Keep the text concise — ideally 3 words with varied color accents.
   */
  title: ReactNode
  /** Plain-text subtitle paragraph rendered below the heading */
  description: string
  /** Optional extra classes on the wrapper (e.g., "mb-10 sm:mb-12") */
  className?: string
}

/**
 * Standard three-part section header: pill + h2 + description paragraph.
 * All entrance animations are handled internally via `fadeUpProps`.
 *
 * @param props.pillLabel - Text for the StatusPill badge
 * @param props.title - ReactNode h2 content (supports gradient spans)
 * @param props.description - Plain text subtitle
 * @param props.className - Optional wrapper class overrides
 * @returns Rendered section header block
 */
export function SectionHeader({
  pillLabel,
  title,
  description,
  className = 'text-center mb-10 sm:mb-12',
}: SectionHeaderProps): JSX.Element {
  return (
    <motion.div {...fadeUpProps(0.1)} className={className}>
      {/* Status pill badge */}
      <StatusPill label={pillLabel} />

      {/* Section heading — accepts JSX children for gradient word styling */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
        {title}
      </h2>

      {/* Subtitle / description */}
      <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
        {description}
      </p>
    </motion.div>
  )
}

/**
 * Helper for gradient-colored text spans inside an `<h2>`.
 * Renders a `<span>` with a sky-to-blue or emerald-to-teal gradient clip.
 *
 * @param props.variant - `"sky"` for sky-blue, `"emerald"` for green-teal
 * @param props.children - The word(s) to colorize
 *
 * @example
 * <GradText variant="sky">Develop.</GradText>
 */
export function GradText({
  variant,
  children,
}: {
  variant: 'sky' | 'emerald'
  children: ReactNode
}): JSX.Element {
  const gradClass =
    variant === 'sky'
      ? 'bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent'

  return <span className={gradClass}>{children}</span>
}
