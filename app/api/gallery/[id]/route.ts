import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getGalleryById, updateGalleryItem, deleteGalleryItem } from '@/lib/prisma/gallery';

export async function GET(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    const item = await getGalleryById(id);
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch gallery item' }, { status: 500 });
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
    const item = await updateGalleryItem(id, payload);
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    await deleteGalleryItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete gallery item' }, { status: 500 });
  }
}
