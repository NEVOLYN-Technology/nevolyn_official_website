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
import { BrandWordmark } from '@/components/ui/BrandWordmark'
import { CONTACT } from '@/lib/constants/contact'

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
              {/* Reusable brand icon + NEVOLYN / Technology wordmark (md = footer size) */}
              <BrandWordmark size="md" />
            </Link>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md">
              Building the future through Automation &amp; Advanced Engineering Solutions.
            </p>
          </div>

          {/* Contact Info — sourced from lib/constants/contact.ts */}
          <div className="space-y-2.5 md:justify-self-end">
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Contact</h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {/* Address */}
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <a
                  href={CONTACT.address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 transition-colors"
                  aria-label="Location Map Link"
                >
                  {CONTACT.address.label}
                </a>
              </li>

              {/* Phone numbers */}
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-sky-500" />
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {CONTACT.phones.map((phone, idx) => (
                    <>
                      <a
                        key={phone.href}
                        href={phone.href}
                        aria-label={phone.ariaLabel}
                        className="hover:text-sky-600 transition-colors"
                      >
                        {phone.label}
                      </a>
                      {/* Bullet separator between numbers — hidden on mobile */}
                      {idx < CONTACT.phones.length - 1 && (
                        <span className="text-slate-300 hidden sm:inline">•</span>
                      )}
                    </>
                  ))}
                </div>
              </li>

              {/* Email */}
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-rose-500" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  aria-label={`Email ${CONTACT.email}`}
                  className="hover:text-rose-600 transition-colors"
                >
                  {CONTACT.email}
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
