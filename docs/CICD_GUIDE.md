# Saturn Textiles R&D — Master CI/CD, Database & Deployment Handbook

> Complete educational guide to understanding **CI/CD Automation Pipelines**, **Database Access & Management**, **Container Orchestration (Docker)**, and **Step-by-Step Custom Domain Deployment** for beginners.

---

## 💡 1. Beginner Intuition: What is CI/CD?

If you are new to software engineering, think of **CI/CD** as two automated robotic assistants working in your repository:

```text
 1. You push code to GitHub: git push origin main
              │
              ▼
 🤖 CI (Continuous Integration) ──> The Automated Testing Robot
              │                     Checks TypeScript & compiles Java code automatically.
              ▼
 🚚 CD (Continuous Deployment)  ──> The Shipping Conveyor Belt
                                    Packages verified code into Docker containers and 
                                    updates your live website on your server domain.
```

### The Difference in Simple Terms:
- **CI (Continuous Integration)** = **Quality Control**. Whenever you push code to GitHub, a virtual machine spins up automatically to verify `pnpm build` (Frontend) and `./mvnw package` (Backend). If there is a syntax error or broken build, it alerts you immediately.
- **CD (Continuous Deployment)** = **Live Delivery**. Once tests pass, the automated system takes your code and updates the live website on your server or custom domain name without you having to log in manually.

---

## 🗂️ 2. File-by-File Deployment Blueprint

Here is every deployment file in your repository and exactly what it does:

| File Location | Purpose | What it Does |
| :--- | :--- | :--- |
| **`.github/workflows/deploy-and-test.yml`** | GitHub Actions Pipeline Script | Tells GitHub's automated robot: *"Every time code is pushed, install pnpm, test Next.js compilation, and compile Spring Boot Java 21 code."* |
| **`docker-compose.yml`** | Container Orchestrator | Launches all 3 services together locally or on a server with 1 command (`docker compose up -d`): Frontend, Backend, and PostgreSQL database. |
| **`backend/Dockerfile`** | Java Backend Container Builder | Builds an optimized, lightweight Linux container containing your Spring Boot Java 21 app. |
| **`frontend/Dockerfile`** | Next.js Frontend Container Builder | Builds a standalone Node.js container for your Next.js 16 app. |
| **`frontend/.env.example`** | Environment Blueprint | Shows where to set your backend API URL (`NEXT_PUBLIC_API_URL`). |

---

## 🗄️ 3. Where is My Database & How to Access It?

Your database operates in **two distinct modes** so you don't need to manually configure database software during development:

```text
               ┌──> Local Dev Mode    ──> In-Memory H2 Database (http://localhost:8080/h2-console)
Database Mode ─┤
               └──> Production / Docker ──> PostgreSQL 16 Container (docker-compose.yml)
```

---

### A. Local Development Mode (Zero-Setup In-Memory H2 Database)

When you run your backend locally (`cd backend && ./mvnw spring-boot:run`), your database runs **inside memory automatically** using H2. You do NOT need to install MySQL or PostgreSQL!

#### 🖥️ How to View Your Database in the Browser:

