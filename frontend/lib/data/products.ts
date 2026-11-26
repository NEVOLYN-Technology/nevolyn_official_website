/**
 * Active/completed NEVOLYN Technology projects shown on the Projects page.
 *
 * ## How to add a new project
 *
 * Append an object matching `Project` to the array below.
 *
 * ```ts
 * {
 *   id: '7',
 *   title: 'Project name',
 *   description: 'One to two sentences describing the project.',
 *   status: 'planning',       // 'active' | 'planning' | 'completed'
 *   technologies: ['Chemistry', 'AI/ML'],
 *   startDate: '2024-01-15',  // ISO date string
 *   category: 'Industrial Automation',
 * }
 * ```
 */
export interface Project {
  /** Unique identifier — used as the React list key (e.g. 'fabins'). */
  id: string

  /** Display title of the project. */
  title: string

  /** Comprehensive summary of project goals and implementation. */
  description: string

  /** Current lifecycle phase — drives status badge tone ('active' | 'planning' | 'completed'). */
  status: 'active' | 'planning' | 'completed'

  /** Technology stack and engineering domain tags. */
  technologies: string[]

  /** ISO date string (YYYY-MM-DD) indicating when project commenced. */
  startDate: string

  /** Optional ISO date string indicating when project concluded. */
  endDate?: string

  /** Optional project preview graphic path (relative to /public). */
  image?: string

  /** Category grouping tag for UI filtering (e.g. 'Industrial AI'). */
  category: string

  /** Optional external link to live product / website. */
  url?: string

  /** Optional contact email address. */
  email?: string

  /** Optional descriptive CTA button label. */
  actionLabel?: string

  /** Optional website logo image URL. */
  websiteLogo?: string
}

export const projects: Project[] = [
  {
    id: 'fabins',
    title: 'FABINS - Fabric Inspection Automation',
    description:
      'AI-powered automated fabric defect detection system using high-resolution industrial cameras and real-time computer vision for instant quality classification.',
    status: 'active',
    technologies: [
      'Machine Learning',
      'Computer Vision (YOLOv8)',
      'Spring Boot & Java',
      'React & Next.js',
      'FastAPI & Node.js',
    ],
    startDate: '2026-01-15',
    category: 'Industrial AI',
    url: 'https://fabins.nevolyn.com/',
    email: 'fabins@nevolyn.com',
    image: '/fabins-machine.png',
    websiteLogo: '/fabins-logo.png',
    actionLabel: 'FABINS Automation',
  },
]