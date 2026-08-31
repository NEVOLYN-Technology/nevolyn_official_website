/**
 * Recent News & Updates Data Store — NEVOLYN Technology.
 *
 * Single source of truth for chronological news timeline updates.
 * Rendered in the Recent Updates list section within `LatestNewsSection.tsx`.
 *
 * ## Data Management Guidelines
 * - IDs are formatted as `news-1`, `news-2`, etc.
 * - Items are ordered by publication date (`date`) in descending order.
 * - Maintain non-redundant, executive-grade title and description copy.
 *
 * @module lib/data/latest-news
 */

/**
 * Represents a single news timeline entry or institutional update.
 */
export interface NewsItem {
  /** Unique identifier — used as React list key and anchor link. */
  id: string
  /** Headline title of the news item. */
  title: string
  /** Short 1-2 sentence preview description for timeline card. */
  description: string
  /** Full announcement text for detail modal or article view. */
  content: string
  /** Category tag classification (e.g. 'Team Expansion', 'Project Funding', 'Strategic Vision'). */
  category: string
  /** ISO publication date string (YYYY-MM-DD). */
  date: string
  /** Publishing division or management body. */
  author: string
  /** Optional relative path to thumbnail image asset in `/public`. */
  image?: string
}

/**
 * Chronological news update feed ordered latest-first.
 */
export const news: NewsItem[] = [
  {
    id: 'news-1',
    title: 'NEVOLYN Technology Expands AI Engineering Team',
    description:
      'Appointed Lead AI Systems Engineer and Lead AI Software Engineer to spearhead industrial automation, intelligent systems, and AI-powered engineering innovation.',
    content:
      'NEVOLYN Technology expanded its engineering capabilities through the official appointment of a Lead AI Systems Engineer and a Lead AI Software Engineer. These appointments strengthened the team\'s capabilities in industrial automation, intelligent systems, and AI-powered engineering innovation.',
    category: 'Team Expansion',
    date: '2026-07-01',
    author: 'NEVOLYN Management',
  },

  {
    id: 'news-2',
    title: 'FABINS Project Funding & Development Capital Approved',
    description:
      'Executive leadership approved full financial allocation, enabling NEVOLYN to initiate hardware assembly and software platform development for FABINS.',
    content:
      'NEVOLYN Technology officially approved and signed the funding allocation for the FABINS project. With the required financial and organizational support in place, the engineering team formally commenced development of the AI-powered fabric inspection platform.',
    category: 'Project Funding',
    date: '2026-02-24',
    author: 'NEVOLYN Management',
  },

  {
    id: 'news-3',
    title: 'FABINS AI Vision Initiative Approved & Launched',
    description:
      'NEVOLYN leadership presented the FABINS concept to Managing Director, securing formal executive approval to launch the AI fabric inspection initiative.',
    content:
      'Md Rahinur Rahman presented the FABINS concept to Managing Director Amanullah Chagla. Following executive approval, NEVOLYN Technology officially launched the industrial AI initiative to modernize fabric quality inspection using computer vision.',
    category: 'Strategic Vision',
    date: '2026-01-15',
    author: 'NEVOLYN Management',
  },
]