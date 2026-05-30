import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getContactMessages, createContactMessage } from '@/lib/prisma/contact';

export async function GET(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const read = url.searchParams.get('read') === 'true' ? true : undefined;
    const replied = url.searchParams.get('replied') === 'true' ? true : undefined;

    const messages = await getContactMessages({
      read,
      replied,
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const message = await createContactMessage(payload);
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create message' }, { status: 500 });
  }
}
