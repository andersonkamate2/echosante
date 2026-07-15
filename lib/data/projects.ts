import { createRecord, deleteRecord, findRecord, getRecord, listRecords, updateRecord } from '@/lib/json-db/store';
import type { Project } from '@/lib/json-db/types';

export async function getProjects(filters: { status?: string } = {}) {
  return listRecords('projects', (project) => !filters.status || project.status === filters.status);
}

export async function getProjectById(id: string) {
  return getRecord('projects', id);
}

export async function getProjectBySlug(slug: string) {
  return findRecord('projects', (project) => project.slug === slug);
}

export async function createProject(data: Partial<Project>) {
  return createRecord('projects', { status: 'active', order: 0, ...data }, 'project');
}

export async function updateProject(id: string, data: Partial<Project>) {
  return updateRecord('projects', id, data);
}

export async function deleteProject(id: string) {
  await deleteRecord('projects', id);
}
