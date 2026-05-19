import { supabaseServer } from './server';
import type { Article } from '@/types/article';

const defaultFields = `id, title, slug, excerpt, content, cover_image, author, category, tags, status, published_at, created_at, updated_at`;

export async function getPublishedArticles(filters?: { query?: string; category?: string }) {
  let queryBuilder = supabaseServer
    .from('articles')
    .select(defaultFields)
    .eq('status', 'published');

  if (filters?.category) {
    queryBuilder = queryBuilder.eq('category', filters.category);
  }

  if (filters?.query) {
    queryBuilder = queryBuilder.ilike('title', `%${filters.query}%`).or(`excerpt.ilike.%${filters.query}%,content.ilike.%${filters.query}%`);
  }

  const response = await queryBuilder.order('published_at', { ascending: false });
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data ?? [];
}

export async function getArticleBySlug(slug: string) {
  const response = await supabaseServer
    .from('articles')
    .select(defaultFields)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data ?? null;
}

export async function getAdminArticles() {
  const response = await supabaseServer
    .from('articles')
    .select(defaultFields)
    .order('created_at', { ascending: false });
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data ?? [];
}

export async function upsertArticle(article: Partial<Article>) {
  const response = await supabaseServer.from('articles').upsert(article, { onConflict: 'id' });
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data?.[0] ?? null;
}

export async function deleteArticle(id: string) {
  const response = await supabaseServer.from('articles').delete().eq('id', id);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
}
