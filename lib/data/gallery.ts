import type { GalleryItem } from '@/types/content';
import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from '@/lib/json-db/store';

export async function getGallery(filters: { category?: string; active?: boolean } = {}) {
  return listRecords(
    'gallery',
    (item) =>
      (filters.active === undefined || item.active === filters.active) &&
      (!filters.category || item.category === filters.category),
  );
}

export async function getGalleryById(id: string) {
  return getRecord('gallery', id);
}

export async function createGalleryItem(data: Partial<GalleryItem>) {
  return createRecord('gallery', { active: true, order: 0, category: 'general', ...data }, 'gallery');
}

export async function updateGalleryItem(id: string, data: Partial<GalleryItem>) {
  return updateRecord('gallery', id, data);
}

export async function deleteGalleryItem(id: string) {
  await deleteRecord('gallery', id);
}
