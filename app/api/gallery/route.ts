import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getPublishedGallery } from '@/lib/supabase/public';
import { getGallery, createGalleryItem } from '@/lib/prisma/gallery';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') ?? undefined;
    const user = await requireAdminUser();

    if (user) {
      const items = await getGallery({ category });
      return NextResponse.json(items);
    }

    const items = await getPublishedGallery(category);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch gallery items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const item = await createGalleryItem(payload);
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create gallery item' }, { status: 500 });
  }
}
