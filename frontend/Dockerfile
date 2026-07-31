# ==============================================================================
# Next.js frontend — multi-stage production image
# ==============================================================================
# Relies on `output: 'standalone'` in next.config.mjs, which emits a
# self-contained server bundle in .next/standalone. Remove that setting and the
# COPY in the runner stage below has nothing to copy.
# ==============================================================================

FROM node:20-alpine AS base
# Pin pnpm to the major version that produced pnpm-lock.yaml (lockfileVersion
# 9.0). `pnpm@latest` would silently drift and can break --frozen-lockfile.
RUN corepack enable && corepack prepare pnpm@10 --activate

# ------------------------------------------------------------------------------
# Dependencies — cached independently of application source
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------------------------
# Build
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so the
# API URL has to be present here — supplying it only at runtime leaves the
# compiled bundle pointing at the default. Must include the /api/v1 suffix.
ARG NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ------------------------------------------------------------------------------
# Runtime
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# The standalone bundle carries its own minimal node_modules and server.js.
# public/ and .next/static are not included in it and must be copied alongside.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
