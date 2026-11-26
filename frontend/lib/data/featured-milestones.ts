/**
 * Featured News Data Store — NEVOLYN Technology.
 *
 * Single source of truth for the major high-impact institutional announcements, news, and prototype breakthroughs.
 * Rendered in the continuous auto-scrolling stream within `LatestNewsSection.tsx`.
 *
 * Chronological order (latest first):
 * 1. Bangladesh AI Business Summit 2026 — Selected to Showcase (2026-10-20)
 * 2. Bangladesh Innovation Fair 2026 — Award / Prize Recognition (2026-09-14)
 * 3. Strategic NDA Signed with Axentec PLC / Robi Axiata (2026-09-09)
 * 4. First FABINS Prototype Showcased at BUET IRAB (2026-07-21)
 * 5. Strategic Partnership with Saturn Textiles & Saturn R&D (2026-07-01)
 *
 * @module lib/data/featured-milestones
 */

export interface FeaturedMilestone {
  /** Unique identifier — used as React list key and anchor link. */
  id: string
  /** Headline title of the featured news. */
  title: string
  /** High-impact 1-2 sentence summary for preview card. */
  description: string
  /**
   * Full announcement text for detail modal.
   *
   * Paragraphs are separated by a blank line (`\n\n`). A paragraph that contains
   * `Website:` and/or `Email:` lines is rendered by `NewsDetailModal.tsx` as a
   * contact card (title = first line, email button on the left, website on the right).
   *
   * Standard closing contact blocks (keep this exact format in every news item):
   *
   *   FABINS - Fabric Inspection Automation
   *   Website: https://fabins.nevolyn.com
   *   Email: fabins@nevolyn.com
   *
   *   NEVOLYN Technology
   *   Website: https://nevolyn.com
   *   Email: info@nevolyn.com
   *
   * The modal reads the email from the `Email:` line, so a news item without that
   * line will show only the website button.
   */
  content: string
  /** Category tag classification. */
  category: string
  /** ISO publication date string (YYYY-MM-DD). */
  date: string
  /** Specific path to image asset in `/public`. */
  image: string
  /** Optional secondary image shown in detail view. */
  secondaryImage?: string
  /** Optional list of all media gallery images for detail view. */
  images?: string[]
  /** Direct link to LinkedIn post or company page. */
  linkedinUrl: string
  /** Direct link to Facebook post or page. */
  facebookUrl: string
}

/** Featured News type alias */
export type FeaturedNews = FeaturedMilestone

/**
 * Featured News items ordered latest-to-earliest with distinct authentic images from `/public`.
 */
