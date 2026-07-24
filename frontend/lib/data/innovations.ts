/**
 * Active/completed R&D projects shown on the Projects page.
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
 *   category: 'Smart Textiles',
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
}

export const projects: Project[] = [
  {
    id: 'fabins',
    title: 'FABINS - Fabric Inspection Automation',
    description: 'An intelligent real-time fabric fault detection system utilizing computer vision models, high-resolution camera integration, and automated industrial defect classification.',
    status: 'active',
    technologies: ['Machine Learning', 'Computer Vision (YOLOv8)', 'Spring Boot & Java', 'Hikrobot SDK', 'React & Next.js', 'FastAPI & Node.js'],
    startDate: '2026-01-15',
    category: 'Industrial AI',
  },
]
