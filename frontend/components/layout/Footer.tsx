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
import { Mail, MapPin, Phone, Compass, ChevronRight } from 'lucide-react'
import { BrandWordmark } from '@/components/ui/BrandWordmark'
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
        {/* Main Grid: mobile = single col, iPad vertical = [Brand + Nav beside it in row 1, Contact in 3 cols in row 2], Desktop = [Brand, Nav in exact middle of both, Contact on right] */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:items-start lg:justify-between gap-6 md:gap-x-8 md:gap-y-6 lg:gap-8 mb-3">
          {/* Brand */}
          <div className="flex flex-col gap-2.5 shrink-0">
            <Link
              href="/"
              onClick={scrollToHome}
              aria-label="Go to top of Home page"
              className="inline-flex items-center gap-2.5 sm:gap-3 group transition-all duration-200 hover:-translate-y-0.5 cursor-pointer w-fit mt-1.5 sm:mt-2"
            >
              {/* Reusable brand icon + NEVOLYN wordmark (md = footer size) */}
              <BrandWordmark size="md" />
            </Link>

            {/* Social Links — in brand column */}
            <div className="flex items-center gap-2 pt-0.5">
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

          {/* Navigation — situated in the exact middle of both Brand and Contact */}
          <div className="space-y-2 w-full max-w-sm sm:max-w-md shrink-0">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-300/60">
              <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <span>Navigation</span>
              </h3>
              <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Explore
              </span>
            </div>

            <ul className="grid grid-cols-3 gap-1.5 text-[11px] sm:text-xs">
              <li>
                <a
                  href="/"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="group flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-slate-200/90 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 shadow-2xs hover:shadow-xs font-semibold transition-all duration-150"
                >
                  <span className="truncate">Home</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="/#about"
                  onClick={(e) => handleNavClick(e, 'about')}
                  className="group flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-slate-200/90 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 shadow-2xs hover:shadow-xs font-semibold transition-all duration-150"
                >
                  <span className="truncate">About</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="/#innovations"
                  onClick={(e) => handleNavClick(e, 'innovations')}
                  className="group flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-slate-200/90 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 shadow-2xs hover:shadow-xs font-semibold transition-all duration-150"
                >
                  <span className="truncate">Innovations</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="/#leaders"
                  onClick={(e) => handleNavClick(e, 'leaders')}
                  className="group flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-slate-200/90 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 shadow-2xs hover:shadow-xs font-semibold transition-all duration-150"
                >
                  <span className="truncate">Leaders</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="/#latest-news"
                  onClick={(e) => handleNavClick(e, 'latest-news')}
                  className="group flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-slate-200/90 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 shadow-2xs hover:shadow-xs font-semibold transition-all duration-150"
                >
                  <span className="truncate">News</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              </li>
              <li>
                <Link
                  href="/join_us"
                  className="group flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-slate-200/90 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 shadow-2xs hover:shadow-xs font-semibold transition-all duration-150"
                >
                  <span className="truncate">Careers</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info — sourced from lib/constants/contact.ts */}
          <div className="space-y-2.5 md:col-span-2 lg:col-span-1 w-full lg:w-auto lg:max-w-sm shrink-0">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-300/60">
              <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 inline-block shadow-2xs" />
                <span>Contact</span>
              </h3>
              <span className="font-mono text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 uppercase">
                Direct
              </span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-2.5 md:gap-4 lg:gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
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
                        <span className="text-slate-300 hidden sm:inline md:hidden lg:inline">•</span>
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
