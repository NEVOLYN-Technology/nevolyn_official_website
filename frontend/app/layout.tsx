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
  metadataBase: new URL('https://nevolyn.com'),
  title: 'NEVOLYN Technology',
  description: 'NEVOLYN Technology — Building the future through advanced AI, computer vision, and industrial automation.',
  keywords: [
    'NEVOLYN',
    'NEVOLYN Technology',
    'deep tech',
    'artificial intelligence',
    'intelligent systems',
    'industrial automation',
    'computer vision',
    'software engineering',
    'FABINS',
    'high performance systems',
  ],
  authors: [{ name: 'NEVOLYN Technology' }],
  creator: 'NEVOLYN Technology',
  publisher: 'NEVOLYN Technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nevolyn.com',
    siteName: 'NEVOLYN Technology',
    title: 'NEVOLYN Technology',
    description: 'Automation and next-generation engineering solutions.',
    images: [
      {
        url: '/nevolyn-logo.png',
        width: 1200,
        height: 630,
        alt: 'NEVOLYN Technology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEVOLYN Technology',
    description: 'Automation and next-generation engineering solutions.',
    images: ['/nevolyn-logo.png'],
  },
  icons: {
    icon: '/nevolyn-icon.png',
    apple: '/nevolyn-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4f6fb',
  userScalable: true,
}

/** Schema.org structured data JSON-LD for rich search engine knowledge graphs. */
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NEVOLYN Technology',
  url: 'https://nevolyn.com',
  logo: 'https://nevolyn.com/nevolyn-logo.png',
  description: 'NEVOLYN Technology is an advanced engineering and deep-tech company building intelligent systems, applied AI, computer vision, and industrial automation platforms.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@nevolyn.com',
    contactType: 'customer support',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth bg-[#ecf1f6]" data-scroll-behavior="smooth">
      <body className="antialiased bg-[#ecf1f6] text-slate-900 overflow-x-hidden selection:bg-sky-500 selection:text-white">
        {/* Ambient colorful atmospheric background — fixed, behind all content */}
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
          {/* Technical precision grid overlay */}
          <div className="absolute inset-0 grid-bg opacity-40" />
          {/* Top ambient soft sky-blue & cyan glow */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 h-[520px] w-[950px] max-w-[100vw] rounded-full bg-gradient-to-b from-sky-400/25 via-blue-400/18 via-indigo-300/12 to-transparent blur-[150px]" />
          {/* Vibrant mint/emerald ambient glow on left */}
          <div className="absolute top-[22%] -left-28 h-[460px] w-[460px] rounded-full bg-gradient-to-tr from-emerald-400/16 to-teal-300/12 blur-[140px]" />
          {/* Warm radiant violet/rose glow on right */}
          <div className="absolute top-[48%] -right-28 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-purple-400/15 via-pink-400/12 to-rose-400/10 blur-[150px]" />
          {/* Soft warm amber highlight */}
          <div className="absolute top-[70%] left-[10%] h-[380px] w-[380px] rounded-full bg-amber-400/10 blur-[140px]" />
          {/* Bottom soft cyan & ocean azure glow */}
          <div className="absolute -bottom-24 right-1/4 h-[440px] w-[540px] max-w-[100vw] rounded-full bg-gradient-to-t from-sky-400/20 via-cyan-400/14 to-transparent blur-[150px]" />
        </div>

        <Providers>
          {/* Schema.org Organization Rich Snippet */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          {children}
          {/* Analytics are only injected in production builds */}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
