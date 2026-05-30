import { prisma } from '../prisma';

export async function getTeamMembers(filters?: { active?: boolean }) {
  const where: any = {};
  if (filters?.active !== undefined) {
    where.active = filters.active;
  }

  const members = await prisma.teamMember.findMany({
    where,
    orderBy: { order: 'asc' },
  });

  return members;
}

export async function getTeamMemberById(id: string) {
  return prisma.teamMember.findUnique({
    where: { id },
  });
}

export async function createTeamMember(data: {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  image_url?: string;
  bio?: string;
  order?: number;
  active?: boolean;
}) {
  return prisma.teamMember.create({ data });
}

export async function updateTeamMember(
  id: string,
  data: Partial<{
    name: string;
    role: string;
    email: string;
    phone: string;
    image_url: string;
    bio: string;
    order: number;
    active: boolean;
  }>,
) {
  return prisma.teamMember.update({
    where: { id },
    data,
  });
}

export async function deleteTeamMember(id: string) {
  return prisma.teamMember.delete({
    where: { id },
  });
}
