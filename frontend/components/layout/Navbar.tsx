/**
 * Navbar — site-wide floating pill navigation bar matching the modern FABINS aesthetic.
 *
 * ## Behavior
 * - **Fixed positioning**: always visible at the top of the viewport.
 * - **Scroll-aware backdrop**: switches from a subtle blur to a heavier
 *   blur + shadow once the user scrolls past 50 px.
 * - **Active section tracking**: listens to scroll position and highlights
 *   the nav link whose corresponding section is in view. Sections are matched
 *   by element `id` (e.g. `id="about"`, `id="projects"`).
 * - **Smooth scroll handling**: clicking Home or Logo smooth-scrolls back to `top: 0`
 *   even when scrolled to the bottom of the page.
 * - **Mobile drawer**: a hamburger menu that collapses into a vertical link
 *   list on small screens and closes automatically on link click.
 *
 * ## How to add a nav link
 * Append an entry to the `NAV_LINKS` constant below. `sectionId` must match
 * the `id` attribute of the target section element on the page.
 *
 * ```ts
 * { href: '/#team', sectionId: 'team', label: 'Team' }
 * ```
 *
 * @module components/layout/Navbar
 */
'use client'

import type { JSX } from 'react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Menu, X, Briefcase } from 'lucide-react'
import { BrandWordmark } from '@/components/ui/BrandWordmark'
import { scrollToSection } from '@/lib/scroll'

/** Static link definitions. Defined outside the component to avoid re-creating the array on every render. */
const NAV_LINKS = [
  { href: '/', sectionId: 'home', label: 'HOME' },
  { href: '/#about', sectionId: 'about', label: 'ABOUT' },
  { href: '/#products', sectionId: 'products', label: 'PRODUCTS' },
  { href: '/#leaders', sectionId: 'leaders', label: 'LEADERS' },
  { href: '/#news', sectionId: 'news', label: 'NEWS' },
] as const

