# NEVOLYN Technology — Office & R&D Management System Handbook

> Complete technical architecture, security model, three-tier role-based access control (RBAC), database schema, attendance policies, and API specifications for the unified **NEVOLYN Office & HRM Management Portal** (`/office`).

---

## 🎯 1. System Overview & Unified Architecture

The NEVOLYN Office & HRM Management System is fully embedded into the primary monorepo stack:
- **No separate repositories or disconnected Docker containers.**
- **Single Backend Service (`backend/`)**: Spring Boot 3 (Java 21) serves both the public corporate website APIs (`/api/v1/contact`, `/api/v1/applications`) and the Office Management REST APIs (`/api/v1/auth`, `/api/v1/users`, `/api/v1/attendance`, `/api/v1/tasks`, `/api/v1/projects`, `/api/v1/work-logs`, `/api/v1/reports`, `/api/v1/audit`).
- **Single Frontend Service (`frontend/`)**: Next.js 16 (App Router) serves:
  - Official Website: `https://nevolyn.com`
  - Operations Dashboard: `https://nevolyn.com/admin` (with direct button link to Office Portal)
  - Office & HRM Portal: `https://nevolyn.com/office`
- **Single Database Service**: PostgreSQL with Flyway version-controlled migrations (`V1` through `V4`).

---

## 🔐 2. Three-Tier RBAC & Password Architecture

Authentication is powered by standard JWT Bearer tokens (with 8-hour expiry). The system implements a hierarchical three-tier role model:

| Level | Role Identifier | Scope & Capabilities |
|---|---|---|
| **Tier 1: Super Admin** | `super_admin` (`ROLE_SUPER_ADMIN`) | System Owners. Maximum 2 accounts. Complete system control, promotion/demotion of Administrators (`/office/admin-management`), plus full Admin and Employee capabilities. |
| **Tier 2: Admin** | `admin` (`ROLE_ADMIN`) | Office & Operations Managers. Can add/edit employees and bank details, manage R&D projects, assign tasks, correct attendance records, and review organization reports. |
| **Tier 3: Employee** | `employee` (`ROLE_EMPLOYEE`) | R&D Engineers & Staff. Can log daily work, transition assigned tasks, view personal attendance, scan attendance QR codes, and update personal profile. |

### Personnel Roles & Standardized Employee IDs

All employee IDs follow the standard specification:
$$\text{nev\_}\langle\text{username}\rangle\text{\_}\langle\text{joining\_date (YYYY-MM-DD)}\rangle$$

#### 1. Md Rahinur Rahman
* **Designation**: Founder & AI Systems Engineer
* **Employee ID**: `nev_rahinrahman_2026-01-15`
* **Username**: `rahinrahman`
* **Joining Date**: 15 January 2026
* **Roles**: `super_admin`, `admin`, `employee`
* **Password Variable**: Configured via `SUPER_ADMIN_SHARED_PASSWORD` / `ADMIN_SHARED_PASSWORD` / `EMPLOYEE_RAHIN_PASSWORD`

#### 2. Mohammad Ninad Mahmud Nobo
* **Designation**: Co-Founder & AI Software Engineer
* **Employee ID**: `nev_mninadmnobo_2026-07-01`
* **Username**: `mninadmnobo`
* **Joining Date**: 1 July 2026
* **Roles**: `super_admin`, `admin`, `employee`
* **Password Variable**: Configured via `SUPER_ADMIN_SHARED_PASSWORD` / `ADMIN_SHARED_PASSWORD` / `EMPLOYEE_NOBO_PASSWORD`

#### 3. Afzal Hossan
* **Designation**: AI Software Engineer (Administrator — *not a Co-Founder*)
* **Employee ID**: `nev_afzalhossan_2026-11-01`
* **Username**: `afzalhossan`
* **Joining Date**: 1 November 2026
* **Roles**: `admin`, `employee`
* **Password Variable**: Configured via `ADMIN_SHARED_PASSWORD` / `EMPLOYEE_AFZAL_PASSWORD`

#### 4. Mobashira Mehajabin Nomrota
* **Designation**: Innovation and Systems Engineer
* **Employee ID**: `nev_nomrota_2026-11-01`
* **Username**: `nomrota`
* **Joining Date**: 1 November 2026
* **Roles**: `employee`
* **Password Variable**: Configured via `EMPLOYEE_NOMROTA_PASSWORD`

---

## 🏢 3. Office Network vs. Remote Access Rules

The portal balances workplace accountability with seamless remote collaboration:

