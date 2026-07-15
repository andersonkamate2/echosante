import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getServices, createService } from '@/lib/data/services';

export async function GET() {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const services = await getServices();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const service = await createService(payload);
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create service' }, { status: 500 });
  }
}
