import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { deleteArticle } from '@/lib/data/articles';

export async function DELETE(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await deleteArticle(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Impossible de supprimer l’article' }, { status: 500 });
  }
}
