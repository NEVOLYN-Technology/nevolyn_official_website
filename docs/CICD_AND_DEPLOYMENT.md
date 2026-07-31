# CI/CD & Deployment Guide

Operational reference for the Saturn Textiles R&D Portfolio — architecture,
deployment procedure, the failure modes we actually hit, and the exact steps to
move onto a custom domain.

**Stack:** Spring Boot 3.4 (Java 21) · Next.js 16 / React 19 · PostgreSQL ·
Brevo · Render · Vercel

---

## Table of contents

1. [Architecture & topology](#1-architecture--topology)
2. [PostgreSQL JDBC URL parsing & environment precedence](#2-postgresql-jdbc-url-parsing--environment-precedence)
3. [Cloud PaaS port blocking — SMTP vs REST API](#3-cloud-paas-port-blocking--smtp-vs-rest-api)
4. [The CI/CD pipeline](#4-the-cicd-pipeline)
5. [First-time deployment](#5-first-time-deployment)
6. [Custom domain setup](#6-custom-domain-setup)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Architecture & topology

```mermaid
flowchart LR
    V["Visitor browser"]
    F["Frontend — Next.js 16<br/>Vercel edge CDN<br/>saturn-rnd.vercel.app"]
    B["Backend — Spring Boot 3<br/>Render web service (Docker)<br/>saturn-rnd-backend.onrender.com"]
    D[("PostgreSQL<br/>Render managed")]
    M["Brevo<br/>transactional email"]
    I["Admin + visitor inboxes"]

    V -->|HTTPS| F
    F -->|"fetch /api/v1/**<br/>CORS-guarded"| B
    B -->|JDBC :5432| D
    B -->|"HTTPS :443 REST API (primary)<br/>SMTPS :465 (fallback)"| M
    M --> I
    I -.->|"clicks verify link"| F
    F -->|"GET /verify?token=…"| B
```

### Request paths

| Path | Purpose |
|---|---|
| `POST /api/v1/contact` | Visitor inquiry — persists, emails a verification link |
| `GET /api/v1/contact/verify?token=` | Confirms ownership, triggers admin + receipt emails |
| `POST /api/v1/applications` | Careers application (multipart, CV upload) |
| `GET /api/v1/applications/verify?token=` | Same confirmation flow, CV attached to the admin email |
| `GET /actuator/health` | Liveness probe for Render — not part of the public API |

> **The team roster is static content, not an API.** It lives in
> [`frontend/lib/data/team.ts`](../frontend/lib/data/team.ts) and renders as a
> subsection of the Leaders section. To update the roster, edit that file and
> redeploy the frontend — no backend change, no migration.
>
> This split is deliberate: the roster changes a few times a year, is identical
> for every visitor, and is entirely public, so serving it over the network buys
> nothing and adds a failure mode (an empty team section whenever the free-tier
> backend is cold starting). Keep site content in `frontend/lib/data/`; the API
> and its database handle only what visitors submit.

### The three-step email pipeline

A submission is **not** delivered to the R&D team until the sender proves they
own the address. This is what keeps a public, unauthenticated form from becoming
a spam relay.

1. **Sender verification** — a tokenised link is emailed to the address supplied.
2. **Admin notification** — fires only after that link is clicked; carries the
   full dossier and, for job applications, the CV attachment.
3. **User acknowledgement** — receipt with the tracking ID (`INQ-…` / `APP-…`).

All three run on `@Async` threads, so the HTTP response returns immediately and
mail latency is never on the request path. The consequence: **a mail failure
cannot be reported to the user** — the response has already been sent. Delivery
problems surface only in the Render logs.

---

## 2. PostgreSQL JDBC URL parsing & environment precedence

### Why the provider's URL does not work

Render, Heroku and Railway publish the database connection string in **libpq**
format:

```
postgres://saturn_admin:Xq7…@dpg-abc123-a.oregon-postgres.render.com/saturn_rnd_db
```

The PostgreSQL **JDBC** driver cannot consume that. It requires:

```
jdbc:postgresql://dpg-abc123-a.oregon-postgres.render.com:5432/saturn_rnd_db
```

Three incompatibilities, each fatal on its own:

| Provider format | JDBC requirement |
|---|---|
| `postgres://` scheme | `jdbc:postgresql://` scheme |
| credentials embedded as `user:pass@` | supplied as separate `username` / `password` properties |
| port frequently omitted | explicit port required when a database path follows |

Handed the raw value, startup dies with `No suitable driver` or
`Driver claims to not accept jdbcUrl`.

### The fix: rewrite the property before any bean exists

[`SaturnRndApplication.java`](../backend/src/main/java/com/saturn/rnd/SaturnRndApplication.java)
registers an `ApplicationEnvironmentPreparedEvent` listener.

**Why that specific event.** It fires after Spring has read `application.yml`
and the OS environment, but *before* the `ApplicationContext` is created — so
before HikariCP, Hibernate or any migration tool reads its configuration. It is
the last point at which datasource properties can still be rewritten. The same
logic in a `@Bean`, `@PostConstruct` or `BeanPostProcessor` runs **too late**:
the pool has already attempted, and failed, to connect.

```
ApplicationEnvironmentPreparedEvent   ← listener rewrites here
        ↓
ApplicationContextInitializedEvent
        ↓
Bean definitions loaded → HikariCP starts → Hibernate → app ready
```

**Why `addFirst`.** Spring resolves a property from the **first** source that
contains it. The raw `DATABASE_URL` lives in the OS environment source, which
outranks `application.yml`. Appending would leave the malformed value winning, so
the sanitized map is pushed to the front of the chain:

```java
environment.getPropertySources()
        .addFirst(new MapPropertySource("sanitizedCloudDatasource", sanitized));
```

Resulting precedence (highest first):

```
1. sanitizedCloudDatasource   ← injected by the listener
2. OS environment variables   ← raw DATABASE_URL still here, now outranked
3. application-prod.yml
4. application.yml
```

The listener writes `spring.datasource.url`, `.username` and `.password`, and is
a no-op when `DATABASE_URL` is absent — so local runs keep using H2 untouched.
A value already in `jdbc:` form is passed through unmodified.

> **Verify it worked.** On a healthy boot the Render log shows:
> `Sanitized cloud DATABASE_URL into JDBC form: jdbc:postgresql://dpg-…:5432/saturn_rnd_db`
> Credentials are deliberately never logged.

### Blueprint gotcha

A `value:` in `render.yaml` is a **literal**. This does not work:

```yaml
# BROKEN — ${DB_HOST} is passed through verbatim
- key: SPRING_DATASOURCE_URL
  value: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
```

Take the provider's own connection string and let the listener normalise it:

```yaml
- key: DATABASE_URL
  fromDatabase:
    name: saturn-rnd-db
    property: connectionString
```

---

## 3. Cloud PaaS port blocking — SMTP vs REST API

### Why port 587 hangs

Nearly every cloud provider blocks **outbound TCP on ports 25 and 587** by
default, because compromised instances are a major source of spam. Render,
Heroku and unverified AWS accounts all do this.

The damaging detail: the connection is **dropped, not refused**. A refusal would
fail instantly with a clear error. Instead the SYN goes unanswered and the socket
sits there until it times out — which, with JavaMail's defaults, is *indefinite*.
The symptoms are:

- the endpoint returns `201 Created` normally (mail is `@Async`)
- no error appears for a minute or more
- an `@Async` worker thread is pinned the entire time
- eventually `SocketTimeoutException: connect timed out`, or nothing at all

Locally everything works, because a laptop's ISP does not block 587.

### The two solutions, in order of preference

**Primary — Brevo REST API over HTTPS (port 443).** No provider blocks 443;
that would break the internet. `EmailService` selects this engine automatically
when `SPRING_MAIL_PASSWORD` starts with `xsmtpsib-`, POSTing to
`https://api.brevo.com/v3/smtp/email` with the JDK `HttpClient`. Typical latency
is under 100 ms, and attachments are inlined as base64.

**Fallback — SMTPS on port 465.** Used for non-Brevo credentials, or when the
REST call fails. Port 465 is *implicit* TLS — encrypted from the first byte —
and is generally left open because it cannot be used for unauthenticated
relaying the way 25 can.

| | Port 587 | Port 465 | REST API 443 |
|---|---|---|---|
| Encryption | STARTTLS (upgrades) | Implicit SSL | HTTPS |
| Blocked on Render | **Yes** | No | No |
| Failure mode | Silent hang | Clean error | HTTP status code |
| Use | Local only | Fallback | **Primary** |

`starttls.enable` must be `false` whenever `ssl.enable` is `true` — the two are
mutually exclusive, and enabling both produces a protocol error.

The timeouts in `application-prod.yml` are not optional. Without
`connectiontimeout` / `timeout` / `writetimeout`, a single unreachable relay
permanently consumes an async worker:

```yaml
mail:
  properties:
    mail:
      smtp:
        ssl: { enable: true }
        starttls: { enable: false }
        connectiontimeout: 10000
        timeout: 10000
        writetimeout: 10000
```

### No credential = no send

With `SPRING_MAIL_PASSWORD` unset, `EmailService` logs each message instead of
transmitting it. Local development needs no mail account — but a production
instance missing that variable will *look* healthy while silently discarding
every notification. Check for `DEV MOCK EMAIL DISPATCH` in the Render logs.

---

## 4. The CI/CD pipeline

[`.github/workflows/deploy-and-test.yml`](../.github/workflows/deploy-and-test.yml)

```mermaid
flowchart LR
    P["push / PR → main"] --> BE["backend-test<br/>JDK 21 · mvnw verify"]
    P --> FE["frontend-build<br/>Node 20 · type-check + build"]
    BE --> G{"main branch<br/>and not a PR?"}
    FE --> G
    G -->|yes| R["deploy-backend<br/>Render hook"]
    G -->|yes| VC["deploy-frontend<br/>Vercel hook"]
    G -->|no| S["stop — validation only"]
```

| Job | Runs on | Does |
|---|---|---|
| `backend-test` | every push + PR | `./mvnw -B -ntp verify` on Temurin 21; uploads surefire reports |
| `frontend-build` | every push + PR | `pnpm type-check` then `pnpm build` on Node 20 |
| `deploy-backend` | `main` only, after both pass | POSTs the Render deploy hook |
| `deploy-frontend` | `main` only, after both pass | POSTs the Vercel deploy hook |

**Caching** keeps a warm run under two minutes:

- `actions/setup-java` with `cache: maven` — restores `~/.m2/repository` keyed on
  `pom.xml`, turning a ~90 s cold dependency resolve into a few seconds.
- `actions/setup-node` with `cache: pnpm` — restores the pnpm content-addressable
  store.
- `actions/cache` on `frontend/.next/cache` — reuses the Next.js compiler cache
  across runs.

**Required secrets** (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render → service → Settings → Deploy Hook |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel → project → Settings → Git → Deploy Hooks |

Both deploy jobs emit a notice and exit 0 when their secret is missing, so forks
and fresh clones still get a green CI run. If Vercel's Git integration is already
connected it deploys on its own — the hook is then redundant, and leaving the
secret unset is correct.

> `concurrency` cancels superseded runs on feature branches but **not** on `main`,
> where cancelling mid-run could leave a half-finished deploy.

---

## 5. First-time deployment

### 5.1 Database and backend (Render)

1. **Blueprint** → New Blueprint Instance → select the repo. Render reads
   [`render.yaml`](../render.yaml) and provisions the web service plus
   `saturn-rnd-db`.
2. Supply the secrets it prompts for (`sync: false` entries):

   | Variable | Value |
   |---|---|
   | `SPRING_MAIL_PASSWORD` | Brevo API key (`xsmtpsib-…`) or SMTP password |
   | `SPRING_MAIL_USERNAME` | Brevo SMTP login |
   | `APP_EMAIL_FROM` | Brevo-**verified** sender address |
   | `APP_EMAIL_ADMIN` | Inbox that receives submissions |

3. Confirm these are set (they come from `render.yaml`):

   | Variable | Value |
   |---|---|
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `DATABASE_URL` | from the database, `connectionString` |
   | `APP_CORS_ALLOWED_ORIGINS` | frontend origins, comma-separated |
   | `APP_FRONTEND_URL` | frontend origin (builds verification links) |

> **`SPRING_PROFILES_ACTIVE=prod` is not optional.** Without it the service runs
> the dev profile: in-memory H2, forms appear to work, and every submission is
> lost on the next restart.

4. Watch the deploy log for the sanitized JDBC line from §2 and for Flyway's
   `Successfully applied N migration(s)`, then confirm `/actuator/health`
   returns `{"status":"UP"}`.

### 5.2 Frontend (Vercel)

1. Import the repo, set **Root Directory** to `frontend`. The framework preset,
   build command and output directory are detected automatically.
2. Add the environment variable:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://saturn-rnd-backend.onrender.com/api/v1` |

> **Include the `/api/v1` suffix.** `apiClient` appends bare paths like
> `/contact` directly to this value. Omitting the prefix produces requests to
> `https://…onrender.com/contact`, which 404.

> `NEXT_PUBLIC_*` values are **inlined at build time**. Changing one in the
> dashboard does nothing until you redeploy.

### 5.3 Brevo

1. Create the account, then **Senders & IPs** → add and verify `APP_EMAIL_FROM`.
   An unverified sender makes the REST API return HTTP 400.
2. **SMTP & API** → generate an API key (`xsmtpsib-…`) → set it as
   `SPRING_MAIL_PASSWORD`.

### 5.4 End-to-end verification

1. Submit the contact form on the live site.
2. Expect a `201` within a few hundred ms — or up to ~50 s on a cold start (§7).
3. The verification email should arrive within seconds. Render logs show
   `Brevo REST API delivered email to …`.
4. Click the link → `/verify` reports success → the admin inbox receives the
   dossier and the sender receives the receipt.

---

## 6. Custom domain setup

Worked example using `saturn-rnd.com`. Substitute your own.

### 6.1 Frontend — Vercel

Project → Settings → Domains → add both `saturn-rnd.com` and
`www.saturn-rnd.com`, then create the DNS records Vercel shows:

| Record | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Use `A` for the apex (most DNS providers cannot `CNAME` a bare domain), `CNAME`
for subdomains. Vercel issues the TLS certificate automatically once the records
resolve. Confirm the exact values in the dashboard — they change over time.

### 6.2 Backend — Render

Service → Settings → Custom Domains → add `api.saturn-rnd.com`:

| Record | Name | Value |
|---|---|---|
| `CNAME` | `api` | `saturn-rnd-backend.onrender.com` |

### 6.3 Update the environment

DNS alone will break the site — the origins are pinned in configuration. Update
all three, then redeploy both halves:

| Where | Variable | New value |
|---|---|---|
| Render | `APP_CORS_ALLOWED_ORIGINS` | `https://saturn-rnd.com,https://www.saturn-rnd.com,https://saturn-rnd.vercel.app,https://saturn-rnd-*.vercel.app` |
| Render | `APP_FRONTEND_URL` | `https://saturn-rnd.com` |
| Vercel | `NEXT_PUBLIC_API_URL` | `https://api.saturn-rnd.com/api/v1` |

Notes:

- **Keep the `vercel.app` entries.** Dropping them breaks preview deployments.
- CORS origins are **scheme- and host-exact**. `https://saturn-rnd.com` does not
  cover `www.`, `http://`, or a trailing slash — list every form you serve.
- The wildcard entry works because
  [`CorsConfig`](../backend/src/main/java/com/saturn/rnd/config/CorsConfig.java)
  uses `setAllowedOriginPatterns`, not `setAllowedOrigins`. The latter compares
  literally and cannot express a wildcard; it also cannot be combined with
  `allowCredentials(true)`, which Spring rejects at startup.
- `APP_FRONTEND_URL` is what verification links are built from. Miss it and every
  email keeps pointing at the old host.
- **Redeploy the frontend** after changing `NEXT_PUBLIC_API_URL` — it is baked in
  at build time.

### 6.4 Brevo domain authentication (SPF, DKIM, DMARC)

Without these, mail from a custom domain lands in spam. Brevo → Senders,
Domains & Dedicated IPs → Domains → authenticate `saturn-rnd.com`, then add:

| Purpose | Type | Name | Value |
|---|---|---|---|
| SPF | `TXT` | `@` | `v=spf1 include:spf.brevo.com mx ~all` |
| DKIM | `TXT` | `mail._domainkey` | *(the key Brevo generates)* |
| Brevo verification | `TXT` | `@` | `brevo-code:…` *(from the dashboard)* |
| DMARC | `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@saturn-rnd.com` |

What each does:

- **SPF** lists the servers permitted to send as your domain. Publish exactly
  **one** SPF record — multiple records are a spec violation and cause a
  permerror that fails every check. Merge additional senders into one `include:`
  chain.
- **DKIM** signs each message so the recipient can verify it was not altered and
  really came from you.
- **DMARC** tells receivers what to do when SPF or DKIM fails. Start at
  `p=none` (monitor only), read the aggregate reports for a week or two, then
  tighten to `p=quarantine` and eventually `p=reject`. Going straight to
  `p=reject` will silently destroy legitimate mail from any sender you forgot.

Then update `APP_EMAIL_FROM` to the authenticated domain (e.g.
`noreply@saturn-rnd.com`) and re-verify it under Senders. Allow up to 48 hours
for DNS propagation; verify with `dig TXT saturn-rnd.com` or MXToolbox.

---

## 7. Troubleshooting

### Cold starts (free tier)

Render's free tier suspends the instance after ~15 minutes idle. The next
request waits for a full container start — JVM boot, Hikari pool, Hibernate
schema scan — commonly **30-50 seconds**.

`apiClient.ts` therefore allows a **60 s** timeout (`REQUEST_TIMEOUT_MS`). Keep
it above the observed cold-start time: a timeout shorter than the wake-up makes
the first submission after any quiet period fail every time, while the request
was in fact about to succeed. Lower it only when moving to an always-on paid
instance.

The CORS preflight is often the request that pays the wake-up cost, which is why
`CorsConfig` sets `maxAge(3600)` — one hour of preflight caching removes an
`OPTIONS` round trip before every `POST`.

### Symptom → cause

| Symptom | Likely cause |
|---|---|
| `No suitable driver` / `Driver claims to not accept jdbcUrl` | `DATABASE_URL` not sanitized — see §2. Check for the sanitized-URL log line. |
| Data disappears after every restart | `SPRING_PROFILES_ACTIVE` is not `prod`; running on in-memory H2. |
| Deploy rolls back, service never goes live | Health check path does not return 200. It must be a real public GET route. |
| `No 'Access-Control-Allow-Origin' header` in the browser console | Origin missing from `APP_CORS_ALLOWED_ORIGINS`. Match scheme and host exactly, no trailing slash. |
| API calls 404 in production, fine locally | `NEXT_PUBLIC_API_URL` missing the `/api/v1` suffix. |
| Env var change had no effect on the frontend | `NEXT_PUBLIC_*` is inlined at build time — redeploy. |
| Forms return 201, no email ever arrives | `SPRING_MAIL_PASSWORD` unset → `DEV MOCK EMAIL DISPATCH` in logs. |
| Email hangs ~60 s then times out | SMTP on port 587, blocked by Render — use the Brevo API key or port 465 (§3). |
| Brevo returns HTTP 400 | `APP_EMAIL_FROM` is not a verified sender in Brevo. |
| Email delivered but lands in spam | SPF/DKIM/DMARC not configured for the sending domain (§6.4). |
| Uploaded CVs vanish | Render's filesystem is ephemeral — expected. Attach a Disk or use object storage. |
| CI fails at `./mvnw: Permission denied` | The executable bit was lost; the workflow runs `chmod +x ./mvnw` to handle this. |
| `Schema-validation: missing table [...]` at startup | Flyway did not run, or ran against a different database. Check `SPRING_PROFILES_ACTIVE=prod` and the `flyway_schema_history` table (§8). |
| `Migration checksum mismatch` | An already-applied migration file was edited. Restore it and add a new `V<n>__` file instead (§8). |
| Form returns HTTP 429 | Rate limit hit — 5 per IP per 10 min by default. Tune `APP_RATE_LIMIT_MAX` (§9). |
| Deploy rolls back with a health-check failure after adding Actuator | `/actuator/health` returns DOWN when the datasource is unreachable — the database, not the probe, is the problem. |
| Browser console: "Refused to connect / load ... violates CSP" | The origin is missing from the matching directive in `next.config.mjs` (§9). |

### Where to look

- **Render** → service → Logs — startup, sanitized JDBC URL, mail delivery.
- **Vercel** → deployment → Build Logs — type errors and build failures.
- **Brevo** → Transactional → Logs — per-message delivery, bounces, spam reports.
- **GitHub** → Actions — test output; surefire reports are uploaded as artifacts.

---

## 8. Schema migrations (Flyway)

Production runs `spring.jpa.hibernate.ddl-auto=validate`. Hibernate issues no
DDL — **the migrations own the schema**, and Hibernate only checks that the
entities match it, failing startup on any drift.

Files live in
[`backend/src/main/resources/db/migration/`](../backend/src/main/resources/db/migration/)
and are named `V<version>__<description>.sql`.

### Rules

- **Never edit an applied migration.** Flyway stores a checksum per file in
  `flyway_schema_history` and refuses to start if one changes. To alter the
  schema, add `V2__add_something.sql`.
- **Migrations run before Hibernate initialises**, so the schema is always ready
  before the first query.
- **`baseline-on-migrate: true`** lets Flyway adopt a database that already
  contains tables — for example one whose schema was created outside Flyway —
  by recording a baseline instead of trying to re-create them and failing.
- **Flyway is disabled in the dev profile.** Local development uses throwaway H2
  with `ddl-auto: update`; running PostgreSQL-flavoured SQL against it adds
  friction with no benefit.

### How the migrations are verified

`FlywayMigrationValidationTest` runs the real migration files against H2 in
PostgreSQL compatibility mode, then asks Hibernate to validate every entity
against the result. It catches the mistakes that actually happen — a column named
`inquiryId` instead of `inquiry_id`, a missing `NOT NULL`, an absent table.

> **Limitation.** H2's PostgreSQL mode is a compatibility layer, not PostgreSQL.
> The test validates the entity-to-schema mapping, not PostgreSQL-specific
> syntax. The first deploy against real PostgreSQL remains the authoritative
> check — watch the log for `Successfully applied N migration(s)`.

---

## 9. Abuse protection on the public forms

Both write endpoints are public and unauthenticated, and each accepted request
writes a row and sends email. Three independent layers limit the damage:

| Layer | Where | Stops |
|---|---|---|
| Honeypot field | `useContactForm` / `useJoinForm` + service layer | Naive bots that fill every input |
| Email verification | 3-step pipeline | Anything reaching the R&D inbox unverified |
| Rate limit | `RateLimitFilter` | Volume — 5 requests per IP per 10 minutes |

Rate limiting is tunable without a rebuild via `APP_RATE_LIMIT_MAX`,
`APP_RATE_LIMIT_WINDOW_MINUTES` and `APP_RATE_LIMIT_ENABLED`. A throttled caller
gets HTTP 429 in the standard envelope plus a `Retry-After` header.

> **Counters are in-memory and per-instance.** Two instances allow twice the
> limit, and a restart clears them. That is an accepted trade-off for a
> single free-tier instance — move to Redis or Bucket4j before scaling out.

The client IP is read from `X-Forwarded-For`, because behind Render's proxy
`getRemoteAddr()` returns the proxy and every visitor would share one bucket.
That header is client-supplied and trivially spoofed; it is trusted here only
because Render overwrites it. Do not reuse this for anything security-critical.

### Other hardening applied

- **Uploads** are allow-listed to `.pdf`/`.doc`/`.docx`, and the storage path is
  sanitized and re-checked against the storage root, so a crafted applicant name
  cannot write outside the upload directory (`FileStorageServiceTest` pins this).
- **Error responses** never echo an unexpected exception's message. The catch-all
  handler returns a fixed message plus a short reference ID and logs the stack
  trace against it — internal messages routinely leak SQL, paths and class names.
- **Actuator** exposes only `/actuator/health`, with `show-details: never`.
- **Security headers** (CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`) are set for every route in `next.config.mjs`. If you add
  a third-party script, image host or analytics endpoint, extend the matching CSP
  directive or the browser will block it.

---

## Known gaps

Worth addressing before this carries significant traffic:

- **Ephemeral CV storage.** Uploads live on the container filesystem and are lost
  on redeploy. The admin notification email is currently the only durable copy.
  Attach a Render Disk or move to S3/Cloudinary.
- **Rate limiting is per-instance.** See §9 — fine for one instance, insufficient
  the moment the service scales horizontally.
- **No admin interface.** Submissions are readable only via the notification
  emails or direct database access. `findByInquiryId` and `findByApplicationId`
  are retained on the repositories as the intended entry points for a future
  status-tracking endpoint; any such endpoint must be authenticated, since both
  return full submission details.
- **Image payload (~3MB).** `public/` is dominated by `rahin-photo.png` at 1.8MB
  (1023×1311), while portraits display at 160px at most. On mobile this
  dominates load time and Largest Contentful Paint. Note that
  `images.unoptimized: true` is inert here — every image uses a plain `<img>`,
  and Next.js only optimises `next/image`. Two options, documented in full in
  `next.config.mjs`:
  1. Re-encode the sources to WebP — measures at **~3006KB → ~265KB (91%
     smaller)** with no layout change, and needs the `src` paths updated.
  2. Adopt `next/image` and drop the flag, so Vercel serves resized WebP/AVIF
     from the untouched originals. Better long-term; touches 12 call sites and
     needs visual checking.
- **CSP allows `unsafe-inline` and `unsafe-eval`.** Both are required by the
  Next.js runtime and framer-motion's injected styles. Tightening this means
  adopting nonce-based CSP via middleware.
