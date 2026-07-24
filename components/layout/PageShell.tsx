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
    <main>
      <Navbar />
      <div className="pt-28 min-h-screen">{children}</div>
      <Footer />
    </main>
  )
}
