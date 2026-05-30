import { prisma } from '../prisma';

export async function getSiteSetting(key: string) {
  return prisma.siteSetting.findUnique({
    where: { key },
  });
}

export async function getSiteSettingById(id: string) {
  return prisma.siteSetting.findUnique({
    where: { id },
  });
}

export async function getSiteSettings() {
  return prisma.siteSetting.findMany({
    orderBy: { key: 'asc' },
  });
}

export async function upsertSiteSetting(data: {
  key: string;
  value: string;
  description?: string;
}) {
  return prisma.siteSetting.upsert({
    where: { key: data.key },
    update: {
      value: data.value,
      description: data.description ?? null,
    },
    create: {
      key: data.key,
      value: data.value,
      description: data.description,
    },
  });
}

export async function updateSiteSetting(id: string, data: Partial<{ value: string; description: string }>) {
  return prisma.siteSetting.update({
    where: { id },
    data,
  });
}

export async function deleteSiteSetting(id: string) {
  return prisma.siteSetting.delete({
    where: { id },
  });
}
