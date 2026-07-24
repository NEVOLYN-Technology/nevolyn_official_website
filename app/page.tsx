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
import { WelcomeBanner } from '@/components/ui/WelcomeBanner'
import { Hero } from '@/components/sections/Hero'
import { CapabilitiesSection } from '@/components/sections/CapabilitiesSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { LeadersSection } from '@/components/sections/LeadersSection'
import { InnovationsSection } from '@/components/sections/InnovationsSection'
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
    <main className="w-full">
      <Navbar />
      {/* pt-[5.5rem] offsets the fixed navbar height (5.5rem = 88px) */}
      <div className="pt-[5.5rem]">
        <WelcomeBanner />
        <div id="home">
          <Hero />
          <CapabilitiesSection />
        </div>
        <AboutSection />
        <LeadersSection />
        <InnovationsSection />
        <LatestNewsSection />
        <ContactSection />
      </div>
      <Footer />
    </main>
  )
}
