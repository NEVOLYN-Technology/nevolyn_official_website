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
    description:
      'AI-powered automated fabric defect detection system using high-resolution industrial cameras and real-time computer vision for instant quality classification.',
    status: 'active',
    technologies: [
      'Machine Learning',
      'Computer Vision (YOLOv8)',
      'Spring Boot & Java',
      'Hikrobot SDK',
      'React & Next.js',
      'FastAPI & Node.js',
    ],
    startDate: '2026-01-15',
    category: 'Industrial AI',
  },

  {
    id: 'rnd-website',
    title: 'Saturn Textiles R&D Department Website',
    description:
      'Official digital portal for Saturn Textiles R&D, highlighting active research projects, innovation showcases, engineering team profiles, and technical publications.',
    status: 'completed',
    technologies: [
      'Next.js',
      'React',
      'TypeScript',
      'Spring Boot',
      'Rest API',
      'PostgreSQL',
      'Tailwind CSS',
      'Responsive UI/UX',
    ],
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    category: 'Software Development',
  },

  {
    id: 'portfolio-website',
    title: 'FABINS - Product Portfolio',
    description:
      'Centralized interactive product portfolio for FABINS, showcasing hardware architecture, AI vision models, system specifications, and live deployment workflows.',
    status: 'completed',
    technologies: [
      'Next.js',
      'React',
      'TypeScript',
      'Spring Boot',
      'Rest API',
      'PostgreSQL',
      'Tailwind CSS',
      'Responsive UI/UX',
    ],
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    category: 'Product Development',
  },
  {
    id: 'ai-meeting-minutes',
    title: 'AI Meeting Minutes Generator',
    description:
      'Automated meeting intelligence platform that transcribes discussions, extracts key action items, and delivers instant structured summaries across departments.',
    status: 'planning',
    technologies: [
      'OpenAI Whisper',
      'GPT API',
      'Python',
      'Streamlit',
      'WhatsApp Integration',
    ],
    category: 'Artificial Intelligence',
    startDate: '2026-08-01',
  },
]