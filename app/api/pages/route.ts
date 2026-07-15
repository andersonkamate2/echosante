import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getAllPageContents, createPageContent } from '@/lib/data/pages';

export async function GET() {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pages = await getAllPageContents();
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const page = await createPageContent(payload);
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create page' }, { status: 500 });
  }
}
