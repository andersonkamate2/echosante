import crypto from 'crypto';
import { prisma } from '../prisma';

function createHash(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

async function ensureLocalAdminExists() {
  const count = await prisma.adminUser.count();
  if (count > 0) {
    return;
  }

  const email = process.env.LOCAL_ADMIN_EMAIL ?? 'admin@echosante.org';
  const password = process.env.LOCAL_ADMIN_PASSWORD ?? 'password';
  const salt = crypto.randomUUID();
  const passwordHash = createHash(password, salt);

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      passwordSalt: salt,
    },
  });
}

export async function verifyLocalAdmin(email: string, password: string) {
  await ensureLocalAdminExists();
  const user = await prisma.adminUser.findUnique({
    where: { email },
  });
  if (!user) {
    return null;
  }

  const hash = createHash(password, user.passwordSalt);
  if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.passwordHash))) {
    return null;
  }

  return { id: user.id, email: user.email };
}

export async function getLocalAdminById(id: string) {
  return prisma.adminUser.findUnique({
    where: { id },
  });
}
