/**
 * PageShell — standard full-page layout wrapper for all routes except the homepage.
 *
 * Composes `Navbar` (fixed top) + a padded content area + `Footer`.
 * Use this on every non-homepage page to avoid repeating the layout boilerplate.
 *
 * @example
 * export default function JoinPage() {
 *   return (
 *     <PageShell>
 *       <div className="max-w-3xl mx-auto px-4 py-12">
 *         {/* page content *\/}
 *       </div>
 *     </PageShell>
 *   )
 * }
 *
 * @module components/layout/PageShell
 */
import type { ReactNode, JSX } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SECTION_BG } from '@/lib/constants/theme'

export interface PageShellProps {
  /** Page content rendered between the Navbar and Footer. */
  children: ReactNode
}

/**
 * Standard page container wrapping Navbar, main scrollable body content, and Footer.
 *
 * @param props - Component props containing child nodes
 * @returns Rendered page layout wrapper
 */
export function PageShell({ children }: PageShellProps): JSX.Element {
  return (
    <div className="relative min-h-screen bg-background text-slate-900">
      {/* Engineering grid. Pattern is defined by `.grid-bg` in globals.css. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-70" />

      {/* Cyan wash behind the hero with lightweight radial gradient (zero GPU blur overhead for mobile 60/120fps) */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-a) 0%, transparent 70%)' }}
      />

      {/* Blue wash anchored to the bottom-right corner */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[380px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-b) 0%, transparent 70%)' }}
      />

      <Navbar />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  )
}
