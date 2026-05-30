import { NextResponse } from 'next/server';
import { getAdminArticles, upsertArticle } from '@/lib/prisma/articles';
import { requireAdminUser } from '@/lib/auth-middleware';

export async function GET() {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const articles = await getAdminArticles();
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: 'Impossible de charger les articles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const article = await upsertArticle(payload);
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Impossible d’enregistrer l’article' }, { status: 500 });
  }
}
