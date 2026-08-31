import type { MetadataRoute } from 'next'

/**
 * Web Application Manifest for NEVOLYN Technology (PWA / browser installability).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NEVOLYN Technology',
    short_name: 'NEVOLYN',
    description: 'NEVOLYN Technology — AI, deep-tech, intelligent systems, automation, and next-generation engineering solutions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020914',
    theme_color: '#0b1f3a',
    icons: [
      {
        src: '/nevolyn-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/nevolyn-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
