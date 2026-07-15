import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';

export async function POST() {
  const user = await requireAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(
    {
      error:
        'Upload désactivé en mode JSON local. Utilisez une image existante dans /public ou une URL externe optimisée.',
    },
    { status: 400 },
  );
}
