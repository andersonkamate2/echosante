import type { PageContent } from '@/types/content';
import { createRecord, deleteRecord, findRecord, getRecord, listRecords, updateRecord, upsertRecord } from '@/lib/json-db/store';

export async function getPageContent(slug: string) {
  return findRecord('pages', (page) => page.slug === slug);
}

export async function getPublishedPageContentBySlug(slug: string) {
  return findRecord('pages', (page) => page.slug === slug && page.published);
}

export async function getAllPageContents(filters: { published?: boolean } = {}) {
  return listRecords('pages', (page) => filters.published === undefined || page.published === filters.published);
}

export async function getPageContentById(id: string) {
  return getRecord('pages', id);
}

export async function createPageContent(data: Partial<PageContent>) {
  return createRecord<'pages'>('pages', { published: true, order: 0, ...data }, 'page');
}

export async function upsertPageContent(data: Partial<PageContent>) {
  return upsertRecord<'pages'>('pages', { published: true, order: 0, ...data }, 'page', (page) => Boolean(data.slug && page.slug === data.slug));
}

export async function updatePageContent(id: string, data: Partial<PageContent>) {
  return updateRecord('pages', id, data);
}

export async function deletePageContent(id: string) {
  await deleteRecord('pages', id);
}
