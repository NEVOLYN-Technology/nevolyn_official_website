/**
 * Next.js configuration for saturn-rnd-portfolio.
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */

/**
 * Origin of the Spring Boot API, used to build the connect-src CSP directive.
 *
 * The CSP must permit the exact origin the browser will call, or every form
 * submission is blocked by the policy. Derived from the same environment
 * variable the client uses so the two can never disagree.
 */
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1').origin
  } catch {
    // A malformed value must not break the build; fall back to the local API.
    return 'http://localhost:8080'
  }
})()

/**
 * Security headers applied to every response.
 *
 * Vercel serves the site over HTTPS but adds none of these on its own. Each
 * closes a specific, well-understood class of attack:
 *
 * - Content-Security-Policy — the main defence against XSS. Restricts where
 *   scripts, styles and network calls may come from. Note that 'unsafe-inline'
 *   and 'unsafe-eval' are required by Next.js's runtime and framer-motion's
 *   injected styles; removing them breaks hydration. Tightening this further
 *   means adopting nonce-based CSP, which needs middleware.
 * - Strict-Transport-Security — pins the browser to HTTPS for two years,
 *   defeating SSL-stripping downgrade attacks on later visits.
 * - X-Content-Type-Options — stops MIME sniffing, so a file served as text
 *   cannot be reinterpreted and executed as script.
 * - X-Frame-Options / frame-ancestors — blocks framing, and with it clickjacking
 *   of the contact and application forms.
 * - Referrer-Policy — keeps full URLs (which can carry verification tokens) out
 *   of the Referer header sent to third parties.
 * - Permissions-Policy — drops access to hardware APIs the site never uses.
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      `connect-src 'self' ${apiOrigin} https://vitals.vercel-insights.com`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; '),
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
]

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

  /**
   * Emits `.next/standalone` — a self-contained server bundle with only the
   * dependencies actually imported, which is what frontend/Dockerfile copies
   * into its runtime stage. Without this the Docker build fails outright,
   * because that directory is never produced.
   *
   * Harmless on Vercel: the platform uses its own build output pipeline and
   * ignores this setting.
   */
  output: 'standalone',

  /**
   * Removes the `X-Powered-By: Next.js` header, which advertises the framework
   * and its presence to automated scanners for no benefit.
   */
  poweredByHeader: false,

  /**
   * Applies the security headers above to every route.
   *
   * NOTE: `headers()` has no effect on a fully static export. It works here
   * because the site is served by Vercel's Next.js runtime.
   */
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },

  images: {
    /**
     * `unoptimized: true` disables Next.js image optimisation.
     *
     * Note that this flag is currently inert either way: every image in the app
     * is rendered with a plain `<img>` tag, and Next.js only optimises images
     * rendered through `next/image`.
     *
     * ## Known issue: image payload
     * `public/` totals ~3MB, dominated by `rahin-photo.png` at 1.8MB
     * (1023x1311). Portraits display at 160px (`w-40`) at most, so that file is
     * roughly 40x larger than the page needs. On a mobile connection this
     * dominates load time and Largest Contentful Paint.
     *
     * Two ways to fix it, in increasing order of effort:
     *
     * 1. **Re-encode the source assets.** PNG is lossless and a poor fit for
     *    photographs. Re-encoding the two portraits to WebP at 512px wide, and
     *    the brand graphics to WebP at their current dimensions, measures at
     *    ~3006KB -> ~265KB (91% smaller) with no layout change. Requires
     *    updating the `src` / `image` paths that reference them.
     * 2. **Adopt `next/image`.** Remove this flag, convert the `<img>` tags, and
     *    give each a `width`/`height` or `fill`. Vercel then serves resized
     *    WebP/AVIF from the original files, so the sources stay untouched. This
     *    is the better long-term answer but touches 12 call sites and needs
     *    visual checking.
     */
    unoptimized: true,
  },

  /**
   * Allowed development origins for network access (e.g. mobile/other devices on local network)
   */
  allowedDevOrigins: ['192.168.68.103', 'localhost:3000'],

  /**
   * Disable the floating Next.js dev-mode indicator (the "N" badge in the
   * bottom-right corner). It only appears in development and is purely cosmetic.
   */
  devIndicators: false,
}

export default nextConfig
