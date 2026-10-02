/**
 * Next.js configuration for NEVOLYN Technology official website.
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */
import os from 'node:os'

/**
 * Dynamically discover local IPv4 addresses to show clickable phone links and whitelist in dev
 */
const localNetworkIps = (() => {
  const ips = []
  try {
    const nets = os.networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          ips.push(net.address)
        }
      }
    }
  } catch {
    // ignore
  }
  return ips
})()

if (process.env.NODE_ENV !== 'production' && localNetworkIps.length > 0) {
  console.log('\n\x1b[36m📱 Mobile / Local Network Access:\x1b[0m')
  localNetworkIps.forEach((ip) => {
    console.log(`   \x1b[1m\x1b[32mhttp://${ip}:3000\x1b[0m`)
  })
  console.log('')
}


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
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },

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

  /**
   * Allowed development origins for network access (e.g. mobile/other devices on local network)
   */
  allowedDevOrigins: [
    ...localNetworkIps,
    ...localNetworkIps.map((ip) => `${ip}:3000`),
    'localhost:3000',
    '127.0.0.1:3000',
  ],

  /**
   * Automatic SEO redirects for career and vacancy search paths (NEVOLYN & FABINS).
   */
  async redirects() {
    return [
      {
        source: '/careers',
        destination: '/join_us',
        permanent: true,
      },
      {
        source: '/career',
        destination: '/join_us',
        permanent: true,
      },
      {
        source: '/jobs',
        destination: '/join_us',
        permanent: true,
      },
      {
        source: '/job',
        destination: '/join_us',
        permanent: true,
      },
      {
        source: '/vacancy',
        destination: '/join_us',
        permanent: true,
      },
      {
        source: '/vacancies',
        destination: '/join_us',
        permanent: true,
      },
      {
        source: '/fabins-career',
        destination: '/join_us',
        permanent: true,
      },
      {
        source: '/fabins-careers',
        destination: '/join_us',
        permanent: true,
      },
      {
        source: '/join-fabins',
        destination: '/join_us',
        permanent: true,
      },
      {
        source: '/fabins-jobs',
        destination: '/join_us',
        permanent: true,
      },
    ]
  },

  /**
   * Disable the floating Next.js dev-mode indicator (the "N" badge in the
   * bottom-right corner). It only appears in development and is purely cosmetic.
   */
  devIndicators: false,
}

export default nextConfig
