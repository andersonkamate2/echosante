'use server';

import { requireAdminUser } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

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
  if (!user) {
    throw new Error('Unauthorized: Admin role required');
  }

  try {
    const page = await prisma.pageContent.upsert({
      where: data.id ? { id: data.id } : { slug: data.slug },
      update: {
        title: data.title,
        content: data.content,
        meta_description: data.meta_description ?? null,
        order: data.order ?? 0,
        published: data.published,
      },
      create: {
        slug: data.slug,
        title: data.title,
        content: data.content,
        meta_description: data.meta_description ?? null,
        order: data.order ?? 0,
        published: data.published,
      },
    });

    revalidatePath('/pages');
    revalidatePath(`/pages/${data.slug}`);
    return { success: true, page };
  } catch (error) {
    throw new Error(`Failed to publish page: ${error}`);
  }
}

export async function deletePageAction(id: string) {
  const user = await requireAdminUser();
  if (!user) {
    throw new Error('Unauthorized: Admin role required');
  }

  try {
    const page = await prisma.pageContent.delete({
      where: { id },
    });
    revalidatePath('/pages');
    revalidatePath(`/pages/${page.slug}`);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete page: ${error}`);
  }
}
