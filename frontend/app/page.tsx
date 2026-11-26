/**
 * Homepage (/) — composes the main landing page from section components.
 *
 * Each section has an `id` attribute that the Navbar's anchor links
 * (`/#about`, `/#products`, etc.) scroll to:
 *
 * | Section id     | Component            |
 * |----------------|----------------------|
 * | `home`         | Hero + Capabilities  |
 * | `about`        | AboutSection         |
 * | `leaders`      | LeadershipTeam       |
 * | `products`     | ProductsSection      |
 * | `news`         | LatestNewsSection    |
 * | `contact`      | ContactSection       |
 *
 * This page is a **Server Component** (no `'use client'` directive).
 * Individual sections that need interactivity declare `'use client'` themselves.
 *
 * @module app/page
 */
import type { JSX } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Hero } from '@/components/sections/Hero'
import { MarqueeTicker } from '@/components/sections/MarqueeTicker'
import { AboutSection } from '@/components/sections/AboutSection'
import { ProductsSection } from '@/components/sections/ProductsSection'
import { LeadersSection } from '@/components/sections/LeadersSection'
import { LatestNewsSection } from '@/components/sections/LatestNewsSection'
import { ContactSection } from '@/components/sections/ContactSection'

/**
 * Main application homepage component rendering single-page scrolling sections.
 *
 * @returns Rendered home page component
 */
export default function Home(): JSX.Element {
  return (
    <PageShell>
      <div id="home">
        <Hero />
      </div>
      <MarqueeTicker />
      <AboutSection />
      <ProductsSection />
      <LeadersSection />
      <LatestNewsSection />
      <ContactSection />
    </PageShell>
  )
}
