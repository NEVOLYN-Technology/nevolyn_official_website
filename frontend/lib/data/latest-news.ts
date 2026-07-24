/**
 * Recent News & Updates Data Store — Saturn R&D Portfolio.
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
    title: 'Saturn R&D Expands AI Systems Engineering Team',
    description:
      'Appointed Lead AI Systems Engineer and Lead AI Software Engineer to spearhead industrial automation and intelligent textile research.',
    content:
      'On July 1, 2026, Saturn Textiles Limited expanded its Research & Development Department through the official appointment of a Lead AI Systems Engineer and a Lead AI Software Engineer. These appointments strengthened the department’s capabilities in industrial automation, intelligent manufacturing, and AI-powered textile innovation.',
    category: 'Team Expansion',
    date: '2026-07-01',
    author: 'Saturn R&D Management',
  },

  {
    id: 'news-2',
    title: 'FABINS Project Funding & R&D Capital Approved',
    description:
      'Executive board approved full financial allocation, enabling Saturn R&D to initiate hardware assembly and software platform development.',
    content:
      'On February 24, 2026, Saturn Textiles Limited officially approved and signed the funding allocation for the FABINS project. With the required financial and organizational support in place, the Research & Development Department formally commenced development of the AI-powered fabric inspection platform.',
    category: 'Project Funding',
    date: '2026-02-24',
    author: 'Saturn R&D Management',
  },

  {
    id: 'news-3',
    title: 'FABINS AI Vision Approved & R&D Initiative Launched',
    description:
      'Saturn R&D Management presented the FABINS concept to Managing Director, securing formal executive approval to launch Saturn’s AI fabric inspection initiative.',
    content:
      'On January 15, 2026, Lead AI Systems Engineer Md Rahinur Rahman presented the FABINS concept to Managing Director Amanullah Chagla. Following executive approval, Saturn Textiles R&D officially launched the industrial AI initiative to modernize fabric quality inspection using computer vision.',
    category: 'Strategic Vision',
    date: '2026-01-15',
    author: 'Saturn R&D Management',
  },
]