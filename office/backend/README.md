# Nevolyn Office Management — Backend Application

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot 3.3](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security 6](https://img.shields.io/badge/Spring%20Security-6.3-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![Flyway](https://img.shields.io/badge/Flyway-10.x-CC0202?style=for-the-badge&logo=flyway&logoColor=white)](https://flywaydb.org/)
[![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

The backend service for **Nevolyn Office Management** is a high-performance **modular monolith** developed using **Java 21 LTS** and **Spring Boot 3.3.4**. It powers all business logic, attendance tracking, project portfolio management, security perimeters, and asynchronous audit trails behind a strongly-typed RESTful API.

---

## 🌐 Production Deployments & Endpoints

- **Production REST API Base URL:** [https://api.office.nevolyn.com/api/v1](https://api.office.nevolyn.com/api/v1)
- **Render Service Hostname:** [https://nevolyn-office-management.onrender.com](https://nevolyn-office-management.onrender.com)
- **Spring Boot Health Actuator:** [https://nevolyn-office-management.onrender.com/actuator/health](https://nevolyn-office-management.onrender.com/actuator/health)
- **Interactive OpenAPI Console:** [https://nevolyn-office-management.onrender.com/swagger-ui.html](https://nevolyn-office-management.onrender.com/swagger-ui.html)

---

## 🏗️ Architecture & Domain Structure

The application is structured into encapsulated, domain-driven packages under `com.nevolyn.officemanagement`:

```text
com.nevolyn.officemanagement/
├── attendance/                # Check-in, check-out, QR kiosk & punctuality rules
├── audit/                     # Synchronous, immutable security audit logging
├── auth/                      # Authentication controller, login, and JWT service
├── common/                    # Global exception handler, RFC-7807 problem envelopes
├── dashboard/                 # Executive KPI metrics and employee dashboard
├── development/               # Technical development notes and version iterations
├── experiment/                # Research & Development lab experiment protocols
├── file/                      # Multi-part document upload & secure streaming
├── project/                   # Project lifecycle, milestones, budget & status
├── report/                    # Organizational summaries, attendance & task analytics
├── security/                  # Spring Security 6 config, JWT & NetworkAccess filters
├── task/                      # Task queue, assignment, priority & state machine
├── training/                  # Technical training workshops and attendee tracking
├── user/                      # Staff directory, 3-tier RBAC rules & credentials
└── worklog/                   # Daily employee activity logs and manager reviews
```

---

## 🔐 Three-Tier Privilege Model (RBAC)

The backend enforces a strict three-tier privilege hierarchy:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPER_ADMIN (Max 2 Slots)                       │
│  - System Co-Founders with full root authorization                     │
│  - Exclusive privilege to create, update, or deactivate ADMIN accounts │
│  - Excluded from office LAN network perimeter restrictions             │
│  - Provisioned via environment variables on boot (AdminAccountInit)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                                 ADMIN                                  │
│  - Operational managers overseeing projects, tasks, attendance & logs  │
│  - Can create and manage standard EMPLOYEE accounts                    │
│  - CANNOT create, modify, or deactivate ADMIN or SUPER_ADMIN accounts  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                               EMPLOYEE                                 │
│  - Least-privilege staff access (personal dashboard, punch, tasks)     │
│  - Restricted to Office LAN subnet (192.168.68.0/24) or hardware token │
│  - Can only view and update their own assigned work and records        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Network Perimeter Security (`NetworkAccessFilter`)

To prevent unauthorized remote punch-ins, standard employee requests are evaluated before hitting Spring Security filters:
1. **Authorized Subnets:** Requests must originate from the office LAN subnet (`192.168.68.0/24`) or local loopback (`127.0.0.1`, `::1`).
2. **Hardware Bypass Token:** Alternatively, requests carrying the matching `X-RD-Wifi-Token` header are permitted.
3. **Manager Exemption:** `ADMIN` and `SUPER_ADMIN` accounts are automatically exempt from LAN restrictions to enable secure remote management.
4. **Foreign IP Rejection:** Unauthorized external requests receive HTTP `403 Forbidden` with a descriptive message.

---

## 🗄️ Database & Schema Migrations (Flyway)

Data persistence is managed via **PostgreSQL 17.6** on **Supabase** (AWS Mumbai `ap-south-1`).  
Flyway executes versioned SQL migrations automatically on application boot (`backend/src/main/resources/db/migration/`):

| Migration | Target Table / Scope | Purpose |
|---|---|---|
| `V1__create_users.sql` | `users` | User credentials, roles, designations |
| `V2__create_attendance.sql` | `attendance` | Punch-in/out timestamps, hours, late status |
| `V3__create_rnd_projects.sql` | `rnd_projects` | Project codes (`PRJ-001`), milestones, status |
| `V4__create_tasks.sql` | `tasks` | Tasks, assignees, priorities, state machine |
| `V5__create_experiments.sql` | `rnd_experiments` | R&D hypotheses, methodologies, findings |
| `V6__create_development_records.sql` | `rnd_developments` | Technical logs, architecture milestones |
| `V7__create_work_logs.sql` | `work_logs` | Daily work activity journal & hours |
| `V8__create_trainings_meetings.sql` | `trainings_meetings` | Technical sessions & attendee attendance |
| `V9__create_uploaded_files.sql` | `uploaded_files` | Document attachment metadata & hashes |
| `V10__create_audit_logs.sql` | `audit_logs` | Synchronous immutable security event log |
| `V11__add_super_admin_role.sql` | `users` | `super_admin` role support & lookup index |

---

## ☁️ Cloud Production Deployment (Render)

The backend is packaged as a Docker container using a hardened multi-stage build:
- **Build Stage:** `eclipse-temurin:21-jdk-alpine` (`./gradlew bootJar -x test`).
- **Runtime Stage:** `eclipse-temurin:21-jre-alpine` running as unprivileged user `nevolyn` (`UID 1001`).
- **Configuration File:** [`render.yaml`](../render.yaml) defines the service `nevolyn-backend`.

### Key Production Environment Variables
| Variable | Value / Format | Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates `application-prod.yml` |
| `DATABASE_URL` | `jdbc:postgresql://...pooler.supabase.com:5432/postgres?...` | Supabase Session Pooler JDBC URL |
| `JWT_SECRET` | 64+ character random string | HMAC-SHA512 token signing key |
| `JWT_COOKIE_SECURE` | `true` | Enforces HTTPS-only transmission |
| `JWT_COOKIE_SAMESITE` | `None` | Enables cross-site cookies between Vercel and Render |
| `CORS_ALLOWED_ORIGINS` | `https://office.nevolyn.com,https://*.vercel.app` | Restricts cross-origin browser requests |
| `SUPER_ADMIN_1_USERNAME` | `<username>` | Bootstrap Super Admin 1 username |
| `SUPER_ADMIN_1_PASSWORD` | `<password>` | Bootstrap Super Admin 1 password |

---

## 🚀 Local Development & Testing

### Prerequisites
- **Java**: OpenJDK 21 LTS (`javac --version`)
- **Gradle**: Uses the bundled `./gradlew` wrapper

### Commands

```powershell
# Launch backend locally with local profile (reads root .env)
cd backend
.\gradlew.bat bootRun --args='--spring.profiles.active=local'

# Run complete test suite (50 unit & MockMvc integration tests)
.\gradlew.bat test

# View generated test report
start build/reports/tests/test/index.html
```
