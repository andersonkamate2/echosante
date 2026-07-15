import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getStatisticById, updateStatistic, deleteStatistic } from '@/lib/data/statistics';

export async function GET(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    const stat = await getStatisticById(id);
    return NextResponse.json(stat);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch statistic' }, { status: 500 });
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
    const stat = await updateStatistic(id, payload);
    return NextResponse.json(stat);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update statistic' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    await deleteStatistic(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete statistic' }, { status: 500 });
  }
}
