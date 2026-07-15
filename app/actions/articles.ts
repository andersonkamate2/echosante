'use server';

import { requireAdminUser } from '@/lib/auth-middleware';
import { upsertArticle, deleteArticle } from '@/lib/data/articles';
import { revalidatePath } from 'next/cache';

export async function publishArticle(data: {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
}) {
  const user = await requireAdminUser();
  if (!user) {
    throw new Error('Unauthorized: Admin role required');
  }

  const payload = {
    ...data,
    tags: data.tags,
    published_at: data.status === 'published' ? new Date().toISOString() : null,
  };

  try {
    if (data.id) {
      const article = await upsertArticle({ ...payload, id: data.id });
      revalidatePath('/articles');
      revalidatePath(`/articles/${data.slug}`);
      return { success: true, article };
    } else {
      const article = await upsertArticle(payload);
      revalidatePath('/articles');
      revalidatePath(`/articles/${article.slug}`);
      return { success: true, article };
    }
  } catch (error) {
    throw new Error(`Failed to publish article: ${error}`);
  }
}

export async function deleteArticleAction(id: string) {
  const user = await requireAdminUser();
  if (!user) {
    throw new Error('Unauthorized: Admin role required');
  }

  try {
    await deleteArticle(id);
    revalidatePath('/articles');
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete article: ${error}`);
  }
}

export async function togglePublishArticle(id: string, status: 'draft' | 'published') {
  const user = await requireAdminUser();
  if (!user) {
    throw new Error('Unauthorized: Admin role required');
  }

  try {
    const article = await upsertArticle({
      id,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    });
    revalidatePath('/articles');
    return { success: true, article };
  } catch (error) {
    throw new Error(`Failed to toggle article: ${error}`);
  }
}
