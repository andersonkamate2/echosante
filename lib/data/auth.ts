import crypto from 'crypto';
import { createRecord, findRecord, getRecord, listRecords } from '@/lib/json-db/store';
import type { AdminUser } from '@/lib/json-db/types';

function createHash(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export async function ensureLocalAdmin() {
  const users = await listRecords('admin-users');
  if (users.length > 0) return users[0];

  const email = process.env.LOCAL_ADMIN_EMAIL ?? 'admin@echosante.org';
  const password = process.env.LOCAL_ADMIN_PASSWORD ?? 'password';
  const passwordSalt = crypto.randomUUID();
  return createRecord('admin-users', {
    email,
    passwordSalt,
    passwordHash: createHash(password, passwordSalt),
  }, 'admin');
}

export async function verifyLocalAdmin(email: string, password: string) {
  await ensureLocalAdmin();
  const user = await findRecord('admin-users', (admin) => admin.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  const expected = createHash(password, user.passwordSalt);
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(user.passwordHash))) return null;
  return user;
}

export async function getLocalAdminById(id: string) {
  return getRecord('admin-users', id);
}

export async function getLocalAdmins() {
  return listRecords('admin-users');
}

export async function createLocalAdmin(data: Pick<AdminUser, 'email'> & { password?: string }) {
  const passwordSalt = crypto.randomUUID();
  return createRecord('admin-users', {
    email: data.email,
    passwordSalt,
    passwordHash: createHash(data.password || 'password', passwordSalt),
  }, 'admin');
}
