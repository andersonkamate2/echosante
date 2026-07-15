import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getServiceById, updateService, deleteService } from '@/lib/data/services';

export async function GET(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    const service = await getServiceById(id);
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch service' }, { status: 500 });
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
    const service = await updateService(id, payload);
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update service' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    await deleteService(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete service' }, { status: 500 });
  }
}
