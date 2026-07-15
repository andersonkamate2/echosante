import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from '@/lib/json-db/store';
import type { Service } from '@/lib/json-db/types';

export async function getServices(filters: { active?: boolean } = {}) {
  return listRecords('services', (service) => filters.active === undefined || service.active === filters.active);
}

export async function getServiceById(id: string) {
  return getRecord('services', id);
}

export async function createService(data: Partial<Service>) {
  return createRecord('services', { active: true, order: 0, ...data }, 'service');
}

export async function updateService(id: string, data: Partial<Service>) {
  return updateRecord('services', id, data);
}

export async function deleteService(id: string) {
  await deleteRecord('services', id);
}
