/**
 * Footer — site-wide bottom footer.
 *
 * Displays the NEVOLYN Technology logo, a short tagline, and contact
 * information (address, phone, email) with accessible links.
 *
 * ## How to update contact details
 * Edit the contact info directly in this file. When the Spring Boot backend
 * is integrated, consider pulling this data from a `/api/config` endpoint
 * so it can be updated without redeploying the frontend.
 *
 * @module components/layout/Footer
 */
'use client'

import type { JSX } from 'react'
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'

/**
 * Site-wide bottom footer component with organization info and contact channels.
 *
 * @returns Rendered site footer component
 */
export const Footer = (): JSX.Element => {
  const scrollToHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (window.location.hash) {
        window.history.pushState(null, '', '/')
      }
    }
  }

  return (
    <footer className="text-slate-700 border-t border-sky-300/70 bg-[#c6dbf2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link
              href="/"
              onClick={scrollToHome}
              aria-label="Go to top of Home page"
              className="inline-flex items-center gap-3 group transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <img
                src="/nevolyn-icon.png"
                alt="NEVOLYN Technology"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-full drop-shadow-sm"
              />
              <span className="flex flex-col justify-center leading-none">
                <span className="block font-brand text-lg sm:text-xl tracking-[0.16em] text-slate-900">
                  NEVOLYN
                </span>
                <span className="mt-1.5 block font-brand text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.14em] text-slate-600">
                  Technology
                </span>
              </span>
            </Link>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md">
              Building the future through Automation &amp; Advanced Engineering Solutions.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-2.5 md:justify-self-end">
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Contact</h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <a href="https://maps.app.goo.gl/rTMDffWdKmaRdSth6?g_st=ac" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 transition-colors" aria-label="Location Map Link">
                  13/2, Abdus Sattar Master Road, Tongi, Gazipur
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-sky-500" />
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <a
                    href="tel:+8801679248064"
                    aria-label="Call +880 1679-248064"
                    className="hover:text-sky-600 transition-colors"
                  >
                    +880 1679-248064
                  </a>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <a
                    href="tel:+8801939444451"
                    aria-label="Call +880 1939-444451"
                    className="hover:text-sky-600 transition-colors"
                  >
                    +880 1939-444451
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-rose-500" />
                <a href="mailto:info@nevolyn.com" aria-label="Email info@nevolyn.com" className="hover:text-rose-600 transition-colors">
                  info@nevolyn.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/90 my-4" />

        {/* Bottom Section */}
        <div className="text-xs text-slate-500">
          <p>© 2026 NEVOLYN Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
