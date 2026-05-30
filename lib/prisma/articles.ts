import { prisma } from '../prisma';
import type { Article } from '@/types/article';

type PartialArticleInput = Omit<Partial<Article>, 'tags'> & {
  tags?: string | string[];
};

function normalizeArticle(article: any): Article {
  const rawTags = typeof article.tags === 'string' ? article.tags : '';
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    cover_image: article.cover_image,
    author: article.author,
    category: article.category,
    tags: rawTags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
    status: article.status,
    published_at: article.published_at ? new Date(article.published_at).toISOString() : null,
    created_at: new Date(article.created_at).toISOString(),
    updated_at: new Date(article.updated_at).toISOString(),
  };
}

export async function getPublishedArticles(filters?: { query?: string; category?: string }) {
  const where: any = { status: 'published' };

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { excerpt: { contains: filters.query, mode: 'insensitive' } },
      { content: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { published_at: 'desc' },
  });

  return articles.map(normalizeArticle);
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findFirst({
    where: { slug, status: 'published' },
  });

  return article ? normalizeArticle(article) : null;
}

export async function getAdminArticles() {
  const articles = await prisma.article.findMany({
    orderBy: { created_at: 'desc' },
  });

  return articles.map(normalizeArticle);
}

export async function upsertArticle(article: PartialArticleInput) {
  const data = {
    title: article.title ?? '',
    slug: article.slug ?? '',
    excerpt: article.excerpt ?? '',
    content: article.content ?? '',
    cover_image: article.cover_image ?? '',
    author: article.author ?? '',
    category: article.category ?? '',
    tags: Array.isArray(article.tags) ? article.tags.join(',') : String(article.tags ?? ''),
    status: article.status ?? 'draft',
    published_at: article.published_at ? new Date(article.published_at) : null,
    updated_at: new Date(),
  };

  if (article.id) {
    const existing = await prisma.article.findUnique({
      where: { id: article.id },
    });

    if (existing) {
      const updated = await prisma.article.update({
        where: { id: article.id },
        data,
      });
      return normalizeArticle(updated);
    }
  }

  const created = await prisma.article.create({
    data: {
      id: article.id ?? crypto.randomUUID(),
      ...data,
      created_at: article.created_at ? new Date(article.created_at) : undefined,
    },
  });

  return normalizeArticle(created);
}

export async function deleteArticle(id: string) {
  const deleted = await prisma.article.delete({
    where: { id },
  });

  return normalizeArticle(deleted);
}
