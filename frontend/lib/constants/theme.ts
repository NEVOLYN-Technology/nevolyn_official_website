/**
 * theme.ts — Centralized design token constants for NEVOLYN Technology.
 *
 * This is the **single source of truth** for every repeated color, gradient,
 * shadow, and background value used across the site. When the brand palette
 * evolves, update it here — nowhere else.
 *
 * ## Token Groups
 * - `COLORS` — raw hex values sampled from the hero showcase image and brand guide
 * - `SECTION_BG` — Tailwind bg-[…] class strings for each section background tier
 * - `GRADIENTS` — reusable gradient class strings for CTAs, active states, and accents
 * - `SHADOWS` — box-shadow utility strings for the frosted glass navbar and carousel cards
 *
 * @module lib/constants/theme
 */

/** Raw hex color values from the NEVOLYN brand palette. */
export const COLORS = {
  /** Primary page background — sampled from the hero showcase image sky */
  pageBg: '#d5e4f6',
  /** Alternate section background — slightly lighter for visual rhythm */
  altSectionBg: '#deebf9',
  /** Footer background — deeper blue for anchoring the page bottom */
  footerBg: '#c6dbf2',
  /** Marquee ticker band background */
  tickerBg: '#c9ddf3',
  /** Hero presentation card background — matches the image's inner sky tone */
  heroBg: '#cde0fa',
  /** Navbar frosted glass mid-stop */
  navbarMid: '#e6f0fb',
  /** Navbar frosted glass end-stop */
  navbarEnd: '#dceaf8',
} as const

/**
 * Tailwind class strings for section backgrounds.
 * Usage: <section className={SECTION_BG.primary}>
 */
export const SECTION_BG = {
  /** Default — Innovations, Latest News, Hero, page shell */
  primary: 'bg-[#d5e4f6]',
  /** Alternate — About, Leaders, Contact */
  alternate: 'bg-[#deebf9]',
  /** Top divider border applied alongside section backgrounds */
  border: 'border-t border-sky-300/60',
} as const

/**
 * Reusable gradient class strings.
 * Usage: <span className={GRADIENTS.navActive}>
 */
export const GRADIENTS = {
  /** Active nav pill — emerald to teal */
  navActive: 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500',
  /** Primary CTA button — emerald to teal solid */
  ctaPrimary: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  /** Navbar frosted glass pill background */
  navbarBg: 'bg-gradient-to-r from-white/90 via-[#e6f0fb]/85 to-[#dceaf8]/85',
  /** Mobile drawer frosted glass background */
  drawerBg: 'bg-gradient-to-b from-white/95 via-[#e6f0fb]/95 to-[#dceaf8]/95',
  /** Carousel active card gradient border wrap */
  carouselActive: 'bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-500',
  /** Carousel active card top accent beam */
  carouselBeam: 'bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400',
  /** Hero presentation frame top accent beam */
  heroBeam: 'bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400',
  /** Sky gradient text (h2 mid-word) */
  textSky: 'bg-gradient-to-r from-sky-500 to-blue-600',
  /** Emerald gradient text (h2 last-word) */
  textEmerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
} as const

/**
 * Custom box-shadow strings (used inside Tailwind shadow-[…] arbitrary values).
 * Usage: className={`shadow-[${SHADOWS.navbar}]`}
 */
export const SHADOWS = {
  /** Navbar floating capsule — subtle sky-blue atmospheric glow */
  navbar: '0_8px_28px_rgba(14,165,233,0.12)',
  /** Navbar on-hover — soft emerald tint */
  navbarHover: '0_8px_32px_rgba(16,185,129,0.16)',
  /** Carousel active card glow */
  carouselActive: '0_20px_50px_rgba(56,189,248,0.25),0_0_25px_rgba(99,102,241,0.15)',
  /** Active nav pill emerald glow */
  navPill: '0_4px_16px_rgba(16,185,129,0.35)',
  /** Carousel active top beam glow */
  carouselBeam: '0_0_12px_rgba(56,189,248,0.4)',
} as const
