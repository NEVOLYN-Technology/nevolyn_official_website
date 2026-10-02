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
import { ThemeProvider } from '@/components/providers/ThemeProvider'
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
  width: 'device-width',
  initialScale: 1,
  themeColor: '#eef1f5',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(nevolynJsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
