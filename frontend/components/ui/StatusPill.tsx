/**
 * StatusPill — Animated emerald pulse status badge.
 *
 * The small "● LABEL" pill displayed at the top of every major section
 * (Hero, About, Innovations, Leaders, Latest News, Contact) to signal
 * the section is live / active. Extracting it here ensures a uniform
 * appearance and removes duplication across six different section files.
 *
 * @module components/ui/StatusPill
 *
 * @example
 * <StatusPill label="ENGINEERING WHAT'S NEXT" />
 * <StatusPill label="ABOUT NEVOLYN TECHNOLOGY" />
 */
import type { JSX } from 'react'

interface StatusPillProps {
  /** Uppercase label text shown inside the pill (e.g., "ABOUT NEVOLYN TECHNOLOGY") */
  label: string
  /** Optional additional Tailwind classes (e.g., for margin overrides). */
  className?: string
}

/**
 * Animated emerald status pill badge with pulsing dot indicator.
 *
 * @param props.label - The uppercase text to display
 * @param props.className - Optional extra classes appended to the root element
 * @returns Rendered status pill span
 */
export function StatusPill({ label, className = '' }: StatusPillProps): JSX.Element {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm mb-4 backdrop-blur-sm ${className}`}
    >
      {/* Animated pulsing dot — signals "live / active" */}
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      <span className="tracking-wide uppercase">{label}</span>
    </div>
  )
}
