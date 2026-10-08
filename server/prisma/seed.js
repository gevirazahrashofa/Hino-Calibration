// Seed admin default: node prisma/seed.js (via `npm run prisma:seed`).
// Idempotent — dilewati bila username sudah terdaftar, jadi aman dijalankan ulang.
// Kredensial dibaca dari env (ADMIN_USERNAME / ADMIN_PASSWORD), tidak pernah di-log.
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const PLACEHOLDER = 'ganti-password-admin-ini';

async function main() {
  const username = (process.env.ADMIN_USERNAME || 'admin').trim();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!username) {
    console.error('ADMIN_USERNAME kosong — seed admin dibatalkan.');
    process.exit(1);
  }
  if (!password || password.length < 6) {
    console.error('ADMIN_PASSWORD belum diisi (min 6 karakter) di .env — seed admin dibatalkan.');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log(`Admin '${username}' sudah ada — seed dilewati.`);
      return;
    }
    await prisma.user.create({
      data: { username, password: await bcrypt.hash(password, 10), role: 'admin' },
    });
    console.log(`Admin '${username}' berhasil dibuat.`);
    if (password === PLACEHOLDER) {
      console.warn('PERINGATAN: masih memakai password contoh — segera ganti ADMIN_PASSWORD di .env.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
