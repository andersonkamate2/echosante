import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from '@/lib/json-db/store';
import type { TeamMember } from '@/lib/json-db/types';

export async function getTeamMembers(filters: { active?: boolean } = {}) {
  return listRecords('team', (member) => filters.active === undefined || member.active === filters.active);
}

export async function getTeamMemberById(id: string) {
  return getRecord('team', id);
}

export async function createTeamMember(data: Partial<TeamMember>) {
  return createRecord('team', { active: true, order: 0, ...data }, 'team');
}

export async function updateTeamMember(id: string, data: Partial<TeamMember>) {
  return updateRecord('team', id, data);
}

export async function deleteTeamMember(id: string) {
  await deleteRecord('team', id);
}
