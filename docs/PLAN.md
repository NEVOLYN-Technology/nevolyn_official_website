# Saturn Textiles R&D — Development Roadmap

> This is the living development roadmap for the Saturn Textiles R&D Portfolio.
> It tracks what has been built, what is in progress, and what is planned.
> Update this file whenever a significant milestone is completed or planned.

---

## 📊 Project Status Summary

| Phase | Description | Status | Target |
|-------|-------------|--------|--------|
| Phase 1 | Frontend Portfolio | ✅ Complete | Q3 2026 |
| Phase 2 | Spring Boot Backend API | 🔵 Planned | Q3–Q4 2026 |
| Phase 3 | Production Deployment & CI/CD | 🔵 Planned | Q4 2026 |
| Phase 4 | Admin Panel & CMS | 🔵 Future | 2027 |

---

## ✅ Phase 1 — Frontend Portfolio (Complete)

### Infrastructure & Configuration
- [x] Next.js 16 App Router project initialized with TypeScript
- [x] Tailwind CSS v4 configured with custom design tokens (dark navy + electric blue + orange)
- [x] Framer Motion integrated for scroll-triggered entrance animations
- [x] Vercel Analytics integrated (`@vercel/analytics`)
- [x] Dark mode enforced globally via `className="dark"` on `<html>`
- [x] SEO metadata (title, description, OpenGraph) on all pages
- [x] Proper `.gitignore` configured
- [x] `package.json` with correct project name, description, and homepage URL
- [x] `tsconfig.json` with strict mode enabled

### Design System
- [x] Global CSS design tokens (CSS custom properties for colors, spacing, typography)
- [x] Shared Framer Motion animation presets (`lib/animations.ts`) — `fadeUpProps`, `fadeLeftProps`, `staggerContainer`, `fadeInUpVariants`
- [x] `cn()` utility for conditional class merging (`lib/utils.ts`)
- [x] `formatDate()` utility with locale-pinned formatting (prevents React hydration mismatch)

### Reusable UI Components
- [x] `Badge` — semantic pill with 5 tones: neutral, info, success, warning, danger (`components/ui/badge.tsx`)
- [x] `LeaderDetails` — full modal popup view for detailed executive bio and research details (`components/ui/LeaderDetails.tsx`)
- [x] `WelcomeBanner` — dynamic top announcement bar (`components/ui/WelcomeBanner.tsx`)

### Layout Components
- [x] `Navbar` — fixed top bar, scroll-aware active section tracking, mobile responsive drawer
- [x] `Footer` — company logo, tagline, contact info (address with map link, phone, email)
- [x] `PageShell` — reusable `Navbar` + padded content area + `Footer` wrapper (used by `/join_us`)
- [x] `ThemeProvider` — context provider for theme handling (`components/providers/ThemeProvider.tsx`)

### Homepage Sections (all on single scrolling `/` page)
- [x] `Hero` — headline, CTA buttons (Explore Innovations, Meet our Leaders, Join Us), hero image with entrance animation
- [x] `CapabilitiesSection` — 4-column feature pillars with animated icon circles
- [x] `AboutSection` — Mission, Vision, What We Do, Focus Areas with connector-line layout
- [x] `LeadersSection` — team profile grid with detailed bio modals and social links
- [x] `InnovationsSection` — active/completed R&D project cards with status badges and tech tags
- [x] `LatestNewsSection` — featured news grid + recent institutional milestones timeline
- [x] `ContactSection` — contact form (static in Phase 1; Spring Boot integration in Phase 2)

### Pages
- [x] `/` — Homepage (single scrolling page with all sections above)
- [x] `/join_us` — Job application form (full name, email, phone with +880 prefix, address, LinkedIn, GitHub, website, word-counter motivation statement, CV upload)

### Data Layer (`lib/data/` — single source of truth for dynamic content)
- [x] `lib/data/leaders.ts` — `TeamMember` and `Department` interfaces + executive team data
- [x] `lib/data/innovations.ts` — `Project` interface + R&D project list (e.g., FABINS)
- [x] `lib/data/latest-news.ts` — `NewsItem` interface + news and milestone announcements

