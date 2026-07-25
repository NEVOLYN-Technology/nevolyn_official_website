/**
 * Shared `framer-motion` animation presets.
 *
 * Every scroll-triggered entrance animation on the site (page sections,
 * grid cards, list rows, timeline entries) should use one of these instead
 * of hand-rolling a new `{ initial, whileInView, transition }` object.
 * That keeps motion consistent across the app and means a new page only
 * needs to import a helper, not re-derive the animation curve.
 *
 * Two flavors are provided:
 * - `*Variants` — for a parent/children stagger (pair with `staggerContainer`
 *   on the parent and a `*Variants` on each child, driven by Framer's
 *   `variants` + `initial="hidden"` + `whileInView="visible"` API).
 * - `*Props` — ready-to-spread props for a single, independently animated
 *   element (e.g. `<motion.div {...fadeUpProps(index * 0.05)}>` inside a
 * @module lib/animations
 */
import type { Transition, Variants } from 'framer-motion'

export interface MotionPropsPreset {
  initial: { opacity: number; y?: number; x?: number }
  whileInView: { opacity: number; y?: number; x?: number }
  viewport: typeof defaultViewport
  transition: { duration: number; delay: number; ease: Transition['ease'] }
}

/** Standard ease used for every entrance animation on the site. */
const EASE_OUT: Transition['ease'] = 'easeOut'

/** Standard viewport trigger: animate every time it enters the view. */
export const defaultViewport = { once: false, margin: '0px' } as const

/**
 * Parent wrapper variants that stagger its children's entrance animations.
 * Pair with `fadeInUpVariants` (or another `*Variants` preset) on each child.
 *
 * @param staggerChildren - Delay interval between each child animation in seconds (default: 0.1)
 * @param delayChildren - Initial delay before starting stagger sequence in seconds (default: 0.2)
 * @returns Framer Motion Variants object for parent container
 *
 * @example
 * <motion.div variants={staggerContainer()} initial="hidden" whileInView="visible" viewport={defaultViewport}>
 *   {items.map((item) => (
 *     <motion.div key={item.id} variants={fadeInUpVariants}>...</motion.div>
 *   ))}
 * </motion.div>
 */
export function staggerContainer(staggerChildren = 0.1, delayChildren = 0.2): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren, delayChildren },
    },
  }
}

/** Fade + slide up — the default entrance for cards, headings, and list items. */
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
}

/**
 * Ready-to-spread motion props for a single fade-up element, e.g. a card
 * rendered inside a `.map()` where each item needs its own stagger delay.
 *
 * @param delay - Stagger offset delay in seconds (default: 0)
 * @param duration - Animation duration in seconds (default: 0.5)
 * @returns Spreadable Framer Motion properties object
 *
 * @example
 * {items.map((item, idx) => (
 *   <motion.div key={item.id} {...fadeUpProps(idx * 0.05)}>...</motion.div>
 * ))}
 */
export function fadeUpProps(delay = 0, duration = 0.5): MotionPropsPreset {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: defaultViewport,
    transition: { duration, delay, ease: EASE_OUT },
  }
}

/**
 * Ready-to-spread motion props: fade + slide in from the left. Used for timelines and lists.
 *
 * @param delay - Stagger offset delay in seconds (default: 0)
 * @param duration - Animation duration in seconds (default: 0.5)
 * @returns Spreadable Framer Motion properties object
 */
export function fadeLeftProps(delay = 0, duration = 0.5): MotionPropsPreset {
  return {
    initial: { opacity: 0, x: -20 },
    whileInView: { opacity: 1, x: 0 },
    viewport: defaultViewport,
    transition: { duration, delay, ease: EASE_OUT },
  }
}
