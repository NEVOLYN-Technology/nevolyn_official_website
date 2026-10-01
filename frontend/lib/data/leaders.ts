/**
 * Team & leadership content.
 *
 * Single source of truth for all **leadership profiles** and **engineering team members**
 * shown in the "Our Leaders" section on the homepage (`components/sections/LeadersSection.tsx`).
 *
 * ## 📋 Standard Template for Adding a New Team Member
 *
 * When creating or updating a profile entry, follow this exact 6-part structure:
 *
 * 1. `id` — Kebab-case unique slug (e.g. 'ninad', 'rahin', 'jane-doe').
 * 2. `name` & `title` — Full display name and official job title.
 * 3. `bio` — 1 concise sentence summary for the homepage leadership card.
 * 4. `extendedBio` (3-Paragraph Narrative Flow):
 *    - Paragraph 1: Role & NEVOLYN Impact (FABINS, web ecosystem, engineering focus).
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
 *   bio: 'Leads computer vision and edge deployment for NEVOLYN Technology.',
 *   extendedBio: [
 *     'Jane leads AI vision systems development at NEVOLYN Technology...',
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
    name: 'Leadership & Engineering Team',
    description:
      'World-class innovators driving technology and intelligent systems into the future through AI, deep-tech engineering, and applied science.',
    members: [
      {
        id: 'chagla',
        name: 'Chagla Amanullah',
        title: 'Managing Director',
        bio: 'Providing strategic leadership, driving innovation and engineering excellence at NEVOLYN.',

        extendedBio: [
          'Amanullah Chagla provides the strategic leadership for NEVOLYN, driving the organization\'s long-term vision through innovation, operational excellence, and sustainable growth. As Managing Director, he oversees the company\'s business strategy while fostering a culture where technology, research, and engineering excellence work together to create lasting industrial value.',

          'With decades of experience in industry and entrepreneurship, he has led the development and expansion of operations while building strong partnerships with globally recognized organizations and institutions. His leadership philosophy combines business excellence with continuous innovation, responsible engineering, and long-term value creation for customers and stakeholders alike.',

          'Recognizing research and development as a key driver of future competitiveness, he actively supports the NEVOLYN Technology team in advancing AI-powered automation, intelligent systems, computer vision, and next-generation engineering technologies. His vision is to establish NEVOLYN as a future-ready organization where innovation continuously transforms ideas into practical, high-impact technology solutions.'
        ],

        email: '',

        responsibilities: [
          'Define the long-term strategic vision and innovation roadmap for NEVOLYN Technology',
          'Lead business growth through operational excellence, digital transformation, and advanced engineering',
          'Oversee and support Research & Development initiatives across the organization',
          'Build strategic partnerships with global clients, technology partners, and academic institutions',
          'Promote responsible innovation, continuous improvement, and engineering-led growth',
          'Mentor leadership teams while fostering a culture of collaboration, integrity, and innovation'
        ]
      },
      {
        id: 'lutfar',
        name: 'Md Lutfar Rahman',
        title: 'Director of Finance & Operations',
        bio: 'Driving operational execution and financial discipline to support the growth and development of NEVOLYN.',

        extendedBio: [
          'Md Lutfar Rahman provides broad operational and execution-focused leadership at NEVOLYN Technology, supporting the organization’s day-to-day execution, financial coordination, administrative functions, and strategic initiatives. As Executive Director, he works closely with the leadership team to ensure that NEVOLYN’s business, technology, and operational priorities are effectively translated into structured execution and sustainable organizational growth.',

          'With approximately 25 years of experience in the textile industry and around 18 years of experience in accounting and finance leadership, he brings extensive expertise in financial management, operational planning, organizational coordination, and business support. Having been associated with Saturn Textiles Limited for approximately eight years, he contributes a strong understanding of industrial operations and financial management while helping bridge the operational requirements of the textile industry with NEVOLYN’s technology-driven initiatives.',

          'At NEVOLYN Technology, he plays a key role in ensuring that strategic plans are supported by effective execution, financial discipline, and organizational coordination. He works closely with the leadership and engineering teams to facilitate resources, manage operational priorities, support business initiatives, and maintain alignment between the company’s technological ambitions and its organizational capabilities. His experience provides an important foundation for NEVOLYN’s continued development as a deep-tech organization focused on practical industrial innovation.'
        ],

        email: '',

        responsibilities: [
          'Oversee NEVOLYN Technology’s operational execution and organizational priorities',
          'Support financial planning, budgeting, accounting, and resource management',
          'Coordinate business operations across leadership and engineering teams',
          'Translate strategic decisions into structured operational execution',
          'Support business development, partnerships, procurement, and resource planning',
          'Coordinate operational activities with Saturn Textiles Limited and industry partners',
          'Provide financial and operational insights for strategic decision-making',
          'Strengthen organizational processes, accountability, and operational efficiency',
          'Facilitate resources and support for Research & Development initiatives',
          'Ensure alignment between technology, business, finance, and operations'
        ],
        image: '/ed-photo.png',
      },
      {
        id: 'rahin',
        name: 'Md Rahinur Rahman',
        title: 'Founder & AI Systems Engineer',
        bio: 'Design and development of industrial AI and automation platforms at NEVOLYN.',
        extendedBio: [
          'Rahin leads the design and development of AI-powered industrial automation solutions at NEVOLYN, specializing in computer vision, intelligent manufacturing systems, and production-ready AI technologies.',
          'He graduated in Electrical and Electronic Engineering (EEE) from Bangladesh University of Engineering and Technology (BUET), one of Bangladesh\'s top engineering schools, with a specialization in Communication and Signal Processing (CSP). His academic foundation provided a solid basis in digital signal processing, mathematical modeling, and pattern recognition, bridging deep engineering theory with practical AI systems.',
          'Throughout his academic and research work, he explored advanced signal analysis, embedded systems, and computer vision algorithms for real-world problems. His hands-on research in hardware-software co-design and intelligent imaging built the technical foundation for his current work in industrial automation, edge AI, and real-time inspection systems.'
        ],
        email: 'rahin.rahman11@gmail.com',
        responsibilities: [
          'Lead AI architecture and industrial automation initiatives at NEVOLYN',
          'Computer vision and deep learning model development for FABINS',
          'Industrial camera integration & zero-latency trigger pipelines',
          'Industrial imaging systems and digital transformation'
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
        title: 'Co-Founder & AI Software Engineer',
        bio: 'Full-stack web development and machine learning model integration for NEVOLYN.',
        extendedBio: [
          'Ninad leads full-stack web application development, production deployment, and machine learning model contributions for FABINS (Fabric Inspection System) and NEVOLYN. His work integrates computer vision pipelines, interactive web dashboards, industrial camera controls, and scalable REST API architectures.',
          'He graduated in Computer Science and Engineering from Bangladesh University of Engineering and Technology (BUET), one of Bangladesh\'s top engineering schools. There, he explored how AI could tackle complex, real-world challenges, from automated software testing to medical image analysis to Bangla speech processing. That foundation of rigorous research and hands-on building led him to industrial AI, where the software challenges are just as demanding, but the impact is immediate and visible on the factory floor.',
          'His research includes AutoTestGenX, a multi-agent system that writes and executes software tests autonomously, and MedCAR, which resolves conflicting AI readings of chest X-rays. Beyond FABINS, he has built impactful AI applications including MindTrace, providing caregivers simple tools for dementia support, and GemmaVetCare, delivering edge AI livestock health guidance for low-connectivity environments.'
        ],
        email: 'mninadmnobo@gmail.com',
        responsibilities: [
          'Full-stack development of NEVOLYN & FABINS web applications',
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

/** Direct export of leadership members for component consumption. */
export const leaders: TeamMember[] = teamDepartments[0].members