1. Start your Spring Boot backend:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
2. Open this link in your browser:
   👉 **[http://localhost:8080/h2-console](http://localhost:8080/h2-console)**
3. On the login screen, enter:
   - **Driver Class**: `org.h2.Driver`
   - **JDBC URL**: `jdbc:h2:mem:saturn_rnd_db`
   - **User Name**: `sa`
   - **Password**: *(leave empty)*
4. Click **Connect**.

You will see all 3 database tables right in your browser:
- 📋 `CONTACT_INQUIRIES` (stores contact form messages)
- 📄 `JOB_APPLICATIONS` (stores job applications & uploaded CV paths)
- 👥 `TEAM_MEMBERS` (stores dynamic engineering staff records)

---

### B. Production & Containerized Mode (PostgreSQL 16)

When running via Docker (`docker compose up -d`), your database is **PostgreSQL 16**.

Configured automatically inside [`docker-compose.yml`](../docker-compose.yml):

```yaml
  db:
    image: postgres:16-alpine
    container_name: saturn_db
    environment:
      POSTGRES_DB: ${DB_NAME:-saturn_rnd_db}
      POSTGRES_USER: ${DB_USER:-saturn_admin}
      POSTGRES_PASSWORD: ${DB_PASS:-Saturn_Secure_Pass_2026!}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data # Data is saved safely here!
```

#### 📊 Development vs. Production Database Credential Matrix

| Property | Local Development (H2 In-Memory) | Production / Docker (PostgreSQL 16) |
| :--- | :--- | :--- |
| **Engine** | H2 In-Memory (`org.h2.Driver`) | PostgreSQL 16 Alpine (`org.postgresql.Driver`) |
| **Database Name** | `saturn_rnd_db` | `saturn_rnd_db` |
| **Username** | `sa` | `saturn_admin` (or `${DB_USER}`) |
| **Password** | *(No password)* | `Saturn_Secure_Pass_2026!` (or `${DB_PASS}`) |
| **Host / Port** | `localhost:8080` (H2 Web Console) | `localhost:5432` |
| **Data Safety** | Re-initialized in memory on restart | Saved to Docker volume `postgres_data` |

---

## 🚀 4. Step-by-Step Guide: Deploying to Your Custom Domain

When you acquire your custom domain name (e.g. `saturntextiles.com` for Frontend and `api.saturntextiles.com` for Backend), follow this simple 5-step checklist:

---

### Step 1: Set Up Your Server (VPS or Cloud Instance)
Get any Linux server (e.g., DigitalOcean Droplet, Hetzner, AWS EC2, Linode, or private server) with Ubuntu Linux installed.

Log into your server via SSH:
```bash
ssh root@your-server-ip
```

Install Docker and Git on your server:
```bash
# Install Docker & Docker Compose
apt update && apt install -y docker.io docker-compose-v2 git
```

---

### Step 2: Configure DNS Domain Name Records
Log into your Domain Registrar (e.g. Namecheap, GoDaddy, Cloudflare, Google Domains) and create 2 **A Records** pointing to your server's IP address:

| Record Type | Host / Subdomain | Value (IP Address) | Points To |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` (or `www`) | `YOUR_SERVER_IP` | `saturntextiles.com` (Frontend) |
| **A Record** | `api` | `YOUR_SERVER_IP` | `api.saturntextiles.com` (Backend) |

---

### Step 3: Configure Environment Variables
Clone your repository onto your server:
```bash
git clone https://github.com/mninadmnobo/saturn_rnd_portfolio.git
cd saturn_rnd_portfolio
```

Set your domain environment variables inside `docker-compose.yml` or `.env`:
- `NEXT_PUBLIC_API_URL` = `https://api.saturntextiles.com`
- `APP_CORS_ALLOWED_ORIGINS` = `https://saturntextiles.com`

---

### Step 4: Launch Docker Containers
Run 1 command to launch your Frontend, Backend, and PostgreSQL database:

```bash
docker compose up -d --build
```

Verify all containers are running:
```bash
docker ps
```

---

### Step 5: Enable Free HTTPS SSL Certificates (Certbot)
To get the lock icon (`https://`) on your domain, install Certbot:

```bash
# Install Certbot & Nginx
apt install -y nginx certbot python3-certbot-nginx

# Obtain free SSL certificates for both domain names
certbot --nginx -d saturntextiles.com -d api.saturntextiles.com
```

🎉 **Congratulations!** Your monorepo is now live on your custom domain with secure HTTPS encryption!

---

## 🗺️ 5. Total End-to-End Deployment Master Workflow

Here is the complete high-level lifecycle diagram from local coding to production custom domain:

```text
 ┌───────────────────────────────────────────────────────────────────────────┐
 │ Phase 1: Local Development & Verification                                 │
 │ - Frontend on http://localhost:3000 (Next.js 16)                         │
 │ - Backend on http://localhost:8080 (Spring Boot Java 21)                 │
 │ - H2 Database Console at http://localhost:8080/h2-console                │
 └─────────────────────────────────────┬─────────────────────────────────────┘
                                       │
                                       ▼ git push origin main
 ┌───────────────────────────────────────────────────────────────────────────┐
 │ Phase 2: GitHub Actions Automated CI Quality Check                        │
 │ - `.github/workflows/deploy-and-test.yml` triggers on push                │
 │ - Runs `pnpm type-check` + Next.js build in frontend/                     │
 │ - Runs `./mvnw clean package` in backend/                                 │
 └─────────────────────────────────────┬─────────────────────────────────────┘
                                       │
                                       ▼ Code Approved & Verified
 ┌───────────────────────────────────────────────────────────────────────────┐
 │ Phase 3: Custom Domain & Server Setup                                     │
 │ - Point A Records for saturntextiles.com & api.saturntextiles.com to VPS   │
 │ - Set NEXT_PUBLIC_API_URL & APP_CORS_ALLOWED_ORIGINS                      │
 └─────────────────────────────────────┬─────────────────────────────────────┘
                                       │
                                       ▼ docker compose up -d --build
 ┌───────────────────────────────────────────────────────────────────────────┐
 │ Phase 4: Production Container Launch & SSL Encryption                     │
 │ - Docker spins up Next.js + Spring Boot + PostgreSQL containers           │
 │ - Certbot issues free HTTPS SSL certificates (`certbot --nginx`)           │
 └───────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 6. Useful Maintenance Commands

```bash
# View live logs for all running services:
docker compose logs -f

# View live backend logs specifically:
docker compose logs -f backend

# Restart services after updating code:
git pull
docker compose up -d --build

# Stop all services:
docker compose down
```

---

## ☁️ 7. Vercel (Frontend) & Render (Backend) Cloud Hosting Guide

For managed serverless/cloud deployment without managing your own VPS, use **Vercel** for the Next.js frontend and **Render** for the Spring Boot backend + PostgreSQL database.

```text
 ┌──────────────────────┐         HTTP API         ┌──────────────────────┐
 │  Vercel (Frontend)   │ ───────────────────────> │   Render (Backend)   │
 │ Next.js App Router   │ <─────────────────────── │ Spring Boot REST API │
 │ saturn-rnd.vercel.app│         CORS Allowed     └──────────┬───────────┘
 └──────────────────────┘                                     │
                                                         PostgreSQL
                                                              ▼
                                                   ┌──────────────────────┐
                                                   │ Render PostgreSQL DB │
                                                   └──────────────────────┘
```

### A. Step 1: Deploy Backend & Database on Render (Blueprint)
1. Log into [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository (`saturn_rnd_portfolio`).
4. Render will automatically detect `render.yaml` at the root of the project:
   - **Database**: `saturn-rnd-db` (PostgreSQL 16)
   - **Web Service**: `saturn-rnd-backend` (Built via `backend/Dockerfile`)
5. Click **Apply**.
6. Once deployed, copy your backend URL (e.g. `https://saturn-rnd-backend.onrender.com`).
7. Copy your Render Deploy Hook URL from **Settings -> Deploy Hook** in your web service dashboard.

### B. Step 2: Deploy Frontend on Vercel
1. Log into [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`saturn_rnd_portfolio`).
4. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: Select `frontend`
5. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL`: `https://saturn-rnd-backend.onrender.com` (Your Render backend URL)
6. Click **Deploy**. Vercel will build and assign your site URL (e.g. `https://saturn-rnd.vercel.app`).

### C. Step 3: Configure GitHub Secrets for Auto-Deployment
To trigger backend auto-deployments when pushing to `main`:
1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Add:
   - **Name**: `RENDER_DEPLOY_HOOK_URL`
   - **Value**: `https://api.render.com/deploy/srv-xxxxxxxxxxxx` (Your Render deploy hook URL)
4. Now, every push to `main` runs CI tests in GitHub Actions and automatically deploys the latest code to Render and Vercel!

