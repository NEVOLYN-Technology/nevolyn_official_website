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
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, Menu, X } from 'lucide-react'
import { BrandWordmark } from '@/components/ui/BrandWordmark'

/** Static link definitions. Defined outside the component to avoid re-creating the array on every render. */
const NAV_LINKS = [
  { href: '/', sectionId: 'home', label: 'HOME' },
  { href: '/#about', sectionId: 'about', label: 'ABOUT' },
  { href: '/#innovations', sectionId: 'innovations', label: 'INNOVATIONS' },
  { href: '/#leaders', sectionId: 'leaders', label: 'LEADERS' },
  { href: '/#latest-news', sectionId: 'latest-news', label: 'LATEST NEWS' },
] as const

export const Navbar = (): JSX.Element => {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(isHomePage ? 'home' : '')

  // Immediately strip #home if present on page load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#home') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (!isHomePage) {
      setActiveSection('')
      return
    }

    const handleScroll = () => {
      let current = 'home'
      for (const link of NAV_LINKS) {
        if (link.sectionId === 'home') continue
        const element = document.getElementById(link.sectionId)
        if (element && element.getBoundingClientRect().top <= 220) {
          current = link.sectionId
        }
      }

      const contactElement = document.getElementById('contact')
      if (contactElement && contactElement.getBoundingClientRect().top <= 220) {
        current = 'contact'
      }

      if (window.scrollY < 100) {
        current = 'home'
      }

      setActiveSection(current)

      // Sync browser URL bar: no hash when at top (home), dynamic section hash everywhere else
      if (current === 'home') {
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      } else {
        const targetHash = `#${current}`
        if (window.location.hash !== targetHash) {
          window.history.replaceState(null, '', `/#${current}`)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage, pathname])

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    if (isHomePage) {
      e.preventDefault()
      setIsOpen(false)
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        if (window.location.hash) {
          window.history.replaceState(null, '', '/')
        }
        setActiveSection('home')
      } else {
        const element = document.getElementById(sectionId)
        if (element) {
          const yOffset = -90
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
          window.history.replaceState(null, '', `/#${sectionId}`)
          setActiveSection(sectionId)
        }
      }
    } else {
      setIsOpen(false)
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 pointer-events-none">
      {/* Floating Pill Navbar Container with Cool Blue Frosted Glass Shade */}
      <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-sky-300/65 bg-gradient-to-r from-white/90 via-[#e6f0fb]/85 to-[#dceaf8]/85 px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_8px_28px_rgba(14,165,233,0.12)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_8px_32px_rgba(16,185,129,0.16)]">

        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, 'home')}
          className="group flex shrink-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-all duration-200 hover:-translate-y-0.5"
        >
          {/* Reusable brand icon + NEVOLYN / Technology wordmark (sm = navbar size) */}
          <BrandWordmark size="sm" />
        </Link>

        {/* Desktop Links (Pill Style) */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.sectionId
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
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 shadow-[0_4px_16px_rgba(16,185,129,0.35)]" />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Right CTA & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <a
            href="/#contact"
            onClick={(e) => handleNavClick(e, 'contact')}
            className="relative hidden !px-5 !py-2 text-[13px] sm:inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 border border-emerald-300/90 bg-gradient-to-r from-emerald-50/90 to-teal-50/80 text-emerald-800 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-600 hover:text-white hover:border-transparent shadow-sm hover:shadow-emerald-500/25"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Let's Connect</span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-300/60 bg-gradient-to-b from-white via-sky-50/70 to-[#dceaf8]/80 text-slate-700 transition-colors hover:border-emerald-400 hover:text-emerald-600 lg:hidden shadow-sm active:scale-95"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Optimized for Android and iPhone) */}
      {isOpen && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-md w-full px-1 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-3xl border border-sky-300/65 bg-gradient-to-b from-white/95 via-[#e6f0fb]/95 to-[#dceaf8]/95 p-4 shadow-xl shadow-sky-500/10 backdrop-blur-2xl flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.sectionId
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
            <div className="pt-2 mt-1 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="/#contact"
                onClick={(e) => handleNavClick(e, 'contact')}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-semibold text-white hover:brightness-105 transition-all shadow-sm shadow-emerald-500/20"
              >
                <Mail className="h-4 w-4" />
                <span>Let's Connect</span>
              </a>
              <Link
                href="/join_us"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <span>Careers & Join Us</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
