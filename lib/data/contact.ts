import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from '@/lib/json-db/store';
import type { ContactMessage } from '@/lib/json-db/types';

export async function getContactMessages(filters: { read?: boolean; replied?: boolean } = {}) {
  return listRecords(
    'contact-messages',
    (message) =>
      (filters.read === undefined || message.read === filters.read) &&
      (filters.replied === undefined || message.replied === filters.replied),
    (a, b) => String(b.created_at).localeCompare(String(a.created_at)),
  );
}

export async function getContactMessageById(id: string) {
  return getRecord('contact-messages', id);
}

export async function createContactMessage(data: Partial<ContactMessage>) {
  return createRecord('contact-messages', { read: false, replied: false, ...data }, 'message');
}

export async function updateContactMessage(id: string, data: Partial<ContactMessage>) {
  return updateRecord('contact-messages', id, data);
}

export async function deleteContactMessage(id: string) {
  await deleteRecord('contact-messages', id);
}

export async function markAsRead(id: string) {
  return updateRecord('contact-messages', id, { read: true });
}

export async function markAsReplied(id: string, reply?: string) {
  return updateRecord('contact-messages', id, { replied: true, read: true, reply });
}
