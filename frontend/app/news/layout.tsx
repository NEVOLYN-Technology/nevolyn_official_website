import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { NEVOLYN_SEO_CONFIG } from '@/lib/seo/config'
import { news } from '@/lib/data/news'
import { featuredMilestones } from '@/lib/data/featured-milestones'

/**
 * High-authority Google SEO & Social Graph Metadata for NEVOLYN News & Milestones Archive.
 *
 * Targets exhaustive user search patterns:
 * - "nevolyn news", "nevolyn updates", "nevolyn milestones", "nevolyn announcements"
 * - "nevolyn partnerships", "nevolyn awards", "fabins news", "fabins updates"
 * - "bangladesh innovation fair 2026 nevolyn", "global change award fabins", "dcci ai summit fabins"
 * - Bengali transliterations: "নেভোলিন সংবাদ", "নেভোলিন আপডেট", "ফেবিন্স সংবাদ"
 */
export const metadata: Metadata = {
  title: {
    absolute: 'News & Milestones | NEVOLYN',
  },
  description:
    'Explore official announcements, industrial partnerships, technology breakthroughs, and award recognitions from NEVOLYN Technology & FABINS.',
  keywords: [
    // ── Primary English News & Update Queries ──
    'nevolyn featured news',
    'featured news',
    'nevolyn news',
    'nevolyn updates',
    'nevolyn milestones',
    'nevolyn announcements',
    'nevolyn press release',
    'nevolyn press',
    'nevolyn media',
    'nevolyn awards',
    'nevolyn partnerships',
    'nevolyn technology news',
    // ── Key Milestone & Event Queries ──
    'fabins news',
    'fabins updates',
    'fabins milestones',
    'global change award 2027 fabins',
    'bangladesh ai business summit fabins',
    'bangladesh innovation fair 2026 fabins',
    'axentec nda nevolyn',
    'saturn textiles fabins partnership',
    'buet irab fabins',
    'nsu startups next fabins',
    // ── Bengali Script News Queries ──
    'নেভোলিন সংবাদ',
    'নেভোলিন আপডেট',
    'নেভোলিন খবর',
    'নেভোলিন মাইলফলক',
    'নেভোলিন প্রেস রিলিজ',
    'ফেবিন্স সংবাদ',
    'ফেবিন্স আপডেট',
    'ফেবিন্স ইনোভেশন ফেয়ার',
  ],
  alternates: {
    canonical: 'https://nevolyn.com/news',
  },
  openGraph: {
    title: 'News & Milestones | NEVOLYN',
    description:
      'Official announcements, industrial partnerships and technology breakthroughs',
    url: 'https://nevolyn.com/news',
    siteName: 'NEVOLYN Technology',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/nevolyn-logo.png',
        width: 1200,
        height: 630,
        alt: 'NEVOLYN News & Milestones',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News & Milestones | NEVOLYN',
    description:
      'Official announcements, industrial partnerships and technology breakthroughs',
    images: ['/nevolyn-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

/**
 * Builds Schema.org JSON-LD Structured Data for Google Search Indexing.
 */
function buildNewsSchemaJsonLd() {
  const allArticles = [...featuredMilestones, ...news]

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://nevolyn.com/news#webpage',
        url: 'https://nevolyn.com/news',
        name: 'NEVOLYN News, Institutional Milestones & Press Releases',
        description:
          'Official chronological archive of announcements, achievements, and technology breakthroughs by NEVOLYN Technology.',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${NEVOLYN_SEO_CONFIG.siteUrl}/#website`,
          name: 'NEVOLYN Technology',
          url: NEVOLYN_SEO_CONFIG.siteUrl,
        },
        about: {
          '@type': 'Organization',
          '@id': `${NEVOLYN_SEO_CONFIG.siteUrl}/#organization`,
          name: 'NEVOLYN Technology',
          url: NEVOLYN_SEO_CONFIG.siteUrl,
        },
        hasPart: allArticles.slice(0, 10).map((item) => ({
          '@type': 'NewsArticle',
          headline: item.title,
          description: item.description,
          datePublished: item.date,
          ...(item.image ? { image: `https://nevolyn.com${item.image}` } : {}),
          url: `https://nevolyn.com/news#news/${item.id}`,
          publisher: {
            '@type': 'Organization',
            name: 'NEVOLYN Technology',
            url: 'https://nevolyn.com',
            logo: 'https://nevolyn.com/nevolyn-logo.png',
          },
        })),
        inLanguage: ['en', 'bn'],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://nevolyn.com/news#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://nevolyn.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'News & Milestones',
            item: 'https://nevolyn.com/news',
          },
        ],
      },
    ],
  }
}

export default function NewsLayout({ children }: { children: ReactNode }) {
  const jsonLd = buildNewsSchemaJsonLd()

  return (
    <>
      {/* Schema.org Structured Data for Google News & Search Indexing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
