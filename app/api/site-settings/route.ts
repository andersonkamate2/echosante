import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getSiteSettings, upsertSiteSetting } from '@/lib/data/siteSettings';

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const setting = await upsertSiteSetting(payload);
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create or update site setting' }, { status: 500 });
  }
}
