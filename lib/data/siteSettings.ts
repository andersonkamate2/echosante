import { deleteRecord, findRecord, getRecord, listRecords, updateRecord, upsertRecord } from '@/lib/json-db/store';
import type { SiteSetting } from '@/lib/json-db/types';

export async function getSiteSetting(key: string) {
  return findRecord('site-settings', (setting) => setting.key === key);
}

export async function getSiteSettingById(id: string) {
  return getRecord('site-settings', id);
}

export async function getSiteSettings() {
  return listRecords('site-settings', undefined, (a, b) => a.key.localeCompare(b.key));
}

export async function upsertSiteSetting(data: Partial<SiteSetting>) {
  return upsertRecord<'site-settings'>('site-settings', data, 'setting', (setting) => Boolean(data.key && setting.key === data.key));
}

export async function updateSiteSetting(id: string, data: Partial<SiteSetting>) {
  return updateRecord('site-settings', id, data);
}

export async function deleteSiteSetting(id: string) {
  await deleteRecord('site-settings', id);
}
