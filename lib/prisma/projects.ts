import { prisma } from '../prisma';

export async function getProjects(filters?: { status?: string }) {
  const where: any = {};
  if (filters?.status) {
    where.status = filters.status;
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { order: 'asc' },
  });

  return projects;
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
  });
}

export async function createProject(data: {
  title: string;
  slug: string;
  description: string;
  image_url?: string;
  status?: string;
  order?: number;
}) {
  return prisma.project.create({ data });
}

export async function updateProject(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string;
    image_url: string;
    status: string;
    order: number;
  }>,
) {
  return prisma.project.update({
    where: { id },
    data,
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({
    where: { id },
  });
}
