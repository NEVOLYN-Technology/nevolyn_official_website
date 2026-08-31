import type { MetadataRoute } from 'next'

/**
 * Generates robots.txt for search engines targeting the production domain nevolyn.com.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/verify'],
    },
    sitemap: 'https://nevolyn.com/sitemap.xml',
  }
}
