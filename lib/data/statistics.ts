import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from '@/lib/json-db/store';
import type { Statistic } from '@/lib/json-db/types';

export async function getStatistics(filters: { active?: boolean } = {}) {
  return listRecords('statistics', (statistic) => filters.active === undefined || statistic.active === filters.active);
}

export async function getStatisticById(id: string) {
  return getRecord('statistics', id);
}

export async function createStatistic(data: Partial<Statistic>) {
  return createRecord('statistics', { active: true, order: 0, ...data }, 'statistic');
}

export async function updateStatistic(id: string, data: Partial<Statistic>) {
  return updateRecord('statistics', id, data);
}

export async function deleteStatistic(id: string) {
  await deleteRecord('statistics', id);
}
