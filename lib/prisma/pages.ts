import { prisma } from '../prisma';

export async function getPageContent(slug: string) {
  return prisma.pageContent.findUnique({
    where: { slug },
  });
}

export async function getPublishedPageContentBySlug(slug: string) {
  return prisma.pageContent.findFirst({
    where: { slug, published: true },
  });
}

export async function getAllPageContents(filters?: { published?: boolean }) {
  const where: any = {};
  if (filters?.published !== undefined) {
    where.published = filters.published;
  }

  return prisma.pageContent.findMany({
    where,
    orderBy: { order: 'asc' },
  });
}

export async function getPageContentById(id: string) {
  return prisma.pageContent.findUnique({
    where: { id },
  });
}

export async function createPageContent(data: {
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  order?: number;
  published?: boolean;
}) {
  return prisma.pageContent.create({ data });
}

export async function updatePageContent(
  id: string,
  data: Partial<{
    slug: string;
    title: string;
    content: string;
    meta_description: string;
    order: number;
    published: boolean;
  }>,
) {
  return prisma.pageContent.update({
    where: { id },
    data,
  });
}

export async function deletePageContent(id: string) {
  return prisma.pageContent.delete({
    where: { id },
  });
}
