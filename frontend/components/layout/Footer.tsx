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

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    if (window.location.pathname === '/') {
      e.preventDefault()
      scrollToSection(sectionId)
      if (sectionId === 'home') {
        if (window.location.hash) {
          window.history.pushState(null, '', '/')
        }
      } else {
        window.history.pushState(null, '', `/#${sectionId}`)
      }
    }
  }

  return (
    <footer className={`text-slate-700 border-t border-sky-300/60 bg-gradient-to-b from-[#e8edf2] to-[#dde3ea]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10 mb-3">
          {/* Brand */}
          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              onClick={scrollToHome}
              aria-label="Go to top of Home page"
              className="inline-flex items-center gap-2.5 group transition-all duration-200 hover:-translate-y-0.5 cursor-pointer w-fit"
            >
              {/* Reusable brand icon + NEVOLYN wordmark (md = footer size) */}
              <BrandWordmark size="md" />
            </Link>
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-normal max-w-sm">
              Engineering what is next.
            </p>

            {/* Social Links — under tagline in brand column */}
            <div className="flex items-center gap-2 pt-1">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/nevolyn/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NEVOLYN Technology on LinkedIn"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#0a66c2] bg-white border border-slate-200/90 shadow-2xs hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
              >
                <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#1877f2] bg-white border border-slate-200/90 shadow-2xs hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
              >
                <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Navigation — middle column */}
          <div className="space-y-2 md:justify-self-center">
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Navigation</span>
            </h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
              <li>
                <a
                  href="/"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="hover:text-emerald-600 transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/#leaders"
                  onClick={(e) => handleNavClick(e, 'leaders')}
                  className="hover:text-emerald-600 transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  Leaders
                </a>
              </li>
              <li>
                <a
                  href="/#about"
                  onClick={(e) => handleNavClick(e, 'about')}
                  className="hover:text-emerald-600 transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/#latest-news"
                  onClick={(e) => handleNavClick(e, 'latest-news')}
                  className="hover:text-emerald-600 transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  News
                </a>
              </li>
              <li>
                <a
                  href="/#innovations"
                  onClick={(e) => handleNavClick(e, 'innovations')}
                  className="hover:text-emerald-600 transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  Innovations
                </a>
              </li>
              <li>
                <Link
                  href="/join_us"
                  className="hover:text-emerald-600 transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info — sourced from lib/constants/contact.ts */}
          <div className="space-y-2 md:justify-self-end">
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
              <span>Contact</span>
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
              {/* Address */}
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
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
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0 text-sky-500" />
                <div className="flex flex-wrap gap-x-2.5 gap-y-0.5">
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
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 text-rose-500" />
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
        <div className="border-t border-slate-300/60 my-2.5" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500">
          <p>© 2026 NEVOLYN Technology. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Dhaka, Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
