import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { NEVOLYN_SEO_CONFIG } from '@/lib/seo/config'
import { allTeamMembers } from '@/lib/data/team'

/**
 * High-authority Google SEO & Social Graph Metadata for NEVOLYN Team & Leadership page.
 *
 * Targets exhaustive user search patterns:
 * - "nevolyn team", "nevolyn leadership", "nevolyn employees", "nevolyn directors", "nevolyn founders"
 * - "chagla amanullah", "md lutfar rahman", "nevolyn engineers", "nevolyn software architects"
 * - "fabins team", "fabins leadership", "nevolyn technology team"
 * - Bengali transliterations: "নেভোলিন টিম", "নেভোলিন লিডারশিপ", "নেভোলিন ডিরেক্টর"
 */
export const metadata: Metadata = {
  title: {
    absolute: 'Our Team | NEVOLYN',
  },
  description:
    'Meet the full team of innovators, research scientists, software architects, and deep-tech engineers behind NEVOLYN',
  keywords: [
    // ── Primary English Team & Leadership Queries ──
    'nevolyn team',
    'team nevolyn',
    'nevolyn leadership',
    'leadership nevolyn',
    'nevolyn leaders',
    'leaders nevolyn',
    'nevolyn employees',
    'employees nevolyn',
    'nevolyn staff',
    'nevolyn people',
    'nevolyn founders',
    'founders nevolyn',
    'nevolyn directors',
    'nevolyn executive board',
    'nevolyn management',
    'nevolyn managing director',
    // ── Key Individuals & Leadership Names ──
    'chagla amanullah',
    'chagla amanullah nevolyn',
    'md lutfar rahman',
    'md lutfar rahman nevolyn',
    'lutfar rahman nevolyn',
    // ── Engineering & Tech Roles ──
    'nevolyn engineers',
    'nevolyn software engineers',
    'nevolyn software architects',
    'nevolyn ai researchers',
    'nevolyn machine learning engineers',
    'nevolyn automation engineers',
    'nevolyn robotics team',
    'nevolyn tech team',
    // ── FABINS Counterpart Entity Queries ──
    'fabins team',
    'fabins leadership',
    'fabins engineers',
    'fabins researchers',
    'fabins founders',
    'team fabins',
    // ── Bengali Script Team & Leadership Search Terms ──
    'নেভোলিন টিম',
    'টিম নেভোলিন',
    'নেভোলিন লিডারশিপ',
    'নেভোলিন ডিরেক্টর',
    'নেভোলিন প্রতিষ্ঠাতা',
    'নেভোলিন ইঞ্জিনিয়ার',
    'নেভোলিন কর্মকর্তা',
    'নেভোলিন কর্মী',
    'চাগলা আমানুল্লাহ',
    'লুৎফর রহমান নেভোলিন',
    'ফেবিন্স টিম',
    'ফেবিন্স লিডারশিপ',
  ],
  alternates: {
    canonical: 'https://nevolyn.com/team',
  },
  openGraph: {
    title: 'Our Team | NEVOLYN',
    description:
      'Meet the leadership, researchers, and engineers driving industrial AI, computer vision, and automation solutions at NEVOLYN Technology & FABINS.',
    url: 'https://nevolyn.com/team',
    siteName: 'NEVOLYN',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/nevolyn-logo.png',
        width: 1200,
        height: 630,
        alt: 'NEVOLYN Team & Leadership',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Team | NEVOLYN',
    description:
      'Meet the leaders, software architects, and AI researchers pioneering sovereign deep-tech solutions at NEVOLYN Technology.',
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
 * Builds Schema.org JSON-LD Structured Data for Google Knowledge Graph & Rich Snippets.
 * Informs Google search crawlers of NEVOLYN's AboutPage and individual team member profiles.
 */
function buildTeamSchemaJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': 'https://nevolyn.com/team#webpage',
        url: 'https://nevolyn.com/team',
        name: 'NEVOLYN Team',
        description:
          'Official team directory and leadership roster of NEVOLYN Technology & FABINS.',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${NEVOLYN_SEO_CONFIG.siteUrl}/#website`,
          name: 'NEVOLYN',
          url: NEVOLYN_SEO_CONFIG.siteUrl,
        },
        about: {
          '@type': 'Organization',
          '@id': `${NEVOLYN_SEO_CONFIG.siteUrl}/#organization`,
          name: 'NEVOLYN',
          url: NEVOLYN_SEO_CONFIG.siteUrl,
          logo: `${NEVOLYN_SEO_CONFIG.siteUrl}/nevolyn-logo.png`,
          employee: allTeamMembers.map((member) => ({
            '@type': 'Person',
            name: member.name,
            jobTitle: member.title,
            description: member.bio,
            ...(member.image ? { image: `https://nevolyn.com${member.image}` } : {}),
            ...(member.social?.linkedin ? { sameAs: [member.social.linkedin] } : {}),
          })),
        },
        inLanguage: ['en', 'bn'],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://nevolyn.com/team#breadcrumb',
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
            name: 'Team & Leadership',
            item: 'https://nevolyn.com/team',
          },
        ],
      },
    ],
  }
}

export default function TeamLayout({ children }: { children: ReactNode }) {
  const jsonLd = buildTeamSchemaJsonLd()

  return (
    <>
      {/* Schema.org Structured Data for Google Search Indexing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
