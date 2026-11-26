/**
 * Badge — a compact, rounded pill for displaying status, category, or tag information.
 *
 * Uses CSS custom properties defined in `globals.css` via `@theme inline` so
 * badge colors automatically follow the active light/dark theme without needing
 * any `dark:` overrides in this file.
 *
 * @module components/ui/badge
 */
import type { LucideIcon } from 'lucide-react'
import type { ReactNode, JSX } from 'react'
import { cn } from '@/lib/utils'

/**
 * Semantic color of a badge. Maps to the theme's CSS variables (see
 * `app/globals.css`) so badges stay correct in both light and dark mode
 * without any per-badge dark: overrides.
 *
 * - `neutral` — default/inactive, no particular meaning (e.g. a tech tag)
 * - `info`    — the brand accent (e.g. "active", categories, general tags)
 * - `success` — positive/complete states
 * - `warning` — attention/in-progress states
 * - `danger`  — critical/blocking states
 */
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

/** Maps each tone to its Tailwind color-token classes. Must stay in sync with `globals.css` token definitions. */
const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-secondary/10 text-secondary',
  success: 'bg-chart-3/15 text-chart-3',
  warning: 'bg-chart-4/15 text-chart-4',
  danger: 'bg-destructive/10 text-destructive',
}

export interface BadgeProps {
  children: ReactNode
  /** Semantic color, defaults to `neutral`. */
  tone?: BadgeTone
  /** Optional leading icon. */
  icon?: LucideIcon
  /** Capitalize the first letter of each word (useful for status/priority values). */
  capitalize?: boolean
  className?: string
}

/**
 * A small rounded pill used for statuses, categories, priorities, and tags
 * throughout the content pages (projects, research, news, future projects).
 *
 * Reach for this instead of a one-off `<span className="rounded-full ...">`
 * so every tag on the site shares the same shape and theme-aware colors.
 *
 * @param props - Component options including tone, icon, and children
 * @returns The rendered badge element
 *
 * @example
 * <Badge tone="success">Active</Badge>
 * <Badge tone="danger" icon={AlertCircle} capitalize>{project.priority}</Badge>
 */
export function Badge({ children, tone = 'neutral', icon: Icon, capitalize, className }: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap',
        capitalize && 'capitalize',
        toneClasses[tone],
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  )
}
