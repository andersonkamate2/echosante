import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL ?? 'https://echosante.org';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/_next'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
