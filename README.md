# Saturn Textiles R&D — Portfolio Web Application

> Official web platform for the **Research & Development Department of Saturn Textiles Limited**, showcasing innovations in smart textile automation, AI integration, and high-performance industrial solutions.

[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion 12](https://img.shields.io/badge/Framer_Motion-v12-ff0066?logo=framer)](https://www.framer.com/motion/)

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/mninadmnobo/saturn_rnd_portfolio.git
cd saturn_rnd_portfolio

# 2. Install dependencies & run locally
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Project Architecture at a Glance

The application uses an **optimal hybrid architecture**:
1. **0ms Display Content** (Leaders, Innovations, News): Statically typed in `lib/data/*.ts` for instant rendering and zero database latency.
2. **Spring Boot Backend APIs** (Contact form, Job applications + CV uploads, Dynamic staff): Handled via Spring Boot 3 REST endpoints.

```text
saturn_rnd_portfolio/
├── app/                        # Next.js App Router routes & layouts
│   ├── page.tsx                # Single scrolling homepage
│   └── join_us/page.tsx        # Job application page & CV upload
├── components/
│   ├── layout/                 # Navbar, Footer, PageShell
│   ├── sections/               # Hero, Capabilities, About, Leaders, Innovations, News, Contact
│   └── ui/                     # Badge, LeaderDetails modal, WelcomeBanner
├── lib/
│   ├── animations.ts           # Framer Motion animation presets
│   ├── utils.ts                # cn() class merger & formatDate()
│   └── data/                   # SINGLE SOURCE OF TRUTH FOR CONTENT
│       ├── innovations.ts      # R&D projects & status
│       ├── leaders.ts          # Leadership team profiles & bio
│       └── latest-news.ts      # Milestones & news timeline
└── docs/                       # Project documentation
    ├── API_INTEGRATION.md      # Spring Boot REST API integration spec
    └── PLAN.md                 # Development roadmap & status
```

---

## ✏️ Developer Cheatsheet: How to Edit Content

To update website content, simply edit the corresponding TypeScript file in `lib/data/`:

| What You Want to Edit | File to Open | Data Structure |
| :--- | :--- | :--- |
| **R&D Projects / Innovations** | [`lib/data/innovations.ts`](./lib/data/innovations.ts) | `projects` array |
| **Executive Leaders & Bios** | [`lib/data/leaders.ts`](./lib/data/leaders.ts) | `teamDepartments` array |
| **News & Milestones** | [`lib/data/latest-news.ts`](./lib/data/latest-news.ts) | `news` array |
| **Hero Headline & CTAs** | [`components/sections/Hero.tsx`](./components/sections/Hero.tsx) | JSX inline |
| **Footer Contact Info** | [`components/layout/Footer.tsx`](./components/layout/Footer.tsx) | JSX inline |

---

## 🔌 Spring Boot Backend Integration

The frontend is ready to connect to your Spring Boot backend via `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Endpoints Handled by Spring Boot:
- `POST /api/v1/contact` ── Contact form submission (`application/json`)
- `POST /api/v1/applications` ── Job application + CV PDF upload (`multipart/form-data`)
- `GET /api/v1/team/members` ── Dynamic R&D engineering staff list

For complete Java DTOs, Controller code, and CORS setup, see [docs/API_INTEGRATION.md](./docs/API_INTEGRATION.md).

---

## 📚 Complete Documentation Links

- 🔌 **[Spring Boot REST API Spec (`docs/API_INTEGRATION.md`)](./docs/API_INTEGRATION.md)** — Precise backend contract, DTOs, and file upload specifications.
- 🗺️ **[Development Roadmap (`docs/PLAN.md`)](./docs/PLAN.md)** — Project status and completed phases.
