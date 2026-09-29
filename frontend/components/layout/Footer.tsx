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

import React from 'react'
import type { JSX } from 'react'
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { BrandWordmark } from '@/components/ui/BrandWordmark'
import { SECTION_BG } from '@/lib/constants/theme'
import { CONTACT } from '@/lib/constants/contact'
import { scrollToSection } from '@/lib/scroll'

/**
 * Site-wide bottom footer component with organization info and contact channels.
 *
 * @returns Rendered site footer component
 */
export const Footer = (): JSX.Element => {
  const scrollToHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault()
      scrollToSection('home')
      if (window.location.hash) {
        window.history.pushState(null, '', '/')
      }
    }
  }

  return (
    <footer className={`text-slate-700 border-t border-sky-300/70 ${SECTION_BG.footer}`}>
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

            {/* Social Links — under tagline in brand column */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/nevolyn/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NEVOLYN Technology on LinkedIn"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-[#0a66c2] bg-white border border-slate-200 shadow-sm hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/nevolyn/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NEVOLYN Technology on Facebook"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-[#1877f2] bg-white border border-slate-200 shadow-sm hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
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
                    <React.Fragment key={phone.href}>
                      <a
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
                    </React.Fragment>
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
