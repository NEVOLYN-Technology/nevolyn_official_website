# NEVOLYN Technology — Custom Domain Setup Guide (`nevolyn.com`)

This guide explains how to connect your acquired domain **`nevolyn.com`** to the live production deployment.

---

## 🌐 Architecture Overview

| Component | Target Host | Origin / URL | Purpose |
| :--- | :--- | :--- | :--- |
| **Apex Frontend** | Vercel Edge | `https://nevolyn.com` | Primary visitor entrance |
| **WWW Subdomain** | Vercel Edge | `https://www.nevolyn.com` | 308 redirect to `nevolyn.com` |
| **Backend REST API**| Render Cloud | `https://api.nevolyn.com` | Spring Boot 3 REST service |

---

## 🚀 Step 1: Vercel Frontend Configuration (`nevolyn.com`)

1. Go to your **[Vercel Dashboard](https://vercel.com/)** and select your `nevolyn_official_website` project.
2. Navigate to **Settings** → **Domains**.
3. Add **`nevolyn.com`** (Recommended: configure it to redirect `www.nevolyn.com` to `nevolyn.com`).
4. Go to **Settings** → **Environment Variables** and ensure:
   - `NEXT_PUBLIC_API_URL` = `https://api.nevolyn.com/api/v1`
5. Trigger a Redeploy (Vercel inlines `NEXT_PUBLIC_*` variables at build time).

---

## ⚡ Step 2: Render Backend Configuration (`api.nevolyn.com`)

1. Go to your **[Render Dashboard](https://dashboard.render.com/)** and select your web service (`nevolyn-backend`).
2. Navigate to **Settings** → **Custom Domains**.
3. Click **Add Custom Domain** and enter: **`api.nevolyn.com`**.
4. In **Environment Variables**, verify/set:
   - `APP_FRONTEND_URL` = `https://nevolyn.com`
   - `APP_BACKEND_URL` = `https://api.nevolyn.com`
   - `APP_CORS_ALLOWED_ORIGINS` = `https://nevolyn.com,https://www.nevolyn.com,https://nevolyn.vercel.app`
   - `APP_EMAIL_FROM` = `info@nevolyn.com`

---

## 📋 Step 3: DNS Records Configuration

Add these DNS records with your domain registrar (Cloudflare, Namecheap, GoDaddy, Google Domains, etc.):

| Type | Host / Name | Value / Target | Notes |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | Points `nevolyn.com` to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Points `www.nevolyn.com` to Vercel |
| **CNAME** | `api` | `<your-render-service>.onrender.com` | Points `api.nevolyn.com` to Render |

*(Note: Render will provide the exact CNAME target in your dashboard settings).*

---

## ✉️ Step 4: Email Authentication (SPF / DKIM / DMARC)

To ensure verification and contact emails from `@nevolyn.com` land in primary inboxes (not spam):

1. **Sender Authentication**: In your Brevo dashboard, add and verify sender domain `nevolyn.com`.
2. **SPF Record** (TXT on `@`):
   ```text
   v=spf1 include:spf.brevo.com ~all
   ```
3. **DKIM Record** (TXT):
   Add the DKIM TXT record provided by Brevo.
4. **DMARC Record** (TXT on `_dmarc`):
   ```text
   v=DMARC1; p=none; rua=mailto:dmarc@nevolyn.com
   ```

---

## 🔍 Step 5: Verification & Health Check

Once DNS propagates (usually 5–30 minutes):
1. **Frontend**: Open `https://nevolyn.com` — confirm SSL padlock and theme loading.
2. **Robots**: Open `https://nevolyn.com/robots.txt` — verify automated sitemap reference.
3. **Sitemap**: Open `https://nevolyn.com/sitemap.xml` — verify XML structure.
4. **API Health**: Open `https://api.nevolyn.com/actuator/health` — should return `{"status":"UP"}`.
