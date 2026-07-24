# Saturn Textiles R&D — Development Roadmap

> This is the living development roadmap for the Saturn Textiles R&D Portfolio monorepo.
> It tracks what has been built, what is in progress, and what is planned.
> Update this file whenever a significant milestone is completed or planned.

---

## 📊 Project Status Summary

| Phase | Description | Status | Target |
|-------|-------------|--------|--------|
| Phase 1 | Frontend Portfolio | ✅ Complete | Q3 2026 |
| Phase 2 | Spring Boot Backend API | ✅ Complete (Core API) | Q3 2026 |
| Phase 2.5 | Monorepo Restructure | ✅ Complete | Q3 2026 |
| Phase 3 | Production Deployment & CI/CD | 🔵 Planned | Q4 2026 |
| Phase 4 | Admin Panel & CMS | 🔵 Future | 2027 |

---

## ✅ Phase 1 — Frontend Portfolio (Complete)

All source files located in `frontend/`.

### Infrastructure & Configuration
- [x] Next.js 16 App Router project initialized with TypeScript
- [x] Tailwind CSS v4 configured with custom design tokens (dark navy + electric blue + orange)
- [x] Framer Motion integrated for scroll-triggered entrance animations
- [x] Vercel Analytics integrated (`@vercel/analytics`)
- [x] Dark mode enforced globally via `className="dark"` on `<html>`
- [x] SEO metadata (title, description, OpenGraph) on all pages
- [x] `frontend/package.json` with correct project name, description, and homepage URL
- [x] `frontend/tsconfig.json` with strict mode enabled

### Design System
- [x] Global CSS design tokens (`frontend/app/globals.css`)
- [x] Shared Framer Motion animation presets (`frontend/lib/animations.ts`) — `fadeUpProps`, `fadeLeftProps`, `staggerContainer`, `fadeInUpVariants`
- [x] `cn()` utility for conditional class merging (`frontend/lib/utils.ts`)
- [x] `formatDate()` utility with locale-pinned formatting

### Reusable UI Components
- [x] `Badge` — semantic pill with 5 tones (`frontend/components/ui/badge.tsx`)
- [x] `LeaderDetails` — full modal popup view for detailed executive bio (`frontend/components/ui/LeaderDetails.tsx`)
- [x] `WelcomeBanner` — dynamic top announcement bar (`frontend/components/ui/WelcomeBanner.tsx`)

### Layout Components
- [x] `Navbar` — fixed top bar, scroll-aware active section tracking, mobile responsive drawer
- [x] `Footer` — company logo, tagline, contact info
- [x] `PageShell` — reusable `Navbar` + padded content area + `Footer` wrapper (used by `/join_us`)
- [x] `ThemeProvider` — context provider for theme handling

### Homepage Sections (all on single scrolling `/` page)
- [x] `Hero` — headline, CTA buttons, hero image with entrance animation
- [x] `CapabilitiesSection` — 4-column feature pillars with animated icon circles
- [x] `AboutSection` — Mission, Vision, What We Do, Focus Areas
- [x] `LeadersSection` — team profile grid with detailed bio modals and social links
- [x] `InnovationsSection` — active/completed R&D project cards with status badges and tech tags
- [x] `LatestNewsSection` — featured news grid + recent institutional milestones timeline
- [x] `ContactSection` — contact form (Spring Boot integration pending Phase 2 frontend tasks)

### Pages
- [x] `/` — Homepage (single scrolling page)
- [x] `/join_us` — Job application form with CV upload

### Data Layer (`frontend/lib/data/` — single source of truth)
- [x] `frontend/lib/data/leaders.ts` — `TeamMember` and `Department` interfaces + executive team data
- [x] `frontend/lib/data/innovations.ts` — `Project` interface + R&D project list (e.g., FABINS)
- [x] `frontend/lib/data/latest-news.ts` — `NewsItem` interface + news and milestone announcements

### Documentation
- [x] `README.md` — monorepo overview, quick start for both services
- [x] `docs/API_INTEGRATION.md` — complete Spring Boot REST API specification

---

## ✅ Phase 2 — Spring Boot Backend API (Core Complete)

All source files located in `backend/`.

