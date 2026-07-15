import { getPublishedArticles as getPublishedArticlesJson, getArticleBySlug as getArticleBySlugJson } from '@/lib/data/articles';
import { getAllPageContents, getPublishedPageContentBySlug } from '@/lib/data/pages';
import { getGallery } from '@/lib/data/gallery';
import { getProjects } from '@/lib/data/projects';
import { getSiteSetting as getSiteSettingJson } from '@/lib/data/siteSettings';

export async function getPublishedProjects() {
  return getProjects({ status: 'active' });
}

export async function getSiteSetting(key: string) {
  return getSiteSettingJson(key);
}

export async function getPublishedArticles(filters?: { query?: string; category?: string; limit?: number }) {
  const articles = await getPublishedArticlesJson(filters);
  if (!filters?.query) return articles;
  const q = filters.query.toLowerCase();
  return articles.filter((article) =>
    [article.title, article.excerpt, article.content, article.category, article.author]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}

export async function getArticleBySlug(slug: string) {
  return getArticleBySlugJson(slug);
}

export async function getPublishedPageContents() {
  return getAllPageContents({ published: true });
}

export async function getPageContentBySlug(slug: string) {
  return getPublishedPageContentBySlug(slug);
}

export async function getPublishedGallery(category?: string) {
  return getGallery({ category, active: true });
}
