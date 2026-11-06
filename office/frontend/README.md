# Nevolyn Office Management — Frontend Application

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

The web client for **Nevolyn Office Management** is an enterprise-grade Single-Page Application (SPA) built using **Next.js 16 (App Router)**, **React 19**, and **TypeScript 5 (strict mode)**. The UI features a high-contrast, dark-mode executive interface styled with **Tailwind CSS** and **shadcn/ui** design tokens, cached client-side with **TanStack Query v5**.

---

## 🌐 Production Deployments & Domains

- **Production Frontend (Custom Domain):** [https://office.nevolyn.com](https://office.nevolyn.com)
- **Vercel Deployment URL:** [https://nevolyn-office-management.vercel.app](https://nevolyn-office-management.vercel.app)
- **Backend API Endpoint:** `https://nevolyn-office-management.onrender.com/api/v1` *(or `https://api.office.nevolyn.com/api/v1`)*

---

## 🏛️ Application Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                    │
│   ├── (auth)/login                (Public Authentication)   │
│   ├── (protected)/layout.tsx      (Protected Layout & Shell)│
│   │   ├── dashboard               (Executive & Staff Dash)  │
│   │   ├── attendance              (Live Check-in & History) │
│   │   │   ├── admin               (Admin Live Attendance)   │
│   │   │   ├── history             (Staff History)           │
│   │   │   └── qr                  (LAN QR Display Kiosk)    │
│   │   ├── employees               (Staff Directory & RBAC)  │
│   │   ├── projects                (R&D Portfolio & Detail)  │
│   │   │   └── [id]                (Project Details & Labs)  │
│   │   ├── tasks                   (Task Board & Assignment) │
│   │   ├── work-logs               (Daily Activity Logs)     │
│   │   ├── training                (Technical Sessions)      │
│   │   ├── reports                 (Reporting & Analytics)   │
│   │   ├── audit                   (System Audit Trail)      │
│   │   ├── profile                 (User Profile & Security) │
│   │   └── admin-management        (Super Admin Management)  │
│   └── proxy.ts                    (Next.js 16 Route Guard)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
             ┌──────────────────┴──────────────────┐
             ▼                                     ▼
┌──────────────────────────────┐       ┌──────────────────────────────┐
│  State & Hooks Layer         │       │  Design System & Components  │
│  • AuthContext / useAuth     │       │  • Lucide React Icons        │
│  • TanStack Query v5         │       │  • Tailwind CSS Utility Sys  │
│  • useCurrentTime            │       │  • Topbar & Sidebar Shell    │
│  • api (Axios + Credentials) │       │  • Glassmorphism Design      │
└──────────────────────────────┘       └──────────────────────────────┘
```

---

## 📁 Repository & Directory Layout

```text
frontend/
├── public/                     # Static assets (favicons, brand icons)
├── src/
│   ├── app/                    # Next.js 16 App Router (19 routes)
│   │   ├── (auth)/login/       # Split-pane dual-identifier login page
│   │   ├── (protected)/        # Protected workspace shell
│   │   │   ├── admin-management/ # Super Admin portal (max 2 slots, manage admins)
│   │   │   ├── attendance/     # Live punch in/out and daily status
│   │   │   │   ├── admin/      # Admin roster & audited corrections
│   │   │   │   ├── history/    # Personal historical punch log
│   │   │   │   └── qr/         # Tablet-mount QR kiosk scanner
│   │   │   ├── audit/          # System audit trail event viewer
│   │   │   ├── dashboard/      # Role-differentiated executive dashboard
│   │   │   ├── employees/      # Staff directory, role management, activations
│   │   │   ├── profile/        # Self-service password and profile
│   │   │   ├── projects/       # R&D project portfolio
│   │   │   │   └── [id]/       # Nested experiments & development notes
│   │   │   ├── reports/        # Executive reporting, attendance & task analytics
│   │   │   ├── tasks/          # Kanban / list task tracker & state machine
│   │   │   ├── training/       # Technical training sessions & attendee logs
│   │   │   ├── work-logs/      # Daily work log journal & reviews
│   │   │   └── layout.tsx      # Authenticated shell (Sidebar + Topbar)
│   │   ├── globals.css         # Tailwind tokens & dark theme
│   │   ├── layout.tsx          # Root HTML layout & font provider
│   │   ├── page.tsx            # Root redirect (/ -> /dashboard)
│   │   └── providers.tsx       # TanStack Query & AuthProvider wrapper
│   ├── components/             # Modular UI components
│   │   ├── attendance/         # Attendance punch cards, corrections dialog
│   │   ├── dashboard/          # MetricCard, StatWidget, QuickActions
│   │   ├── employees/          # EmployeeTable, UserModal, ResetPasswordModal
│   │   ├── layout/             # Sidebar, Topbar, MobileNavigation
│   │   ├── projects/           # ProjectCard, ExperimentList, DevRecordModal
│   │   ├── shared/             # SearchInput, Pagination, ConfirmDialog
│   │   ├── tasks/              # TaskCard, TaskStatusBadge, CreateTaskModal
│   │   ├── training/           # SessionCard, TrainingModal, AttendeeRoster
│   │   ├── ui/                 # Button, Input, Modal, Badge, Dropdown
│   │   └── work-logs/          # WorkLogCard, WorkLogFilters, LogModal
│   ├── contexts/
│   │   └── AuthContext.tsx     # Session state & nevolyn_session cookie writer
│   ├── hooks/
│   │   ├── useAuth.ts          # Authentication accessor hook
│   │   ├── useCurrentTime.ts   # Real-time clock for attendance & topbar
│   │   └── useDebounce.ts      # Debounced search & filter inputs
│   ├── lib/
│   │   ├── api.ts              # Axios client, 401 redirect mutex & dual-auth
│   │   ├── constants.ts        # System roles, task statuses, navigation items
│   │   ├── formatters.ts       # Dates, durations, and currency formatters
│   │   └── utils.ts            # Classnames helper (cn)
│   ├── proxy.ts                # Next.js 16 route protection proxy
│   └── types/
│       └── index.ts            # Complete TypeScript domain contracts
├── package.json                # Dependencies and npm scripts
├── tsconfig.json               # Strict TypeScript configuration
└── vercel.json                 # Vercel deployment & security headers
```

---

## 🛡️ Edge Route Guard (`src/proxy.ts`)

Next.js 16 introduced the `proxy` convention (exporting `function proxy(request)`) which supersedes the deprecated `middleware.ts`. In this architecture:

1. **Session Gating**: `src/proxy.ts` runs on the Edge and inspects the lightweight `nevolyn_session` cookie.
2. **Protected Route Redirection**: If a user without an active `nevolyn_session` cookie navigates to any protected route (`/dashboard`, `/attendance`, `/employees`, `/projects`, `/tasks`, `/work-logs`, `/training`, `/reports`, `/audit`, `/profile`, `/admin-management`), they are automatically redirected:
   ```text
   GET /tasks ──> 307 Temporary Redirect ──> /login?from=%2Ftasks
   ```
3. **Login Bypass**: If an already-authenticated user navigates to `/login`, they are automatically forwarded to `/dashboard`.
4. **Root Forwarding**: Navigation to `/` cleanly redirects to `/dashboard` (or `/login` if unauthenticated).

---

## 🔐 Dual-Token & Dual-Cookie Authentication

To provide seamless security across different browsers, mobile devices, and cross-site cloud platforms:

1. **Backend HttpOnly Cookie (`nevolyn_access_token`)**:
   - The Spring Boot backend emits an `HttpOnly`, `Secure` cookie carrying the signed HMAC-SHA512 JWT.
   - Configured with `SameSite=None` in production to allow secure cross-site delivery between Vercel and Render.
2. **Frontend Session Cookie (`nevolyn_session=1`)**:
   - Written by `AuthContext` in browser JavaScript upon successful authentication.
   - Read by the Next.js 16 Edge `proxy.ts` to enforce instant routing checks without exposing the raw JWT secret.
3. **Bearer Authorization Fallback**:
   - In addition to cookies, `src/lib/api.ts` stores the access token in memory/storage and passes it via `Authorization: Bearer <token>`.
   - The backend's `JwtAuthenticationFilter` validates the bearer header if third-party cookies are blocked by browser privacy modes (e.g. Safari ITP).
4. **401 Interceptor Mutex**:
   - `api.ts` implements an `isRedirecting` mutex. If an expired session returns HTTP 401, all cookies and tokens are cleanly purged once, avoiding redirect storms and infinite loops.

---

## ⚙️ Environment Configuration & Zero Local `.env` Policy

> [!IMPORTANT]
> **Strict Security Rule:**  
> The `frontend/` directory does **not** contain or track local `.env` or `.env.production` files.  
> All environment configuration is handled via **Vercel Project Settings** and resilient code fallbacks.

### API Base URL Resolution (`src/lib/api.ts`)
The API base URL is resolved automatically using the following priority:
1. `process.env.NEXT_PUBLIC_API_URL` (injected at build time by Vercel or local runner).
2. If running in browser and URL matches `office.nevolyn.com`, routes to `https://api.office.nevolyn.com/api/v1`.
3. If running in browser and URL matches `*.vercel.app`, routes to `https://nevolyn-office-management.onrender.com/api/v1`.
4. Fallback for local development: `http://localhost:8080/api/v1`.

### Configuring Vercel Environment Variables
In **Vercel Project Settings $\rightarrow$ Environment Variables**:
- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://nevolyn-office-management.onrender.com/api/v1` *(or custom domain `https://api.office.nevolyn.com/api/v1`)*
- **Environments:** Production, Preview
- **Visibility:** `type: Config` (Plaintext — Vercel requires public `NEXT_PUBLIC_` variables to be non-secret).

---

## 🚀 Local Development & Verification

### Prerequisites
- **Node.js**: 20 LTS or 22 LTS (`node -v`)
- **Package Manager**: `npm` (`npm -v`)

### Commands

```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Run strict TypeScript compiler verification (zero errors)
npm run type-check

# Run ESLint static analysis
npm run lint

# Build production bundle using Turbopack
npm run build
```

---

## 🛡️ Security Headers (`vercel.json`)

Vercel applies strict HTTP response headers configured in `vercel.json`:
- `X-Frame-Options: DENY` — Prevents clickjacking.
- `X-Content-Type-Options: nosniff` — Prevents MIME-type sniffing.
- `X-XSS-Protection: 1; mode=block` — Enables legacy XSS filtering.
- `Referrer-Policy: strict-origin-when-cross-origin` — Protects referral privacy.
