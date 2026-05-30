import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { getTeamMemberById, updateTeamMember, deleteTeamMember } from '@/lib/prisma/team';

export async function GET(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    const member = await getTeamMemberById(id);
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch team member' }, { status: 500 });
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
    const member = await updateTeamMember(id, payload);
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update team member' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    await deleteTeamMember(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete team member' }, { status: 500 });
  }
}
