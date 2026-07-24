/**
 * Footer — site-wide bottom footer.
 *
 * Displays the Saturn Textiles logo, a short tagline, and contact
 * information (address, phone, email) with accessible links.
 *
 * ## How to update contact details
 * Edit the contact info directly in this file. When the Spring Boot backend
 * is integrated, consider pulling this data from a `/api/config` endpoint
 * so it can be updated without redeploying the frontend.
 *
 * @module components/layout/Footer
 */
import type { JSX } from 'react'
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'

/**
 * Site-wide bottom footer component with organization info and contact channels.
 *
 * @returns Rendered site footer component
 */
export const Footer = (): JSX.Element => {
  return (
    <footer className="text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-blue-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-6">
            <img
              src="/saturn-logo.png"
              alt="Saturn Textiles Limited"
              className="h-24 w-auto object-contain dark:mix-blend-lighten dark:invert-0 invert"
            />
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Driving innovation in textile manufacturing through advanced automation and research.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-5 md:justify-self-end">
            <h3 className="font-semibold text-xl text-slate-900 dark:text-white">Contact</h3>
            <ul className="space-y-4 text-base text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-orange-400" />
                <a href="https://maps.app.goo.gl/rTMDffWdKmaRdSth6?g_st=ac" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors" aria-label="Location Map Link">
                  13/2, Abdus Sattar Master Road,<br />Tongi, Gazipur
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 shrink-0 text-orange-400 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a
                    href="tel:+8801679248064"
                    title="+880 1679-248064"
                    aria-label="Call +880 1679-248064"
                    className="hover:text-orange-400 transition-colors"
                  >
                    +880 1679-248064
                  </a>
                  <a
                    href="tel:+8801039444451"
                    title="+880 1039-444451"
                    aria-label="Call +880 1939-444451"
                    className="hover:text-orange-400 transition-colors"
                  >
                    +880 1939-444451
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0 text-orange-400" />
                <a href="mailto:saturn.rnd.innovation@gmail.com" aria-label="Email saturn.rnd.innovation@gmail.com" className="hover:text-orange-400 transition-colors">
                  saturn.rnd.innovation@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 my-8" />

        {/* Bottom Section */}
        <div className="text-sm text-slate-500">
          <p>© 2026 Saturn Textiles Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
