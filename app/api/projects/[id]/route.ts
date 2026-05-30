import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import {
  getProjects,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/prisma/projects';

export async function GET(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = context.params;

    if (id === 'slug') {
      const url = new URL(request.url);
      const slug = url.searchParams.get('slug');
      if (!slug) {
        return NextResponse.json({ error: 'slug parameter required' }, { status: 400 });
      }
      const project = await getProjectBySlug(slug);
      return NextResponse.json(project);
    }

    const project = await getProjectById(id);
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { id } = context.params;
    const project = await updateProject(id, payload);
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update project' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete project' }, { status: 500 });
  }
}
