import { prisma } from '../prisma';

export async function getServices(filters?: { active?: boolean }) {
  const where: any = {};
  if (filters?.active !== undefined) {
    where.active = filters.active;
  }

  return prisma.service.findMany({
    where,
    orderBy: { order: 'asc' },
  });
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
  });
}

export async function createService(data: {
  title: string;
  description: string;
  icon?: string;
  order?: number;
  active?: boolean;
}) {
  return prisma.service.create({ data });
}

export async function updateService(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    icon: string;
    order: number;
    active: boolean;
  }>,
) {
  return prisma.service.update({
    where: { id },
    data,
  });
}

export async function deleteService(id: string) {
  return prisma.service.delete({
    where: { id },
  });
}
