# NEVOLYN Technology — Frontend Developer Handbook

> Complete technical architecture, component breakdown, content editing workflows, animation presets, and API integration guide for the **Next.js 16 (App Router)** corporate frontend application (`frontend/`).

---

## 🧭 1. Architecture & Technology Stack

The frontend is a single-page scrolling web application engineered using modern Web standard guidelines:

- **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a custom dark mode palette (`#020914` background, electric blue accents `#3b82f6`, and vibrant orange accents `#f97316`)
- **Animation System**: [Framer Motion v12](https://www.framer.com/motion/) (Declarative scroll-triggered entrance animations)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Analytics**: [@vercel/analytics](https://vercel.com/analytics) (Injected in production builds)

---

## 🗂️ 2. Frontend Directory Layout & File Roles

All frontend files are located inside `frontend/`:

```text
frontend/
├── app/                           # Next.js App Router pages & layouts
│   ├── globals.css                # Global Tailwind CSS design tokens & glow utilities
│   ├── layout.tsx                 # Root layout (Metadata, HTML dark class, ambient glow background)
│   ├── page.tsx                   # Main scrolling homepage (/)
│   └── join_us/
│       └── page.tsx               # Job Application & CV upload page (/join_us)
├── components/                    # Reusable React components
│   ├── layout/                    # Site structure wrappers
│   │   ├── Navbar.tsx             # Fixed top navbar, scroll section tracking, mobile drawer
│   │   ├── Footer.tsx             # Page footer with contact details & social links
│   │   └── PageShell.tsx          # Wrapper supplying Navbar + Content Padding + Footer
│   ├── sections/                  # Homepage scroll sections
│   │   ├── Hero.tsx               # Primary landing headline & CTA buttons
│   │   ├── CapabilitiesSection.tsx # 4 feature pillars with glowing icon circles
│   │   ├── AboutSection.tsx        # Mission, Vision, What We Do, Focus Areas
│   │   ├── LeadersSection.tsx     # Executive leadership & research engineering card grid
│   │   ├── InnovationsSection.tsx # R&D project cards, status badges & progress indicators
│   │   ├── LatestNewsSection.tsx  # Featured milestone cards & chronological news timeline
│   │   └── ContactSection.tsx     # Visitor contact inquiry form
│   ├── ui/                        # Reusable atomic UI elements
│   │   ├── badge.tsx              # Status pill badge (neutral, info, success, warning, danger)
│   │   ├── LeaderDetails.tsx      # Modal popup displaying full bio & research publications
│   │   └── WelcomeBanner.tsx      # Top announcement banner bar
│   └── providers/                 # Theme & Context providers
│       └── ThemeProvider.tsx      # React context provider wrapper
├── lib/                           # Core utilities & data layer
│   ├── animations.ts              # Framer Motion animation presets (fadeUpProps, staggerContainer)
│   ├── utils.ts                   # Tailwind class merger (cn) & date formatter (formatDate)
│   └── data/                      # SINGLE SOURCE OF TRUTH FOR CONTENT
│       ├── innovations.ts         # R&D project records & technologies
│       ├── leaders.ts             # Executive leadership profiles, bios & social links
│       └── latest-news.ts         # Institutional news announcements & milestones
├── public/                        # Static assets (logos, headshot photos, icons)
├── package.json                   # Dependencies, build scripts & version configuration
├── tsconfig.json                  # Strict TypeScript configuration & path aliases (@/*)
└── next.config.mjs                # Next.js build setup & image optimization rules
```

---

## ✏️ 3. How to Edit Website Content (Single Source of Truth)

To maintain 0ms rendering latency and avoid unnecessary database calls for static information, content is stored directly in `frontend/lib/data/*.ts`.

### A. How to Add or Edit Executive Leaders (`frontend/lib/data/leaders.ts`)

Open `frontend/lib/data/leaders.ts` and modify or append an object to `teamDepartments[0].members`:

```ts
{
  id: 'jane-doe',                     // Kebab-case unique ID slug
  name: 'Dr. Jane Doe',               // Display full name
  title: 'Senior AI Engineer',        // Official job title
  bio: 'Short 1-sentence bio shown on the homepage card.',
  extendedBio: [                      // 3-Paragraph Narrative shown in modal popup:
    'Paragraph 1: Role and core R&D contribution...',
    'Paragraph 2: Education and academic specialization (e.g. BUET CSE/EEE)...',
    'Paragraph 3: Published research papers and engineering accomplishments...'
  ],
  email: 'jane@nevolyn.com',          // Contact email address
  responsibilities: [                 // 4-5 bullet points of ownership
    'Computer vision model optimization',
    'Industrial camera integration'
  ],
  social: {
    github: 'https://github.com/janedoe',
    linkedin: 'https://linkedin.com/in/janedoe',
    scholar: 'https://scholar.google.com/citations?user=xyz',
    scholarName: 'Jane Doe',
    orcid: 'https://orcid.org/0009-0000-0000-0000'
  },
  image: '/jane-photo.png'            // Headshot path in public/
}
```

### B. How to Add or Edit R&D Projects / Innovations (`frontend/lib/data/innovations.ts`)

Open `frontend/lib/data/innovations.ts` and append an object to `projects`:

```ts
{
  id: 'fabins',                       // Unique React key
  title: 'FABINS - Fabric Inspection Automation',
  description: 'Real-time fabric fault detection system using computer vision...',
  status: 'active',                   // 'active' | 'planning' | 'completed'
  technologies: ['Machine Learning', 'Computer Vision (YOLOv8)', 'Spring Boot & Java'],
  startDate: '2026-01-15',            // ISO date string (YYYY-MM-DD)
  category: 'Industrial AI'           // Tag for filtering
}
```

### C. How to Add or Edit News & Milestones (`frontend/lib/data/latest-news.ts`)

Open `frontend/lib/data/latest-news.ts` and append an object to `news`:

```ts
{
  id: '6',                            // Unique ID
  title: 'Milestone Title',
  description: 'Short 1-2 sentence preview description for grid card.',
  content: 'Full news announcement body text.',
  category: 'Institutional Funding',  // Category tag
  date: '2026-07-24',                 // Publication ISO date string
  author: 'NEVOLYN Executive Board',  // Author entity
  featured: true                       // true promotes to top featured grid
}
```

---

## 🎬 4. Animation Presets & Styling System

### Animation Helpers (`frontend/lib/animations.ts`)
Instead of hardcoding animation properties in components, import helpers from `lib/animations`:

```tsx
import { motion } from 'framer-motion'
import { fadeUpProps, staggerContainer, fadeInUpVariants, defaultViewport } from '@/lib/animations'

// 1. Single independently animated element:
<motion.div {...fadeUpProps(0.1)}>...</motion.div>

// 2. Parent-child staggered grid sequence:
<motion.div variants={staggerContainer()} initial="hidden" whileInView="visible" viewport={defaultViewport}>
  {items.map((item) => (
    <motion.div key={item.id} variants={fadeInUpVariants}>...</motion.div>
  ))}
</motion.div>
```

---

## 🔌 5. Connecting Frontend to Spring Boot REST Backend

The frontend connects to the Spring Boot REST backend via the `NEXT_PUBLIC_API_URL` environment variable.

### Step 1: Set Environment Variable
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Step 2: Contact Form Integration (`ContactSection.tsx`)
Update `onSubmit` in `frontend/components/sections/ContactSection.tsx`:

```ts
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  const payload = Object.fromEntries(formData)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (res.ok) {
    alert(`Message sent! Inquiry ID: ${json.data.inquiryId}`)
  }
}
```

### Step 3: Job Application & File Upload Integration (`app/join_us/page.tsx`)
Update `onSubmit` in `frontend/app/join_us/page.tsx`:

```ts
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications`, {
    method: 'POST',
    body: formData, // Do NOT set Content-Type header — browser automatically sets multipart boundary
  })
  const json = await res.json()
  if (res.ok) {
    alert(`Application submitted! Ref ID: ${json.data.applicationId}`)
  }
}
```

---

## 🚀 6. Developer Commands

Run commands inside `frontend/`:

```bash
cd frontend

# Start local dev server (http://localhost:3000)
pnpm dev

# Run TypeScript type check
pnpm type-check

# Build production bundle
pnpm build

# Start production server locally
pnpm start
```