### Backend Setup
- [x] Initialize Spring Boot 3 project in `backend/` directory (Java 21, Maven)
  - Dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `postgresql`, `h2`, `lombok`
- [x] Configure database connection & H2 dev console (`backend/src/main/resources/application.yml`)
- [x] Configure CORS: allow `http://localhost:3000` in development, production domain in production (`CorsConfig.java`)
- [x] Create JPA entities: `ContactInquiry`, `JobApplication`, `TeamMemberEntity`
- [x] Create Repositories & Services: `ContactService`, `ApplicationService`, `TeamService`, `FileStorageService`
- [x] Create REST Controllers: `ContactController`, `ApplicationController`, `TeamController`
- [x] Global Exception Handler returning standardized JSON envelopes (`ApiResponse<T>`)

### Implemented REST API Endpoints
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `POST /api/v1/contact` | POST | ✅ Done | Store contact form submission |
| `POST /api/v1/applications` | POST | ✅ Done | Accept job application + CV file (`multipart/form-data`) |
| `GET /api/v1/team/members` | GET | ✅ Done | Return dynamic team members list |
| `POST /api/v1/auth/login` | POST | 🔵 Planned | Admin login → returns JWT |
| `PUT /api/v1/projects/{id}` | PUT | 🔵 Planned | Admin: update a project (protected) |

### Frontend Integration Tasks (Pending)
- [ ] Add `NEXT_PUBLIC_API_URL=http://localhost:8080` to `frontend/.env.local`
- [ ] `frontend/components/sections/ContactSection.tsx` — add `handleSubmit` that POSTs to `/api/v1/contact`
- [ ] `frontend/app/join_us/page.tsx` — add `handleSubmit` that POSTs to `/api/v1/applications` as `multipart/form-data`
- [ ] Add loading skeletons for all data-fetching sections
- [ ] Add error boundary / fallback UI for failed API calls

---

## ✅ Phase 2.5 — Monorepo Restructure (Complete)

- [x] Moved Next.js app from project root into `frontend/` directory
- [x] `backend/` already properly structured
- [x] Updated root `.gitignore` to cover `frontend/node_modules`, `frontend/.next`, `backend/target`, `backend/uploads`
- [x] Rewrote `README.md` with full monorepo quick-start guide for both services
- [x] Verified `pnpm install` and `pnpm build` run cleanly from `frontend/`

---

## 🔵 Phase 3 — Production Deployment & CI/CD (Planned)

### Frontend (Vercel)
- [ ] Connect GitHub repository to Vercel project and set root directory to `frontend/`
- [ ] Configure custom domain
- [ ] Set production environment variables in Vercel dashboard

### Backend (Cloud)
- [ ] Deploy Spring Boot API to a cloud provider (Railway, Render, or AWS)
- [ ] Set up managed PostgreSQL instance (Supabase, Railway, or RDS)
- [ ] Configure production CORS and environment variables

---

## 🔵 Phase 4 — Admin Panel & CMS (Future)

- [ ] Full admin dashboard UI (`frontend/app/admin/` behind JWT middleware)
- [ ] Rich text editor for news article body content
- [ ] Image upload for team photos and news thumbnails
- [ ] Activity/audit log for all admin actions

---

## 📝 Developer Notes

### Running the Application

```bash
# Frontend (Next.js) — from repo root:
cd frontend && pnpm dev

# Backend (Spring Boot) — from repo root:
cd backend && ./mvnw spring-boot:run
```

### How to Add a New Homepage Section
1. Create `frontend/components/sections/YourSection.tsx` with a JSDoc comment
2. Export a named component and import it in `frontend/app/page.tsx`
3. If the section has a nav link, add an entry to `NAV_LINKS` in `frontend/components/layout/Navbar.tsx`
4. If the section has dynamic list content, create `frontend/lib/data/yourSection.ts`

### How to Add a New Team Member
Edit `frontend/lib/data/leaders.ts` — see the "Standard Template" guide at the top of that file.

### How to Add a New R&D Project
Edit `frontend/lib/data/innovations.ts` — see the "How to add a new project" guide at the top of that file.

---

*Last updated: July 2026*
