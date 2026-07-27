/**
 * Root layout — applies to every page in the application.
 *
 * Sets up:
 * - Global metadata (title, description, OpenGraph, favicon, keywords)
 * - Viewport settings and theme color
 * - Global CSS (`globals.css` — Tailwind + design tokens)
 * - The ambient background (grid + glow blobs behind all content)
 * - The `<Providers>` wrapper (context providers)
 * - Vercel Analytics (production only)
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
 * @module app/layout
 */
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Saturn Textiles R&D',
  description: 'Pioneering research and development in advanced textile technologies. Discover our innovations in sustainable materials, smart textiles, and high-performance fabrics.',
  keywords: ['textiles', 'R&D', 'innovation', 'materials', 'research', 'sustainable'],
  openGraph: {
    title: 'Saturn Textiles R&D',
    description: 'Pioneering textile innovation through cutting-edge research',
    type: 'website',
  },
  icons: {
    icon: '/saturn-icon.png',
    apple: '/saturn-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#0b1f3a',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-colors duration-500">
        {/* Ambient background — fixed, behind all content, pointer-events disabled */}
        <div className="fixed inset-0 -z-50 pointer-events-none">
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-25 dark:opacity-40 [background-image:linear-gradient(rgba(57,120,206,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(57,120,206,0.12)_1px,transparent_1px)] [background-size:48px_48px]" />
          {/* Left glow */}
          <div className="absolute -left-40 top-20 h-[32rem] w-[32rem] rounded-full bg-blue-700/10 dark:bg-blue-700/15 blur-[120px]" />
          {/* Right glow */}
          <div className="absolute right-0 top-24 h-[28rem] w-[28rem] rounded-full bg-orange-600/10 blur-[120px]" />
        </div>

        <Providers>
          {children}
          {/* Analytics are only injected in production builds */}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
