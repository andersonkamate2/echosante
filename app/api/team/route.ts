import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getTeamMembers, createTeamMember } from '@/lib/prisma/team';

export async function GET() {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const members = await getTeamMembers();
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const member = await createTeamMember(payload);
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create team member' }, { status: 500 });
  }
}
