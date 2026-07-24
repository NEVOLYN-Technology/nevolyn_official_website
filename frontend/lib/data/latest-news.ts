/**
 * News & announcement posts shown on the News section of the Saturn R&D Portfolio.
 *
 * Single source of truth for news timeline.
 * 5 news items total, ordered latest first, top 2 marked as featured.
 *
 * @module lib/data/latest-news
 */

/** Represents a single news milestone or institutional announcement. */
export interface NewsItem {
  /** Unique identifier — used as React list key. */
  id: string
  /** Headline title of the milestone. */
  title: string
  /** Short 1-2 sentence preview description for card layout. */
  description: string
  /** Full announcement body content. */
  content: string
  /** Category tag (e.g. 'Institutional Funding', 'R&D Execution'). */
  category: string
  /** ISO date string (YYYY-MM-DD) of publication. */
  date: string
  /** Authoring team or executive board entity. */
  author: string
  /** Optional news thumbnail image path (relative to /public). */
  image?: string
  /** Optional flag marking milestone as featured (promotes to top grid). */
  featured?: boolean
}

export const news: NewsItem[] = [
  {
    id: '1',
    title: 'Saturn R&D Secures Full Capital & Resource Approval for FABINS',
    description: 'Executive Board officially approves comprehensive funding and infrastructure allocation for full-scale FABINS deployment.',
    content: 'On July 3, 2026, the Executive Board of Saturn officially approved complete capital and operational funding for the FABINS automated fabric inspection platform. This milestone secures long-term R&D resources, high-speed camera infrastructure, model training hardware, and engineering expansion.',
    category: 'Institutional Funding',
    date: '2026-07-03',
    author: 'Saturn Executive Board',
    featured: true,
  },
  {
    id: '2',
    title: 'Saturn Engineering Commences Phase-1 System Integration',
    description: 'R&D engineering team officially initiates core computer vision pipeline training and industrial Hikrobot SDK integration.',
    content: 'On June 30, 2026, Saturn R&D engineering officially commenced Phase-1 technical implementation for FABINS. Work focuses on fine-tuning YOLO defect detection algorithms, integrating Hikrobot industrial camera SDKs, and engineering the real-time web dashboard architecture.',
    category: 'R&D Execution',
    date: '2026-06-30',
    author: 'Saturn R&D Engineering',
    featured: true,
  },
  {
    id: '3',
    title: 'Live FABINS Prototype Demonstration Presented to Executive Board',
    description: 'Live operational demonstration showcased real-time fabric fault classification and automated industrial camera triggers.',
    content: 'The Saturn R&D team presented an active live demonstration of the FABINS prototype to company executives on June 24, 2026. The demonstration successfully validated high-speed fabric defect classification, real-time bounding box annotations, and zero-latency Hikrobot camera trigger response.',
    category: 'Milestone Demo',
    date: '2026-06-24',
    author: 'Saturn R&D Team',
  },
  {
    id: '4',
    title: 'First Capital Allocation Approved for Hikrobot Hardware & GPU Cluster',
    description: 'Secured initial R&D funding for high-speed Hikrobot camera acquisition, optical setup, and GPU workstation setup.',
    content: 'On April 27, 2026, Saturn R&D secured its initial capital allocation dedicated to hardware acquisition. This funding enabled the procurement of high-resolution Hikrobot industrial cameras, specialized optical lenses, and high-throughput GPU workstations for model training.',
    category: 'Hardware Procurement',
    date: '2026-04-27',
    author: 'Saturn R&D Management',
  },
  {
    id: '5',
    title: 'Saturn R&D Unveils Strategic Vision for Automated Fabric Inspection',
    description: 'Initial R&D pitch submitted outlining AI-driven fabric inspection to revolutionize industrial quality assurance standards.',
    content: 'The core vision for FABINS was officially formulated and submitted to Saturn leadership in mid-January 2026. The strategic proposal outlined an automated computer vision inspection platform designed to replace manual fabric defect review with real-time AI precision.',
    category: 'Strategic Vision',
    date: '2026-01-15',
    author: 'Lead AI Systems Engineers',
  },
]
