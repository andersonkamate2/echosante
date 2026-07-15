import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getStatistics, createStatistic } from '@/lib/data/statistics';

export async function GET() {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await getStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch statistics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const stat = await createStatistic(payload);
    return NextResponse.json(stat);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create statistic' }, { status: 500 });
  }
}