| Functionality | Network Requirement | Policy |
|---|---|---|
| **Office Attendance QR Scan** | Office LAN / Wi-Fi (`192.168.*`, `10.*`, or Office Public IP) | Validates physical presence. Check-in after **09:15 AM** is recorded as **Late**. End of day checkout records total hours. |
| **Login (`/office/login`)** | Any Internet Connection | Accessible globally for all tiers. |
| **Task Management** | Any Internet Connection | Employees can transition task status (`PENDING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`) remotely. |
| **Daily Work Logs** | Any Internet Connection | Employees can record daily achievements and blockers from home or office. |
| **Profile & Bank Details** | Any Internet Connection | Employees can view profiles; Admins can update bank routing and account numbers. |
| **Admin Operations** | Any Internet Connection | Admins/Super Admins have unrestricted access worldwide. |

---

## 🗄️ 4. Database Schema (`db/migration/V4__create_office_management_tables.sql`)

Flyway Migration `V4` creates 10 normalized tables in the primary database:

1. `users` — Authentication credentials, role (`super_admin`, `admin`, `employee`), joining date, phone, email, and banking details (`bank_name`, `bank_account_name`, `bank_account_number`, `bank_branch`, `bank_routing_number`).
2. `attendance` — Daily attendance, check-in time, check-out time, late status (`On Time` / `Late`), total hours, client IP, and user-agent.
3. `rnd_projects` — R&D project codes, objectives, descriptions, leaders, target dates, and completion status.
4. `tasks` — Work tasks assigned to specific employees with priorities, deadlines, and completion percentages.
5. `experiments` — Research laboratory experiments, procedures, observations, and conclusions.
6. `development_records` — Product versioning, prototype stages, test results, and next actions.
7. `work_logs` — Daily activity reports submitted by employees.
8. `trainings_meetings` — Technical seminars, internal workshops, and meeting minutes.
9. `uploaded_files` — Metadata and filesystem references for technical attachments.
10. `audit_logs` — Tamper-evident trail of administrative updates and check-in events.

---

## 🌐 5. REST API Route Directory

All endpoints use standard JSON payloads and are prefixed with `/api/v1/`:

### Authentication & Self-Service
- `POST /api/v1/auth/login` — Public login endpoint; accepts username or employee ID + password; returns JWT token and user profile.

### Personnel & Employee Management
- `GET /api/v1/users` — List active employees (Admin/Super Admin).
- `POST /api/v1/users` — Add a new employee into the database (Admin/Super Admin).
- `PUT /api/v1/users/{id}` — Update employee details, including designation and bank info (Admin/Super Admin).
- `PATCH /api/v1/users/{id}/toggle-status` — Enable or disable an account (Admin/Super Admin).
- `GET /api/v1/users/admins` — List administrative staff (Super Admin only).
- `POST /api/v1/users/admins` — Promote an employee to Administrator (Super Admin only).

### Attendance
- `POST /api/v1/attendance/check-in` — Record daily arrival time (Employee).
- `POST /api/v1/attendance/check-out` — Record daily departure and compute hours (Employee).
- `GET /api/v1/attendance/today` — Retrieve today's status for the logged-in user.
- `GET /api/v1/admin/attendance` — Retrieve date-filtered attendance across all employees (Admin).
- `POST /api/v1/admin/attendance/correct` — Manual administrative correction of check-in/out records (Admin).
- `GET /api/v1/admin/attendance/qr-info` — Returns server IP and QR endpoint for wall-mount kiosk display.

### Tasks & R&D Workflow
- `GET /api/v1/tasks` — List tasks (Admin sees all; Employee sees assigned).
- `POST /api/v1/tasks` — Create and assign a new task (Admin).
- `PATCH /api/v1/tasks/{id}` — Update task status or progress (Employee/Admin).
- `GET /api/v1/projects` — List R&D projects and milestones.
- `POST /api/v1/work-logs` — Submit daily work log entry (Employee).

---

## 🖥️ 6. Frontend Portal Routes (`frontend/app/office/`)

The Office Portal is implemented natively in Next.js App Router:

* `/office/login` — Corporate login page supporting username or Employee ID.
* `/office/dashboard` — Role-aware executive or employee dashboard.
* `/office/employees` — Staff directory with add/edit employee modals and bank detail views.
* `/office/admin-management` — Super Admin portal for managing system administrator accounts.
* `/office/attendance` — Personal attendance calendar and QR check-in scanner.
* `/office/projects` — R&D project tracking and milestone management.
* `/office/tasks` — Kanban task board with status filtering.
* `/office/work-logs` — Daily work journal submission and supervisor review.
* `/office/training` — Technical training sessions and internal seminar minutes.
* `/office/reports` — Monthly attendance, task completion, and R&D summary export.
* `/office/audit` — System security logs and audit trail inspection.
* `/office/profile` — Personal profile view and credential verification.

