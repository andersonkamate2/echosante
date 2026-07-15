import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getPageContentById, updatePageContent, deletePageContent, getPageContent } from '@/lib/data/pages';

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
      const page = await getPageContent(slug);
      return NextResponse.json(page);
    }

    const page = await getPageContentById(id);
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch page' }, { status: 500 });
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
    const page = await updatePageContent(id, payload);
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update page' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    await deletePageContent(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete page' }, { status: 500 });
  }
}