### Documentation & Specifications
- [x] `README.md` — developer overview, quick start, file map, and setup guide
- [x] `docs/API_INTEGRATION.md` — complete Spring Boot REST API specification, controller code, DTOs, and CORS setup

---

## 🔵 Phase 2 — Spring Boot Backend API (Planned)

### Goal
Connect the frontend to a Spring Boot REST API so that:
- Contact and job application forms submit real data (stored in PostgreSQL, email notifications)
- Dynamic content (innovations, news, team members) can be fetched dynamically
- Admin users can manage content through a secure API

### Backend Setup
- [ ] Initialize Spring Boot 3 project in `backend/` directory
  - Java 21, Maven build system
  - Dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `postgresql`, `lombok`
- [ ] Configure local PostgreSQL database (Docker Compose for dev environment)
- [ ] Configure CORS: allow `http://localhost:3000` in development, production domain in production

### REST API Endpoints to Build
| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/v1/contact` | POST | Store contact form submission, trigger email notification |
| `POST /api/v1/applications` | POST | Accept job application + CV file (`multipart/form-data`) |
| `GET /api/v1/projects` | GET | Return full project list |
| `GET /api/v1/news` | GET | Return news articles list |
| `GET /api/v1/team/members` | GET | Return team members list |
| `POST /api/v1/auth/login` | POST | Admin login → returns JWT |
| `PUT /api/v1/projects/{id}` | PUT | Admin: update a project (protected) |
| `POST /api/v1/news` | POST | Admin: create a news article (protected) |

### Frontend Integration Tasks
- [ ] Add `NEXT_PUBLIC_API_URL=http://localhost:8080` to `.env.local`
- [ ] `ContactSection.tsx` — add `handleSubmit` that POSTs to `POST /api/v1/contact`
- [ ] `app/join_us/page.tsx` — add `handleSubmit` that POSTs to `POST /api/v1/applications` as `multipart/form-data`
- [ ] `InnovationsSection.tsx` — replace `lib/data/innovations.ts` static array fallback with API call
- [ ] `LatestNewsSection.tsx` — replace `lib/data/latest-news.ts` static array fallback with API call
- [ ] `LeadersSection.tsx` — replace `lib/data/leaders.ts` static array fallback with API call
- [ ] Add loading skeletons for all data-fetching sections
- [ ] Add error boundary / fallback UI for failed API calls

---

## 🔵 Phase 3 — Production Deployment & CI/CD (Planned)

### Frontend (Vercel)
- [ ] Connect GitHub repository to Vercel project
- [ ] Configure custom domain
- [ ] Set production environment variables in Vercel dashboard

### Backend (Cloud)
- [ ] Deploy Spring Boot API to a cloud provider (Railway, Render, or AWS)
- [ ] Set up managed PostgreSQL instance (Supabase, Railway, or RDS)
- [ ] Configure production CORS and environment variables

---

## 🔵 Phase 4 — Admin Panel & CMS (Future)

- [ ] Full admin dashboard UI (Next.js routes behind JWT middleware)
- [ ] Rich text editor for news article body content
- [ ] Image upload for team photos, gallery images, and news thumbnails
- [ ] Activity/audit log for all admin actions

---

## 📝 Developer Notes

### How to Add a New Homepage Section
1. Create `components/sections/YourSection.tsx` with a JSDoc comment
2. Export a named component (e.g. `export const YourSection = () => { ... }`)
3. Import and render it in `app/page.tsx` in the correct position
4. If the section has a nav link, add an entry to `NAV_LINKS` in `Navbar.tsx`
5. If the section has dynamic list content, create `lib/data/yourSection.ts`

### How to Add a New Separate Page
1. Create `app/your-route/page.tsx`
2. Wrap content with `<PageShell>` to get Navbar + Footer
3. If there's a back link, add an `<ArrowLeft>` link to the homepage or parent page

### How to Add a New Team Member
Edit `lib/data/leaders.ts` — see the "Standard Template for Adding a New Team Member" guide at the top of that file.

### How to Add a New R&D Project
Edit `lib/data/innovations.ts` — see the "How to add a new project" guide at the top of that file.

---

*Last updated: July 2026*
