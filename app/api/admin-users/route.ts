import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { createRecord, deleteRecord, findRecord, listRecords, updateRecord } from '@/lib/json-db/store';

function createHash(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function publicAdmin(admin: any) {
  const { passwordHash, passwordSalt, ...safe } = admin;
  return safe;
}

export async function GET() {
  const user = await requireAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admins = await listRecords('admin-users');
  return NextResponse.json(admins.map(publicAdmin));
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '').trim();
  if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });

  const existing = await findRecord('admin-users', (admin) => admin.email.toLowerCase() === email.toLowerCase());
  if (existing) return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });

  const passwordSalt = crypto.randomUUID();
  const created = await createRecord('admin-users', { email, passwordSalt, passwordHash: createHash(password, passwordSalt) }, 'admin');
  return NextResponse.json(publicAdmin(created), { status: 201 });
}

export async function PUT(request: Request) {
  const user = await requireAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const id = String(body.id ?? '').trim();
  const password = body.password ? String(body.password).trim() : '';
  if (!id || !password) return NextResponse.json({ error: 'ID et nouveau mot de passe requis' }, { status: 400 });

  const passwordSalt = crypto.randomUUID();
  const updated = await updateRecord('admin-users', id, { passwordSalt, passwordHash: createHash(password, passwordSalt) });
  return NextResponse.json(publicAdmin(updated));
}

export async function DELETE(request: Request) {
  const user = await requireAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const id = String(body.id ?? '').trim();
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  if (id === user.id) return NextResponse.json({ error: 'Impossible de se supprimer soi-même' }, { status: 400 });

  await deleteRecord('admin-users', id);
  return new NextResponse(null, { status: 204 });
}
