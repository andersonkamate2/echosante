import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function createHash(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export async function GET() {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admins = await prisma.adminUser.findMany({
    select: { id: true, email: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json(admins);
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '').trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
  }

  const salt = crypto.randomUUID();
  const passwordHash = createHash(password, salt);

  const created = await prisma.adminUser.create({
    data: { email, passwordHash, passwordSalt: salt },
    select: { id: true, email: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PUT(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const id = String(body.id ?? '').trim();
  const password = body.password ? String(body.password).trim() : undefined;

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: 'Nouveau mot de passe requis' }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Administrateur introuvable' }, { status: 404 });
  }

  const salt = crypto.randomUUID();
  const passwordHash = createHash(password, salt);

  const updated = await prisma.adminUser.update({
    where: { id },
    data: { passwordHash, passwordSalt: salt },
    select: { id: true, email: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const id = String(body.id ?? '').trim();

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }

  if (id === user.id) {
    return NextResponse.json({ error: 'Impossible de se supprimer soi-même' }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Administrateur introuvable' }, { status: 404 });
  }

  await prisma.adminUser.delete({
    where: { id },
  });

  return new NextResponse(null, { status: 204 });
}
