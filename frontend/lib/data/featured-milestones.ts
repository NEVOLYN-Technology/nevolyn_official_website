/**
 * Featured Milestones Data Store — Saturn R&D Portfolio.
 *
 * Single source of truth for high-impact institutional announcements and prototype milestones.
 * Rendered prominently in the 3D horizontal stage carousel within `LatestNewsSection.tsx`.
 *
 * ## Data Management Guidelines
 * - IDs must be unique strings matching sequential order (`milestone-1`, `milestone-2`).
 * - Items are pre-ordered latest-first by publication date (`date`).
 * - Titles and descriptions must be concise, punchy, and non-redundant.
 *
 * @module lib/data/featured-milestones
 */

/**
 * Represents a single featured milestone announcement.
 */
export interface FeaturedMilestone {
  /** Unique identifier — used as React list key and anchor link. */
  id: string
  /** Headline title of the milestone (concise 4-8 words). */
  title: string
  /** High-impact 1-2 sentence summary for 3D card preview. */
  description: string
  /** Full announcement body text for detail view expansion. */
  content: string
  /** Category tag classification (e.g. 'Academic Showcase', 'Prototype Demonstration'). */
  category: string
  /** ISO publication date string (YYYY-MM-DD). */
  date: string
  /** Publishing division or executive leadership entity. */
  author: string
  /** Optional relative path to banner asset in `/public`. */
  image?: string
}

/**
 * Featured milestone collection ordered chronologically by publication date.
 */
export const featuredMilestones: FeaturedMilestone[] = [
  {
    id: 'milestone-1',
    title: 'BUET IRAB Technology Showcase Selection',
    description:
      'Selected for an exclusive week-long exhibition at IRAB BUET to demonstrate industrial AI vision and strengthen high-impact industry-academia collaboration.',
    content:
      'On July 21, 2026, the FABINS (Fabric Inspection Automation System) project was selected for a week-long technology showcase at IRAB (Institute of Robotics and Automation, BUET). Organized through a collaborative initiative between IRAB and the Department of Electrical and Electronic Engineering (EEE), BUET, the showcase highlighted Saturn Textiles R&D’s work in industrial AI and promoted stronger industry–academia collaboration.',
    category: 'Academic Showcase',
    date: '2026-07-21',
    author: 'Saturn R&D Department',
  },

  {
    id: 'milestone-2',
    title: 'FABINS AI Prototype & Defect Inspection POC',
    description:
      'Successfully validated real-time automated fabric flaw detection, camera hardware integration, and deep learning throughput for industrial deployment.',
    content:
      'On June 28, 2026, the Research & Development Department successfully completed and demonstrated the first functional proof of concept (POC) and prototype of FABINS. The demonstration validated real-time fabric defect detection, AI-powered inspection, industrial camera integration, and the overall feasibility of the platform for future production deployment.',
    category: 'Prototype Demonstration',
    date: '2026-06-28',
    author: 'Saturn R&D Department',
  },
]
