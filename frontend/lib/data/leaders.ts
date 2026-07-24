/**
 * Team & leadership content.
 *
 * This is the single source of truth for everyone shown in the
 * "Our Leaders" section on the homepage (`components/sections/LeadersSection.tsx`).
 *
 * ## 📋 Standard Template for Adding a New Team Member
 *
 * When creating or updating a profile entry, follow this exact 6-part structure:
 *
 * 1. `id` — Kebab-case unique slug (e.g. 'ninad', 'rahin', 'jane-doe').
 * 2. `name` & `title` — Full display name and official job title.
 * 3. `bio` — 1 concise sentence summary for the homepage leadership card.
 * 4. `extendedBio` (3-Paragraph Narrative Flow):
 *    - Paragraph 1: Role & Saturn R&D Impact (FABINS, web ecosystem, engineering focus).
 *    - Paragraph 2: Education & Specialization (BUET, EEE/CSE, core theoretical background).
 *    - Paragraph 3: Academic Research & Applied Engineering Accomplishments.
 * 5. `responsibilities` — 4 to 5 bullet points of concrete areas of ownership.
 * 6. `social` — GitHub, LinkedIn, Portfolio, ORCID, and `scholar` + `scholarName` (exact Google Scholar author name).
 *
 * ```ts
 * {
 *   id: 'jane-doe',
 *   name: 'Dr. Jane Doe',
 *   title: 'Senior AI Engineer',
 *   bio: 'Leads computer vision and edge deployment for Saturn R&D.',
 *   extendedBio: [
 *     'Jane leads AI vision systems development at Saturn R&D...',
 *     'She graduated from BUET with a specialization in signal processing...',
 *     'Her academic research focused on autonomous vision systems...'
 *   ],
 *   email: 'jane@example.com',
 *   responsibilities: ['AI model optimization', 'Camera integration'],
 *   social: {
 *     github: 'https://github.com/janedoe',
 *     linkedin: 'https://linkedin.com/in/janedoe',
 *     scholar: 'https://scholar.google.com/citations?user=xyz',
 *     scholarName: 'Jane Doe'
 *   },
 *   image: '/jane-photo.png'
 * }
 * ```
 */

/**
 * Represents a single person's public leadership/engineering profile.
 * 
 * Used by `LeadersSection.tsx` for card rendering and `LeaderDetails.tsx` for full modal views.
 */
export interface TeamMember {
  /** Unique identifier — used as React list key (e.g. 'ninad'). */
  id: string
  /** Full name of the team member. */
  name: string
  /** Official job title (e.g. 'Lead AI Software Engineer'). */
  title: string
  /** Short 1-2 sentence biography shown on the profile card. */
  bio: string
  /** List of key responsibilities and areas of ownership. */
  responsibilities: string[]
  /** Optional multi-paragraph extended bio displayed inside the detail modal. */
  extendedBio?: string[]
  /** Optional contact email address. */
  email?: string
  /** Optional profile image path (relative to /public). */
  image?: string
  /** Optional social and academic profile links. */
  social?: {
    github?: string
    linkedin?: string
    portfolio?: string
    scholar?: string
    scholarName?: string
    orcid?: string
  }
}

/**
 * Represents a functional department or organizational team grouping.
 */
export interface Department {
  /** Unique department ID. */
  id: string
  /** Department display name (e.g. 'Leadership & Research Team'). */
  name: string
  /** One-line department mission description. */
  description: string
  /** List of team members belonging to this department. */
  members: TeamMember[]
}

