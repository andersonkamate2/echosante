import { supabaseClient } from './client';
import { getPublishedArticles as getPublishedArticlesPrisma, getArticleBySlug as getArticleBySlugPrisma } from '@/lib/prisma/articles';
import { getAllPageContents as getAllPageContentsPrisma, getPublishedPageContentBySlug as getPublishedPageContentBySlugPrisma, getPageContent as getPageContentPrisma } from '@/lib/prisma/pages';
import { getGallery as getGalleryPrisma } from '@/lib/prisma/gallery';
import { getProjects as getProjectsPrisma } from '@/lib/prisma/projects';
import { getSiteSetting as getSiteSettingPrisma } from '@/lib/prisma/siteSettings';
import { DatabaseProvider } from '@/lib/database/provider';
import type { Article } from '@/types/article';
import type { PageContent, GalleryItem } from '@/types/content';
import type { Project } from '@/types/project';
import type { SiteSetting } from '@/types/siteSetting';

const database = DatabaseProvider.getInstance();
const useSupabase = database.useSupabase;

if (useSupabase) {
  database.assertSupabaseConfig();
}
const articleFields = `id, title, slug, excerpt, content, cover_image, author, category, tags, status, published_at, created_at, updated_at`;
const pageFields = `id, slug, title, content, meta_description, order, published, created_at, updated_at`;
const galleryFields = `id, title, image_url, description, category, order, active, created_at, updated_at`;
const projectFields = `id, title, slug, description, image_url, status, order, created_at, updated_at`;
const siteSettingFields = `id, key, value, description, created_at, updated_at`;

function normalizeArticle(article: any): Article {
  const rawTags = Array.isArray(article.tags) ? article.tags.join(',') : String(article.tags ?? '');
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

function normalizePage(page: any): PageContent {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    content: page.content,
    meta_description: page.meta_description ?? null,
    order: page.order,
    published: Boolean(page.published),
    created_at: new Date(page.created_at).toISOString(),
    updated_at: new Date(page.updated_at).toISOString(),
  };
}

function normalizeGallery(item: any): GalleryItem {
  return {
    id: item.id,
    title: item.title,
    image_url: item.image_url,
    description: item.description ?? null,
    category: item.category,
    order: item.order,
    active: Boolean(item.active),
    created_at: new Date(item.created_at).toISOString(),
    updated_at: new Date(item.updated_at).toISOString(),
  };
}

function normalizeProject(project: any): Project {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    image_url: project.image_url ?? null,
    status: project.status,
    order: project.order,
    created_at: new Date(project.created_at).toISOString(),
    updated_at: new Date(project.updated_at).toISOString(),
  };
}

function normalizeSiteSetting(setting: any): SiteSetting {
  return {
    id: setting.id,
    key: setting.key,
    value: setting.value,
    description: setting.description ?? null,
    created_at: new Date(setting.created_at).toISOString(),
    updated_at: new Date(setting.updated_at).toISOString(),
  };
}

export async function getPublishedProjects() {
  if (!useSupabase) {
    return (await getProjectsPrisma({ status: 'active' })).map(normalizeProject);
  }

  try {
    const response = await supabaseClient.from('projects').select(projectFields).eq('status', 'active').order('order', { ascending: true });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return (response.data ?? []).map(normalizeProject);
  } catch (err) {
    // Fallback to local Prisma when Supabase is unreachable or errors
    // eslint-disable-next-line no-console
    console.error('Supabase getPublishedProjects failed, falling back to Prisma:', err);
    return (await getProjectsPrisma({ status: 'active' })).map(normalizeProject);
  }
}

export async function getSiteSetting(key: string) {
  if (!useSupabase) {
    const setting = await getSiteSettingPrisma(key);
    return setting ? normalizeSiteSetting(setting) : null;
  }

  try {
    const response = await supabaseClient.from('site_settings').select(siteSettingFields).eq('key', key).maybeSingle();
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data ? normalizeSiteSetting(response.data) : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Supabase getSiteSetting failed, falling back to Prisma:', err);
    const setting = await getSiteSettingPrisma(key);
    return setting ? normalizeSiteSetting(setting) : null;
  }
}

export async function getPublishedArticles(filters?: { query?: string; category?: string }) {
  if (!useSupabase) {
    return (await getPublishedArticlesPrisma(filters)).map(normalizeArticle);
  }

  try {
    let queryBuilder = supabaseClient.from('articles').select(articleFields).eq('status', 'published');

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

    return (response.data ?? []).map(normalizeArticle);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Supabase getPublishedArticles failed, falling back to Prisma:', err);
    return (await getPublishedArticlesPrisma(filters)).map(normalizeArticle);
  }
}

export async function getArticleBySlug(slug: string) {
  if (!useSupabase) {
    const article = await getArticleBySlugPrisma(slug);
    return article ? normalizeArticle(article) : null;
  }

  try {
    const response = await supabaseClient.from('articles').select(articleFields).eq('slug', slug).eq('status', 'published').maybeSingle();
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data ? normalizeArticle(response.data) : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Supabase getArticleBySlug failed, falling back to Prisma:', err);
    const article = await getArticleBySlugPrisma(slug);
    return article ? normalizeArticle(article) : null;
  }
}

export async function getPublishedPageContents() {
  if (!useSupabase) {
    return (await getAllPageContentsPrisma({ published: true })).map(normalizePage);
  }

  try {
    const response = await supabaseClient.from('page_contents').select(pageFields).eq('published', true).order('order', { ascending: true });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return (response.data ?? []).map(normalizePage);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Supabase getPublishedPageContents failed, falling back to Prisma:', err);
    return (await getAllPageContentsPrisma({ published: true })).map(normalizePage);
  }
}

export async function getPageContentBySlug(slug: string) {
  if (!useSupabase) {
    const page = await getPublishedPageContentBySlugPrisma(slug);
    return page ? normalizePage(page) : null;
  }

  try {
    const response = await supabaseClient.from('page_contents').select(pageFields).eq('slug', slug).eq('published', true).maybeSingle();
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data ? normalizePage(response.data) : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Supabase getPageContentBySlug failed, falling back to Prisma:', err);
    const page = await getPublishedPageContentBySlugPrisma(slug);
    return page ? normalizePage(page) : null;
  }
}

export async function getPublishedGallery(category?: string) {
  if (!useSupabase) {
    return (await getGalleryPrisma({ category, active: true })).map(normalizeGallery);
  }

  try {
    let queryBuilder = supabaseClient.from('gallery').select(galleryFields).eq('active', true);
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const response = await queryBuilder.order('order', { ascending: true });
    if (response.error) {
      throw new Error(response.error.message);
    }

    return (response.data ?? []).map(normalizeGallery);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Supabase getPublishedGallery failed, falling back to Prisma:', err);
    return (await getGalleryPrisma({ category, active: true })).map(normalizeGallery);
  }
}
