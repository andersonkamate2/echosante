import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/supabase/public';
import { getAdminArticles } from '@/lib/prisma/articles';
import { requireAdminUser } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isAdmin = url.searchParams.get('admin') === 'true';

  try {
    if (isAdmin) {
      const user = await requireAdminUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const articles = await getAdminArticles();
      return NextResponse.json(articles);
    }

    const query = url.searchParams.get('q') ?? undefined;
    const category = url.searchParams.get('category') ?? undefined;
    const articles = await getPublishedArticles({ query, category });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch articles' }, { status: 500 });
  }
}
