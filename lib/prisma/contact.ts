import { prisma } from '../prisma';

export async function getContactMessages(filters?: { read?: boolean; replied?: boolean }) {
  const where: any = {};
  if (filters?.read !== undefined) {
    where.read = filters.read;
  }
  if (filters?.replied !== undefined) {
    where.replied = filters.replied;
  }

  return prisma.contactMessage.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });
}

export async function getContactMessageById(id: string) {
  return prisma.contactMessage.findUnique({
    where: { id },
  });
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}) {
  return prisma.contactMessage.create({ data });
}

export async function updateContactMessage(
  id: string,
  data: Partial<{
    read: boolean;
    replied: boolean;
    reply: string;
  }>,
) {
  return prisma.contactMessage.update({
    where: { id },
    data,
  });
}

export async function deleteContactMessage(id: string) {
  return prisma.contactMessage.delete({
    where: { id },
  });
}

export async function markAsRead(id: string) {
  return prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAsReplied(id: string, reply: string) {
  return prisma.contactMessage.update({
    where: { id },
    data: {
      replied: true,
      reply,
    },
  });
}
