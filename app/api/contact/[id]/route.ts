import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getContactMessageById, updateContactMessage, deleteContactMessage, markAsRead, markAsReplied } from '@/lib/data/contact';

export async function GET(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    const message = await getContactMessageById(id);
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch message' }, { status: 500 });
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

    let message = null;

    if (payload.markAsRead) {
      message = await markAsRead(id);
    }

    if (payload.markAsReplied && payload.reply) {
      message = await markAsReplied(id, payload.reply);
    }

    const updateData: Record<string, unknown> = {};
    if (typeof payload.read !== 'undefined') updateData.read = payload.read;
    if (typeof payload.replied !== 'undefined') updateData.replied = payload.replied;
    if (typeof payload.reply !== 'undefined') updateData.reply = payload.reply;

    if (Object.keys(updateData).length > 0) {
      message = await updateContactMessage(id, updateData);
    }

    if (!message) {
      message = await getContactMessageById(id);
    }

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update message' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    await deleteContactMessage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete message' }, { status: 500 });
  }
}
