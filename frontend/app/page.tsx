/**
 * Homepage (/) — composes the main landing page from section components.
 *
 * Each section has an `id` attribute that the Navbar's anchor links
 * (`/#about`, `/#projects`, etc.) scroll to:
 *
 * | Section id     | Component            |
 * |----------------|----------------------|
 * | `home`         | Hero + Capabilities  |
 * | `about`        | AboutSection         |
 * | `leaders`      | LeadershipTeam       |
 * | `innovations`  | ProjectsSection      |
 * | `latest-news`  | NewsSection          |
 * | `contact`      | ContactSection       |
 *
 * This page is a **Server Component** (no `'use client'` directive).
 * Individual sections that need interactivity declare `'use client'` themselves.
 *
 * @module app/page
 */
import type { JSX } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/sections/Hero'
import { MarqueeTicker } from '@/components/sections/MarqueeTicker'
import { AboutSection } from '@/components/sections/AboutSection'
import { InnovationsSection } from '@/components/sections/InnovationsSection'
import { LeadersSection } from '@/components/sections/LeadersSection'
import { LatestNewsSection } from '@/components/sections/LatestNewsSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { Footer } from '@/components/layout/Footer'

/**
 * Main application homepage component rendering single-page scrolling sections.
 *
 * @returns Rendered home page component
 */
export default function Home(): JSX.Element {
  return (
    <main className="w-full min-h-screen bg-[#d5e4f6]">
      <Navbar />
      {/* Offsets the floating capsule navbar cleanly without excess dead space */}
      <div className="pt-16 sm:pt-20">
        <div id="home">
          <Hero />
        </div>
        <MarqueeTicker />
        <AboutSection />
        <InnovationsSection />
        <LeadersSection />
        <LatestNewsSection />
        <ContactSection />
      </div>
      <Footer />
    </main>
  )
}
