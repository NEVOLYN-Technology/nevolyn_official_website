/**
 * Navbar — site-wide top navigation bar.
 *
 * ## Behavior
 * - **Fixed positioning**: always visible at the top of the viewport.
 * - **Scroll-aware backdrop**: switches from a subtle blur to a heavier
 *   blur + shadow once the user scrolls past 50 px.
 * - **Active section tracking**: listens to scroll position and highlights
 *   the nav link whose corresponding section is in view. Sections are matched
 *   by element `id` (e.g. `id="about"`, `id="projects"`).
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
import { Menu, X } from 'lucide-react'

/** Static link definitions. Defined outside the component to avoid re-creating the array on every render. */
const NAV_LINKS = [
  { href: '/', sectionId: 'home', label: 'HOME' },
  { href: '/#about', sectionId: 'about', label: 'ABOUT' },
  { href: '/#leaders', sectionId: 'leaders', label: 'LEADERS' },
  { href: '/#innovations', sectionId: 'innovations', label: 'INNOVATIONS' },
  { href: '/#latest-news', sectionId: 'latest-news', label: 'LATEST NEWS' },
] as const

/**
 * Site-wide navigation bar component supporting scroll tracking and mobile drawer navigation.
 *
 * @returns Rendered site navigation bar element
 */
export const Navbar = (): JSX.Element => {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState(isHomePage ? 'home' : '')

  useEffect(() => {
    if (!isHomePage) {
      setActiveSection('')
      const handleOtherScroll = () => setScrolled(window.scrollY > 50)
      window.addEventListener('scroll', handleOtherScroll)
      handleOtherScroll()
      return () => window.removeEventListener('scroll', handleOtherScroll)
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      // Walk through each nav section and find the last one whose top edge
      // has passed the 200 px threshold — that's the "current" section.
      let current = ''
      for (const link of NAV_LINKS) {
        const element = document.getElementById(link.sectionId)
        if (element && element.getBoundingClientRect().top <= 200) {
          current = link.sectionId
        }
      }

      // Also check the contact section (it isn't in NAV_LINKS but has a button)
      const contactElement = document.getElementById('contact')
      if (contactElement && contactElement.getBoundingClientRect().top <= 200) {
        current = 'contact'
      }

      // Snap back to "home" when near the very top of the page and clear URL hash
      if (window.scrollY < 100) {
        current = 'home'
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }

      if (current) {
        setActiveSection(current)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Sync on mount without waiting for a scroll event
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage, pathname])

  return (
    <nav className={`fixed w-full z-50 border-b border-orange-950/40 transition-all duration-300 ${scrolled
      ? 'bg-background/95 shadow-lg shadow-black/30 backdrop-blur'
      : 'bg-background/85 backdrop-blur-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-[5.5rem] items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-all duration-300 hover:-translate-y-1 hover:scale-105">
            <img
              src="/saturn-logo.png"
              alt="Saturn Textiles Limited — Research and Development Department"
              className="h-24 w-auto object-contain drop-shadow-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.sectionId
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-bold tracking-wider rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 ${isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 -translate-y-1 scale-105'
                    : 'text-slate-200 hover:text-orange-400 hover:bg-orange-500/20 hover:shadow-md hover:shadow-orange-500/20'
                    }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="ml-auto flex items-center space-x-3">
            <Link
              href="/#contact"
              className={`hidden rounded-xl border px-5 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 lg:inline-flex ${activeSection === 'contact'
                ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/40 -translate-y-1 scale-105'
                : 'border-orange-500/60 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/80 hover:shadow-md hover:shadow-orange-500/20'
                }`}
            >
              Let's Connect
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-slate-100 transition-colors hover:bg-slate-800 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${activeSection === link.sectionId
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-100 hover:bg-orange-950/40 hover:text-orange-300'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