export const Navbar = (): JSX.Element => {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(isHomePage ? 'home' : '')
  const [isScrolled, setIsScrolled] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const navBarRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScrollRef = useRef(false)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ensure native browser scroll restoration is active and clean any lingering section hash on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
      if (window.location.hash && !window.location.hash.includes('/')) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [])

  // Tap anywhere outside to dismiss the mobile navigation menu
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (
        (drawerRef.current && drawerRef.current.contains(target)) ||
        (navBarRef.current && navBarRef.current.contains(target))
      ) {
        return
      }
      setIsOpen(false)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside, { passive: true })
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isHomePage) {
      setActiveSection('')
      return
    }

    let isRafPending = false
    let rafId: number | null = null

    const updateOnScroll = () => {
      if (isRafPending) return
      isRafPending = true

      rafId = requestAnimationFrame(() => {
        isRafPending = false

        // Update scrolled styling state
        const scrolled = window.scrollY > 20
        setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))

        // When user clicked a nav link, suppress scroll-spy updates temporarily to prevent jumping
        if (isProgrammaticScrollRef.current) return

        let current = 'home'

        // Check nav sections in order: about -> products -> leaders -> news
        for (const link of NAV_LINKS) {
          if (link.sectionId === 'home') continue
          const element =
            document.getElementById(link.sectionId) ||
            (link.sectionId === 'news' ? document.getElementById('latest-news') : null)
          if (element && element.getBoundingClientRect().top <= 240) {
            current = link.sectionId
          }
        }

        // Only switch to contact when user has genuinely reached the contact section
        const contactEl = document.getElementById('contact')
        const isAtBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 70
        if (
          contactEl &&
          (contactEl.getBoundingClientRect().top <= 140 ||
            (isAtBottom && contactEl.getBoundingClientRect().top <= window.innerHeight * 0.75))
        ) {
          current = 'contact'
        }

        if (window.scrollY < 120) {
          current = 'home'
        }

        setActiveSection((prev) => (prev !== current ? current : prev))
      })
    }

    const handleScroll = () => updateOnScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateOnScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
      }
    }
  }, [isHomePage, pathname])

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    if (isHomePage) {
      e.preventDefault()
      setIsOpen(false)
      setActiveSection(sectionId)

      // Suppress scroll-spy updates during smooth scrolling to prevent flicker
      isProgrammaticScrollRef.current = true
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 900)

      scrollToSection(sectionId)
      // Keep URL clean so page refresh always restores exact scroll position
      if (typeof window !== 'undefined' && window.location.hash && !window.location.hash.includes('/')) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Fullscreen Backdrop: tapping anywhere outside dismisses the mobile navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-xs lg:hidden pointer-events-auto"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <header className="fixed inset-x-0 top-0 z-50 px-2.5 pt-2.5 sm:px-6 sm:pt-4 pointer-events-none transition-all duration-300">
        {/* Floating Pill Navbar Container with Cool Blue Frosted Glass Shade */}
        <div
          ref={navBarRef}
          className={`pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-1.5 sm:gap-3 rounded-full border transition-all duration-300 ease-out hover:border-emerald-400 hover:shadow-[0_8px_32px_rgba(16,185,129,0.16)] ${isScrolled
            ? 'border-sky-300/80 bg-gradient-to-r from-white/95 via-[#e6f0fb]/90 to-[#dceaf8]/90 px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_12px_32px_rgba(14,165,233,0.15)] backdrop-blur-2xl'
            : 'border-sky-300/55 bg-gradient-to-r from-white/90 via-[#e6f0fb]/80 to-[#dceaf8]/80 px-2.5 py-1.5 sm:px-4.5 sm:py-2.5 shadow-[0_6px_24px_rgba(14,165,233,0.1)] backdrop-blur-xl'
            }`}
        >

          {/* Brand Logo & Wordmark */}
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, 'home')}
            className="group flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-1.5 sm:pr-2 transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* Reusable brand icon + NEVOLYN / Technology wordmark (sm = navbar size) */}
            <BrandWordmark size="sm" />
          </Link>

          {/* Desktop Links (Pill Style) */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive = isHomePage && activeSection === link.sectionId
              return (
                <a
                  key={link.sectionId}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.sectionId)}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${isActive
                    ? 'text-white'
                    : 'text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700'
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </a>
              )
            })}
          </nav>

          {/* Right CTA & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Career CTA Button — Icon only on mobile, expands on tablet/desktop */}
            <Link
              href="/career"
              onClick={() => setIsOpen(false)}
              aria-label="Career"
              title="Career"
              className={`relative inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full h-8.5 w-8.5 sm:h-auto sm:w-auto sm:px-4 lg:px-5 sm:py-2 text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 shadow-xs shrink-0 ${pathname === '/career'
                ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(14,165,233,0.35)] border border-transparent scale-105'
                : 'border border-sky-300/80 bg-gradient-to-r from-sky-50/90 to-blue-50/80 text-sky-900 hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-600 hover:text-white hover:border-transparent hover:shadow-[0_4px_16px_rgba(14,165,233,0.25)]'
                }`}
            >
              <Briefcase className="h-4 w-4 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="hidden sm:inline">Career</span>
            </Link>

            {/* Contact CTA Button — Icon only on mobile, expands on tablet/desktop */}
            <a
              href="/#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              aria-label="Let's Connect"
              title="Let's Connect"
              className={`relative inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full h-8.5 w-8.5 sm:h-auto sm:w-auto sm:px-4 lg:px-5 sm:py-2 text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 shadow-sm shrink-0 ${activeSection === 'contact'
                ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] border border-transparent scale-105'
                : 'border border-emerald-300/90 bg-gradient-to-r from-emerald-50/90 to-teal-50/80 text-emerald-800 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-600 hover:text-white hover:border-transparent hover:shadow-emerald-500/25'
                }`}
            >
              <Mail className="h-4 w-4 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="hidden sm:inline">Let&apos;s Connect</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              className="flex h-8.5 w-8.5 sm:h-9 sm:w-9 lg:hidden items-center justify-center rounded-full border border-sky-300/60 bg-gradient-to-b from-white via-sky-50/70 to-[#dceaf8]/80 text-slate-700 transition-colors hover:border-emerald-400 hover:text-emerald-600 shadow-sm active:scale-95 shrink-0"
            >
              {isOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer (Optimized for Android and iPhone) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="nav-mobile-drawer"
              ref={drawerRef}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-auto relative z-50 mx-auto mt-2 max-w-md w-full px-1 lg:hidden"
            >
              <div className="rounded-3xl border border-sky-300/65 bg-gradient-to-b from-white/95 via-[#e6f0fb]/95 to-[#dceaf8]/95 p-4 shadow-xl shadow-sky-500/10 backdrop-blur-2xl flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = isHomePage && activeSection === link.sectionId
                  return (
                    <a
                      key={link.sectionId}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.sectionId)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${isActive
                        ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/25'
                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                    >
                      <span>{link.label}</span>
                    </a>
                  )
                })}
                <div className="pt-2 mt-1 border-t border-slate-100 flex flex-col gap-1.5">
                  <Link
                    href="/career"
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold transition-all ${pathname === '/career'
                      ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-sky-500/35 ring-2 ring-sky-300 border border-transparent'
                      : 'border border-sky-300/90 bg-gradient-to-r from-sky-50/90 to-blue-50/80 text-sky-900 hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-600 hover:text-white hover:border-transparent'
                      }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Career</span>
                  </Link>

                  <a
                    href="/#contact"
                    onClick={(e) => handleNavClick(e, 'contact')}
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold transition-all ${activeSection === 'contact'
                      ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/35 ring-2 ring-emerald-300 border border-transparent'
                      : 'border border-emerald-300/90 bg-gradient-to-r from-emerald-50/90 to-teal-50/80 text-emerald-800 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-600 hover:text-white hover:border-transparent'
                      }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Let's Connect</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
