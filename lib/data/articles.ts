import type { Article } from '@/types/article';
import { createRecord, deleteRecord, getRecord, listRecords, sortNewest, upsertRecord } from '@/lib/json-db/store';

type ArticleFilters = {
  category?: string;
  limit?: number;
};

function normalizeArticle(payload: Partial<Article>): Partial<Article> {
  const tags = Array.isArray(payload.tags)
    ? payload.tags
    : String((payload as any).tags ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

  return {
    ...payload,
    tags,
    status: payload.status ?? 'draft',
    cover_image: payload.cover_image ?? '/equip.webp',
    published_at: payload.status === 'published' ? payload.published_at ?? new Date().toISOString() : null,
  };
}

export async function getPublishedArticles(filters: ArticleFilters = {}) {
  const articles = await listRecords(
    'articles',
    (article) => article.status === 'published' && (!filters.category || article.category === filters.category),
    sortNewest,
  );
  return typeof filters.limit === 'number' ? articles.slice(0, filters.limit) : articles;
}

export async function getArticleBySlug(slug: string) {
  const articles = await getPublishedArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}

export async function getAdminArticles() {
  return listRecords('articles', undefined, sortNewest);
}

export async function upsertArticle(payload: Partial<Article>) {
  const data = normalizeArticle(payload);
  return upsertRecord<'articles'>('articles', data, 'article', (article) => Boolean(data.slug && article.slug === data.slug));
}

export async function createArticle(payload: Partial<Article>) {
  return createRecord<'articles'>('articles', normalizeArticle(payload), 'article');
}

export async function deleteArticle(id: string) {
  await deleteRecord('articles', id);
  return { id };
}

export async function getArticleById(id: string) {
  return getRecord('articles', id);
}
