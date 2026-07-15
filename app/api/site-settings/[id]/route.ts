import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getSiteSettingById, updateSiteSetting, deleteSiteSetting } from '@/lib/data/siteSettings';

export async function GET(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    const setting = await getSiteSettingById(id);
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch site setting' }, { status: 500 });
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
    const setting = await updateSiteSetting(id, payload);
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update site setting' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    await deleteSiteSetting(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete site setting' }, { status: 500 });
  }
}
