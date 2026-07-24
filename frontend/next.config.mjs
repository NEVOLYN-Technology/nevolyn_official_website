/**
 * Next.js configuration for saturn-rnd-portfolio.
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * TypeScript build errors.
   *
   * IMPORTANT: `ignoreBuildErrors` is intentionally disabled so that
   * TypeScript errors surface at build time. Do NOT re-enable this flag
   * — fix the underlying type error instead.
   *
   * If you need to temporarily bypass during a hotfix, re-add:
   *   typescript: { ignoreBuildErrors: true }
   * and open a follow-up issue immediately.
   */

  images: {
    /**
     * `unoptimized: true` is kept for now because the app is statically
     * exported / deployed on Vercel without an image-optimization server.
     *
     * TODO (Phase 2 — Spring Boot integration): Once the backend is live,
     * replace this with `domains: ['api.saturntextiles.com']` and let
     * Next.js optimize remote images through the backend CDN.
     */
    unoptimized: true,
  },

  /**
   * Disable the floating Next.js dev-mode indicator (the "N" badge in the
   * bottom-right corner). It only appears in development and is purely cosmetic.
   */
  devIndicators: false,
}

export default nextConfig
