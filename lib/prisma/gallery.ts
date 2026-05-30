import { prisma } from '../prisma';

export async function getGallery(filters?: { category?: string; active?: boolean }) {
  const where: any = {};
  if (filters?.category) {
    where.category = filters.category;
  }
  if (filters?.active !== undefined) {
    where.active = filters.active;
  }

  return prisma.gallery.findMany({
    where,
    orderBy: { order: 'asc' },
  });
}

export async function getGalleryById(id: string) {
  return prisma.gallery.findUnique({
    where: { id },
  });
}

export async function createGalleryItem(data: {
  title: string;
  image_url: string;
  description?: string;
  category?: string;
  order?: number;
  active?: boolean;
}) {
  return prisma.gallery.create({ data });
}

export async function updateGalleryItem(
  id: string,
  data: Partial<{
    title: string;
    image_url: string;
    description: string;
    category: string;
    order: number;
    active: boolean;
  }>,
) {
  return prisma.gallery.update({
    where: { id },
    data,
  });
}

export async function deleteGalleryItem(id: string) {
  return prisma.gallery.delete({
    where: { id },
  });
}
