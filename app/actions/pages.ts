'use server';

import { requireAdminUser } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { deletePageContent, getPageContentById, upsertPageContent } from '@/lib/data/pages';

export async function publishPage(data: {
  id?: string;
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  order?: number;
  published: boolean;
}) {
  const user = await requireAdminUser();
  if (!user) throw new Error('Unauthorized: Admin role required');

  const page = await upsertPageContent({
    id: data.id,
    slug: data.slug,
    title: data.title,
    content: data.content,
    meta_description: data.meta_description ?? null,
    order: data.order ?? 0,
    published: data.published,
  });

  revalidatePath('/pages');
  revalidatePath(`/pages/${data.slug}`);
  return { success: true, page };
}

export async function deletePageAction(id: string) {
  const user = await requireAdminUser();
  if (!user) throw new Error('Unauthorized: Admin role required');

  const page = await getPageContentById(id);
  await deletePageContent(id);
  revalidatePath('/pages');
  if (page?.slug) revalidatePath(`/pages/${page.slug}`);
  return { success: true };
}
