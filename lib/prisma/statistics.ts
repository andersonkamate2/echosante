import { prisma } from '../prisma';

export async function getStatistics(filters?: { active?: boolean }) {
  const where: any = {};
  if (filters?.active !== undefined) {
    where.active = filters.active;
  }

  return prisma.statistic.findMany({
    where,
    orderBy: { order: 'asc' },
  });
}

export async function getStatisticById(id: string) {
  return prisma.statistic.findUnique({
    where: { id },
  });
}

export async function createStatistic(data: {
  label: string;
  value: string;
  order?: number;
  active?: boolean;
}) {
  return prisma.statistic.create({ data });
}

export async function updateStatistic(
  id: string,
  data: Partial<{
    label: string;
    value: string;
    order: number;
    active: boolean;
  }>,
) {
  return prisma.statistic.update({
    where: { id },
    data,
  });
}

export async function deleteStatistic(id: string) {
  return prisma.statistic.delete({
    where: { id },
  });
}