export const featuredMilestones: FeaturedMilestone[] = [
  {
    id: 'news-dcci-ai-summit-2026',
    title: 'Bangladesh AI Business Summit 2026 - Selected to Showcase',
    description:
      'FABINS was selected to showcase its AI inspection solution at the Bangladesh AI Business Summit 2026, jointly organized by DCCI & MoST.',
    content:
      'A Proud Milestone for FABINS - Fabric Inspection Automation\n\nWe are proud to share that FABINS has been selected to showcase its innovative solution at the Bangladesh AI Business Summit 2026, jointly organized by the Dhaka Chamber of Commerce & Industry (DCCI) and the Ministry of Science and Technology (MoST), Government of Bangladesh.\n\nThis recognition marks an important milestone in our journey to transform traditional fabric inspection through AI-powered computer vision and industrial automation.\n\nAs a product of NEVOLYN, FABINS aims to make fabric inspection smarter, more accurate, and more efficient for the textile and Ready-Made Garment (RMG) industry.\n\nWe are excited to showcase our innovation at this prestigious summit and contribute to the advancement of AI-driven industrial solutions in Bangladesh.\n\nSelected to Showcase | Bangladesh AI Business Summit 2026\nInnovation: AI-Powered Fabric Inspection Automation\nDate: November 5, 2026\nVenue: Bangladesh-China Friendship Conference Centre (BCFCC), Dhaka\n\nFABINS | Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'AI Summit Showcase',
    date: '2026-10-20',
    image: '/news_fabinsXdcci.jpg',
    secondaryImage: '/news_fabinsXdcci01.jpg',
    images: [
      '/news_fabinsXdcci.jpg',
      '/news_fabinsXdcci01.jpg',
      '/news_fabinsXdcci02.jpg',
      '/news_fabinsXdcci03.jpg',
      '/news_fabinsXdcci04.jpg',
    ],
    linkedinUrl:
      'https://www.linkedin.com/feed/update/urn:li:activity:7518267793624969217',
    facebookUrl: 'https://www.facebook.com/share/p/19xgeHqdiE/',
  },
  {
    id: 'milestone-fair-award',
    title: 'Bangladesh Innovation Fair 2026 - Award & Prize Recognition',
    description:
      'FABINS was selected among the Top 50 Innovations out of 950+ innovations and awarded at the official ceremony with prize recognition.',
    content:
      'A Proud Milestone for NEVOLYN & FABINS - Fabric Inspection Automation\n\nWe are proud to share that FABINS has been selected among the Top 50 Innovations out of 950+ innovations at the Bangladesh Innovation Fair 2026.\n\nFABINS has been showcased at the fair, and being recognized among the Top 50 innovations is a truly meaningful achievement for our team.\n\nThe Top 50 recognition was celebrated through an award-giving ceremony, marking another important step in our journey from innovation and prototype development toward real-world impact.\n\nWe are grateful for this recognition and proud to represent Bangladeshi innovation, AI, and automation through FABINS.\n\nInnovation Hub | Bangladesh Innovation Fair 2026\nTop 50 Innovations / 950+ Innovations\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Award & Prize',
    date: '2026-09-14',
    image: '/news_fabinsXfair02.jpg',
    secondaryImage: '/news_fabinsXfair03.jpg',
    images: ['/news_fabinsXfair02.jpg', '/news_fabinsXfair03.jpg'],
    linkedinUrl:
      'https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-bangladeshinnovationfair2026-activity-7508553026446512128-zo3h?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk',
    facebookUrl: 'https://www.facebook.com/share/p/1Dic4Zk1C1/',
  },
  {
    id: 'milestone-axentec-nda',
    title: 'Strategic NDA Signed with Axentec PLC (A Robi Axiata Company)',
    description:
      'Axentec PLC signed an NDA with FABINS, opening discussions with senior technical leadership including CTOs for future collaboration.',
    content:
      'A New Step Toward Collaboration with Axentec PLC\n\nWe’re pleased to share that Axentec PLC, a Robi Axiata company, has signed a Non-Disclosure Agreement (NDA) with FABINS, opening the way for further discussions and potential future collaboration.\n\nWe had the opportunity to meet with the senior technical and business leadership teams of Robi and Axentec, including their CTOs, to discuss FABINS, its technology, and possible areas of collaboration.\n\nWe are especially grateful to Md. Adil Hossain Noble, Managing Director & CEO of Axentec PLC, for the referral and for helping connect us with the right team.\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Corporate Partnership',
    date: '2026-09-09',
    image: '/news_fabinsXexentec.jpg',
    linkedinUrl:
      'https://www.linkedin.com/posts/nevolyn_nevolyn-fabins-fabricinspection-activity-7508471434042785792-6YqT?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk',
    facebookUrl: 'https://www.facebook.com/share/p/1KFM2uWrgb/',
  },
  {
    id: 'milestone-buet-irab-showcase',
    title: 'First FABINS Prototype Showcased at BUET IRAB',
    description:
      'First FABINS prototype provided to IRAB BUET for an exclusive one-week project showcase following request from Department of EEE, BUET.',
    content:
      'Our first FABINS prototype was provided to IRAB (Institution of Robotics and Automation, BUET) for project showcasing, following a request from the Department of EEE, BUET.\n\nThe prototype was showcased for one week, marking another meaningful step in our journey.\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Academic Showcase',
    date: '2026-07-21',
    image: '/news_fabinsXbuet.jpg',
    linkedinUrl:
      'https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-fabricinspection-activity-7508466089102643200-nWOb?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk',
    facebookUrl: 'https://www.facebook.com/share/p/1ExQkVx3WH/',
  },
  {
    id: 'milestone-saturn-partnership',
    title: 'Strategic Partnership with Saturn Textiles & Saturn R&D',
    description:
      'FABINS officially established a strategic partnership with Saturn R&D as our first client and collaborator to advance from prototype to production.',
    content:
      'A New Chapter for FABINS & NEVOLYN \n\nWe are proud to announce our official strategic partnership with Saturn R&D marking an important milestone in the journey of FABINS.\n\nSaturn Textiles and Saturn R&D is not only our first client and collaborator, but also a key partner in helping us take FABINS from a working prototype toward a real-world industrial solution. Their support has given us the opportunity to continue building, testing, and improving our technology.\n\nWe are truly grateful to the Saturn Textiles Limited team for believing in our vision and supporting us from the early stage of this journey.\n\nWe are looking forward to building smarter solutions for the textile industry and creating real-world impact through AI, computer vision, and automation.\n\nFABINS — Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Strategic Partnership',
    date: '2026-07-01',
    image: '/news_fabinsXsaturn.jpg',
    linkedinUrl:
      'https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-fabricinspection-activity-7508463008101056512-7NoV?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk',
    facebookUrl: 'https://www.facebook.com/share/p/1Cu2GnNnWQ/',
  },
]

/** Alias export for code referencing featuredNews */
export const featuredNews = featuredMilestones

