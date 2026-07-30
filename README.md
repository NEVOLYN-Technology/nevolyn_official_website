# Saturn Textiles R&D — Monorepo

> Official web platform for the **Research & Development Department of Saturn Textiles Limited**, showcasing innovations in smart textile automation, AI integration, and high-performance industrial solutions.

[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.4-green?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java 21](https://img.shields.io/badge/Java-21_LTS-orange?logo=openjdk)](https://adoptium.net/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🗂️ Monorepo Structure

```text
saturn_rnd_portfolio/               ← Git root (monorepo)
├── frontend/                       ← Next.js 16 portfolio web application
│   ├── vercel.json                 # Vercel deployment configuration
│   ├── app/                        # App Router pages & layouts
│   │   ├── page.tsx                # Single scrolling homepage
│   │   └── join_us/page.tsx        # Job application page & CV upload
│   ├── components/
│   │   ├── layout/                 # Navbar, Footer, PageShell
│   │   ├── sections/               # Hero, Capabilities, About, Leaders, Innovations, News, Contact
│   │   ├── ui/                     # Badge, LeaderDetails modal, WelcomeBanner
│   │   └── providers/              # ThemeProvider
│   ├── lib/
│   │   ├── animations.ts           # Framer Motion animation presets
│   │   ├── utils.ts                # cn() class merger & formatDate()
│   │   └── data/                   # Static content (single source of truth)
│   │       ├── innovations.ts      # R&D projects & status
│   │       ├── leaders.ts          # Leadership team profiles & bio
│   │       └── latest-news.ts      # Milestones & news timeline
│   ├── public/                     # Static assets (logos, photos)
│   └── package.json                # Node.js dependencies & scripts
├── backend/                        ← Spring Boot 3 (Java 21) REST API
│   ├── src/main/java/com/saturn/rnd/
│   │   ├── controller/             # ContactController, ApplicationController, TeamController
│   │   ├── service/                # ContactService, ApplicationService, TeamService, FileStorageService
│   │   ├── model/                  # ContactInquiry, JobApplication, TeamMemberEntity
│   │   ├── dto/                    # ApiResponse<T>, ContactRequest, TeamMemberDto, ...
│   │   ├── repository/             # Spring Data JPA Repositories
│   │   ├── config/                 # CorsConfig, DataSeeder
│   │   └── exception/              # GlobalExceptionHandler, custom exceptions
│   ├── src/main/resources/
│   │   └── application.yml         # Port 8080, H2/PostgreSQL config, file upload limits
│   └── pom.xml                     # Maven build — Spring Boot 3.4.2
├── .github/workflows/              ← GitHub Actions CI/CD automation
│   └── ci-cd.yml                   # Automated Next.js build, Spring Boot tests & Render trigger
├── render.yaml                     ← Render Blueprint spec for Spring Boot Docker + PostgreSQL DB
├── docs/                           ← Project documentation
│   ├── report.md                   # Zero-to-hero master educational report & engineering audit
│   ├── CICD_GUIDE.md               # Beginner intuition guide for CI/CD, Docker & domain deployment
│   ├── FRONTEND_GUIDE.md           # Next.js 16 architecture, component breakdown & content guide
│   ├── BACKEND_GUIDE.md            # Spring Boot 3 package layout, DB & storage guide
│   └── API_INTEGRATION.md          # Master REST API spec, 5-layer code traces & integration guide
├── README.md                       ← This file — monorepo overview & quick start
└── .gitignore                      ← Covers frontend/ and backend/ workspace artifacts
```

---

## ⚡ Quick Start

### Frontend (Next.js)

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend (Spring Boot)

> Requires **Java 21 LTS** (`java -version` to check).

```bash
cd backend
./mvnw spring-boot:run
```

API available at [http://localhost:8080](http://localhost:8080).  
H2 dev console at [http://localhost:8080/h2-console](http://localhost:8080/h2-console).

---

## 🧭 Architecture

The application uses an **optimal hybrid architecture**:

1. **0ms Static Content** (Leaders, Innovations, News): Statically typed in `frontend/lib/data/*.ts` for instant rendering and zero database latency.
2. **Spring Boot REST APIs** (Contact form, Job applications + CV uploads, Dynamic staff): Handled via Spring Boot 3 REST endpoints at port `8080`.

---

## ✏️ Developer Cheatsheet: How to Edit Content

To update website content, edit the corresponding TypeScript file in `frontend/lib/data/`:

| What You Want to Edit | File to Open | Data Structure |
| :--- | :--- | :--- |
| **R&D Projects / Innovations** | [`frontend/lib/data/innovations.ts`](./frontend/lib/data/innovations.ts) | `projects` array |
| **Executive Leaders & Bios** | [`frontend/lib/data/leaders.ts`](./frontend/lib/data/leaders.ts) | `teamDepartments` array |
| **News & Milestones** | [`frontend/lib/data/latest-news.ts`](./frontend/lib/data/latest-news.ts) | `news` array |
| **Hero Headline & CTAs** | [`frontend/components/sections/Hero.tsx`](./frontend/components/sections/Hero.tsx) | JSX inline |
| **Footer Contact Info** | [`frontend/components/layout/Footer.tsx`](./frontend/components/layout/Footer.tsx) | JSX inline |

---

## 🔌 Backend REST API Endpoints

Configure the frontend to connect to the backend via `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `POST /api/v1/contact` | POST | Contact form submission |
| `POST /api/v1/applications` | POST | Job application + CV upload (`multipart/form-data`) |
| `GET /api/v1/team/members` | GET | Dynamic engineering staff list |

For complete DTOs, Controller code, and CORS setup, see [docs/API_INTEGRATION.md](./docs/API_INTEGRATION.md).

---

## 📚 Documentation Links

- 📖 **[Master Educational Report & Audit Handbook (`docs/report.md`)](./docs/report.md)** — Comprehensive zero-to-hero learning guide, architecture audit, API traces, testing suite, and domain deployment.
- 🤖 **[CI/CD & Deployment Handbook (`docs/CICD_GUIDE.md`)](./docs/CICD_GUIDE.md)** — Beginner intuition guide for CI/CD pipelines, Docker container files, and step-by-step custom domain deployment.
- 🔌 **[Spring Boot REST API Master Spec (`docs/API_INTEGRATION.md`)](./docs/API_INTEGRATION.md)** — Master API guide with 5-layer code traces, field constraints, cURL examples, CORS config, and tutorial on adding new APIs.
- ⚛️ **[Frontend Developer Handbook (`docs/FRONTEND_GUIDE.md`)](./docs/FRONTEND_GUIDE.md)** — Next.js 16 architecture, component breakdown, content editing workflows, animations, and API integration.
- 🍃 **[Backend Developer Handbook (`docs/BACKEND_GUIDE.md`)](./docs/BACKEND_GUIDE.md)** — Spring Boot 3 architecture, package layer responsibilities, JPA database setup, and file storage logic.
