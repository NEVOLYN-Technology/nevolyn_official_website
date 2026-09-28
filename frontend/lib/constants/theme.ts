/**
 * theme.ts — Centralized design token constants for NEVOLYN Technology.
 *
 * ## Architecture — single source of truth
 *
 * All color changes flow through ONE place:
 *
 *   globals.css :root { --background: #eef1f5; ... }   ← edit hex HERE ONLY
 *         ↓
 *   globals.css @theme { --color-background: var(--background); }  ← Tailwind utility
 *         ↓
 *   Components: className="bg-background"  or  className={SECTION_BG.primary}
 *
 * Never hardcode hex values in components or in SECTION_BG/GRADIENTS below.
 *
 * ## Token Groups
 * - `COLORS`     — hex reference only (mirrors globals.css — not for JSX use)
 * - `SECTION_BG` — semantic Tailwind class strings via CSS-var-backed utilities
 * - `GRADIENTS`  — reusable gradient class strings
 * - `SHADOWS`    — box-shadow utility strings
 *
 * @module lib/constants/theme
 */

/**
 * Raw hex reference values — FOR DOCUMENTATION ONLY.
 * These mirror globals.css :root. Do NOT use in JSX className strings;
 * use SECTION_BG semantic class names instead.
 */
export const COLORS = {
  /** Primary page background → --background in globals.css */
  pageBg: '#eef1f5',
  /** Alternate section background → --section-alt in globals.css */
  altSectionBg: '#e8edf2',
  /** Footer background → --footer-bg in globals.css */
  footerBg: '#dde3ea',
  /** Marquee ticker band background → --ticker-bg in globals.css */
  tickerBg: '#dde5ef',
  /** Hero presentation card background → --hero-card-bg in globals.css */
  heroBg: '#e2eaf4',
} as const

/**
 * Semantic Tailwind class strings for section backgrounds.
 *
 * These resolve through CSS custom properties in globals.css.
 * To retheme the site: edit :root variables in globals.css only.
 *
 * Usage:
 *   <section className={`${SECTION_BG.primary} ${SECTION_BG.border}`}>
 *   <section className={`${SECTION_BG.alternate} ${SECTION_BG.border}`}>
 */
export const SECTION_BG = {
  /** Primary bg — Hero, Innovations, Latest News, page shell, body */
  primary: 'bg-background',
  /** Alternate bg — About, Leaders, Contact (slightly cooler tone) */
  alternate: 'bg-section-alt',
  /** Footer bg — anchors the bottom of the page */
  footer: 'bg-footer',
  /** Ticker bg — marquee band with backdrop blur */
  ticker: 'bg-ticker',
  /** Hero card bg — presentation frame inner background */
  heroCard: 'bg-hero-card',
  /** Section divider border — applied alongside section backgrounds */
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
  /**
   * Navbar frosted glass pill background.
   * Uses white/opacity stops — Tailwind gradient arbitrary values
   * cannot reference CSS variables, so white-opacity is the clean fallback.
   */
  navbarBg: 'bg-gradient-to-r from-white/90 via-white/80 to-white/75',
  /** Mobile drawer frosted glass background */
  drawerBg: 'bg-gradient-to-b from-white/95 via-white/90 to-white/85',
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