export const teamDepartments: Department[] = [
  {
    id: 'leadership',
    name: 'Leadership & Research Team',
    description:
      'World-class innovators driving textile technology into the future through AI, materials science, and engineering excellence.',
    members: [
      {
        id: 'chagla',
        name: 'Chagla Amanullah',
        title: 'Managing Director',
        bio: 'Providing strategic direction for Saturn Textiles and guiding the company\'s innovation-led future.',
        responsibilities: [
          'Strategic direction and innovation roadmap',
          'Research team leadership and mentorship',
          'Industry partnerships and collaborations',
          'Grant acquisition and funding strategy',
          'Vision for future textile technologies',
        ],
      },
      {
        id: 'rahin',
        name: 'Md Rahinur Rahman',
        title: 'Lead AI Systems Engineer',
        bio: 'Leads the design and development of industrial automation for Saturn R&D platforms.',
        extendedBio: [
          'Rahin leads the design and development of AI-powered industrial automation solutions for the R&D Department, specializing in computer vision, intelligent manufacturing systems, and production-ready AI technologies.',
          'He graduated in Electrical and Electronic Engineering (EEE) from Bangladesh University of Engineering and Technology (BUET), one of Bangladesh\'s top engineering schools, with a specialization in Communication and Signal Processing (CSP). His academic foundation provided a solid basis in digital signal processing, mathematical modeling, and pattern recognition, bridging deep engineering theory with practical AI systems.',
          'Throughout his academic and research work, he explored advanced signal analysis, embedded systems, and computer vision algorithms for real-world problems. His hands-on research in hardware-software co-design and intelligent imaging built the technical foundation for his current work in industrial automation, edge AI, and real-time inspection systems.'
        ],
        email: 'rahin.rahman11@gmail.com',
        responsibilities: [
          'Lead AI architecture and industrial automation initiatives',
          'Computer vision and deep learning model development for FABINS',
          'Industrial camera integration & zero-latency trigger pipelines',
          'Industrial imaging systems and R&D digital transformation'
        ],
        social: {
          github: 'https://github.com/rahin11',
          linkedin: 'https://www.linkedin.com/in/rahin-rahman-94a8a0246',
          scholar: 'https://scholar.google.com/citations?user=Jq0HF_kAAAAJ',
          scholarName: 'Md Rahinur Rahman'
        },
        image: '/rahin-photo.png',
      },
      {
        id: 'ninad',
        name: 'Mohammad Ninad Mahmud Nobo',
        title: 'Lead AI Software Engineer',
        bio: 'Leads full-stack web development and machine learning model integration for Saturn R&D platforms.',
        extendedBio: [
          'Ninad leads full-stack web application development, production deployment, and machine learning model contributions for FABINS (Fabric Inspection System) and Saturn R&D platforms. His work integrates computer vision pipelines, interactive web dashboards, industrial camera controls, and scalable REST API architectures to modernize textile manufacturing.',
          'He graduated in Computer Science and Engineering from Bangladesh University of Engineering and Technology (BUET), one of Bangladesh\'s top engineering schools. There, he explored how AI could tackle complex, real-world challenges, from automated software testing to medical image analysis to Bangla speech processing. That foundation of rigorous research and hands-on building led him to industrial AI, where the software challenges are just as demanding, but the impact is immediate and visible on the factory floor.',
          'His research includes AutoTestGenX, a multi-agent system that writes and executes software tests autonomously, and MedCAR, which resolves conflicting AI readings of chest X-rays. Beyond FABINS, he has built impactful AI applications including MindTrace, providing caregivers simple tools for dementia support, and GemmaVetCare, delivering edge AI livestock health guidance for low-connectivity environments.'
        ],
        email: 'mninadmnobo@gmail.com',
        responsibilities: [
          'Full-stack development of R&D Department Portfolio & FABINS web applications',
          'Image processing, computer vision model training for FABINS',
          'ML pipeline architecture & production deployment',
          'API design, software quality standards, & DevOps automation'
        ],
        social: {
          portfolio: 'https://mninadmnobo.github.io',
          github: 'https://github.com/mninadmnobo',
          linkedin: 'https://www.linkedin.com/in/mninadmnobo',
          scholar: 'https://scholar.google.com/citations?user=y5-A2oAAAAAJ&hl=en&oi=ao',
          scholarName: 'M Ninad M Nobo',
          orcid: 'https://orcid.org/0009-0006-2781-6693'
        },
        image: '/ninad-photo.png',
      },
    ],
  },
]
