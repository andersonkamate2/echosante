import { MetadataRoute } from 'next';
import { getPublishedArticles, getPublishedPageContents } from '@/lib/supabase/public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL && process.env.SITE_URL.trim() ? process.env.SITE_URL.trim() : 'https://echosante.org';
  const baseUrl = new URL(siteUrl);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl.toString(),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: new URL('/about', baseUrl).toString(),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: new URL('/articles', baseUrl).toString(),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: new URL('/projects', baseUrl).toString(),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: new URL('/pages', baseUrl).toString(),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: new URL('/gallery', baseUrl).toString(),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: new URL('/contact', baseUrl).toString(),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const articles = await getPublishedArticles();
    const articleRoutes = articles.map((article: any) => ({
      url: new URL(`/articles/${article.slug}`, baseUrl).toString(),
      lastModified: new Date(article.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

    const pages = await getPublishedPageContents();
    const pageRoutes = pages.map((page: any) => ({
      url: new URL(`/pages/${page.slug}`, baseUrl).toString(),
      lastModified: new Date(page.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...articleRoutes, ...pageRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
