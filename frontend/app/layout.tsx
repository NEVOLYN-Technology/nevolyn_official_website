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
import { NEVOLYN_SEO_CONFIG, nevolynJsonLd } from '@/lib/seo/config'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(NEVOLYN_SEO_CONFIG.siteUrl),
  title: {
    default: NEVOLYN_SEO_CONFIG.title,
    template: '%s | NEVOLYN Technology',
  },
  description: NEVOLYN_SEO_CONFIG.description,
  keywords: [...NEVOLYN_SEO_CONFIG.keywords],
  authors: [{ name: 'NEVOLYN Technology', url: NEVOLYN_SEO_CONFIG.siteUrl }],
  creator: 'NEVOLYN Technology',
  publisher: 'NEVOLYN Technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: NEVOLYN_SEO_CONFIG.siteUrl,
    siteName: 'NEVOLYN Technology',
    title: NEVOLYN_SEO_CONFIG.title,
    description: NEVOLYN_SEO_CONFIG.description,
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
    title: NEVOLYN_SEO_CONFIG.title,
    description: NEVOLYN_SEO_CONFIG.description,
    images: ['/nevolyn-logo.png'],
  },
  icons: {
    icon: '/nevolyn-icon.png',
    apple: '/nevolyn-icon.png',
  },
  verification: {
    google: 'vzbTJSa6lso2s74DPf_itEshA7SPnSNE2As5Jg4N2iM',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#eef1f5',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background">
      <body className="antialiased bg-background text-slate-900 overflow-x-hidden selection:bg-sky-500 selection:text-white">
        {/* Ambient colorful atmospheric background — fixed, behind all content */}
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden [contain:paint]">
          {/* Technical precision grid overlay */}
          <div className="absolute inset-0 grid-bg opacity-40" />
          {/* Top ambient soft sky-blue & cyan glow */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 h-[380px] w-[540px] sm:h-[520px] sm:w-[950px] max-w-[100vw] rounded-full bg-gradient-to-b from-sky-400/25 via-blue-400/18 via-indigo-300/12 to-transparent blur-3xl sm:blur-[140px] transform-gpu will-change-transform" />
          {/* Vibrant mint/emerald ambient glow on left (desktop) */}
          <div className="hidden sm:block absolute top-[22%] -left-28 h-[460px] w-[460px] rounded-full bg-gradient-to-tr from-emerald-400/16 to-teal-300/12 blur-[140px] transform-gpu" />
          {/* Warm radiant violet/rose glow on right (desktop) */}
          <div className="hidden sm:block absolute top-[48%] -right-28 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-purple-400/15 via-pink-400/12 to-rose-400/10 blur-[150px] transform-gpu" />
          {/* Soft warm amber highlight (desktop) */}
          <div className="hidden sm:block absolute top-[70%] left-[10%] h-[380px] w-[380px] rounded-full bg-amber-400/10 blur-[140px] transform-gpu" />
          {/* Bottom soft cyan & ocean azure glow */}
          <div className="absolute -bottom-24 right-1/4 h-[320px] w-[380px] sm:h-[440px] sm:w-[540px] max-w-[100vw] rounded-full bg-gradient-to-t from-sky-400/20 via-cyan-400/14 to-transparent blur-3xl sm:blur-[150px] transform-gpu" />
        </div>

        <Providers>
          {/* Schema.org Organization & Product Rich Snippet Graph */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(nevolynJsonLd) }}
          />
          {children}
          {/* Analytics are only injected in production builds */}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
