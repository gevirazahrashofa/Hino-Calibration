# Hino Calibration

Sistem manajemen kalibrasi alat ukur (torque & non-torque) — pengajuan registrasi/cancellation oleh user, review dan approval oleh admin kalibrasi, serta master list alat ukur.

Frontend: HTML/CSS/JS vanilla (`client/`). Backend: Express 4 + Prisma ORM + MySQL (`server/`). Database sebelumnya memakai `mysql2` pool langsung ke XAMPP, sekarang memakai Prisma Client (provider tetap MySQL agar kompatibel XAMPP).

## Fitur

- Auth JWT: register, login (ingat saya 7 hari / 2 jam), logout, role `admin` / `user`.
- Form Registrasi (user): pengajuan `registration` / `cancellation`, tanda tangan canvas (base64 PNG), daftar pengajuan milik sendiri.
- Pengajuan Masuk (admin): filter `pending/approved/rejected`, modal review (bagian kalibrasi + serah terima), judgement `OK/NG/Cancel`, tombol cetak form A4.
- Daftar Alat (admin & user): cari `q`, filter `status` (`active/cancelled`) dan `tipe`, edit master data (admin saja).
- Cancellation: `POST /api/alat-ukur/:id/cancel` + riwayat di `riwayat_pembatalan`. Pengajuan `cancellation` yang di-approve juga meng-cancel otomatis via transaction.
- System (admin): manajemen akun (`/api/sistem/users`) dan pengaturan aplikasi (`/api/sistem/settings`).
- Dashboard: sidebar berbasis role, kalender/plan/grafik masih dummy (belum terhubung DB).

## Struktur proyek

```
.
├── client/                  # frontend statis (disajikan Express)
│   ├── index.html           # login & signup
│   ├── dashboard.html
│   └── assets/{css,js,img}  # js/pages: registrasi.js, pengajuan.js, daftar-alat.js
├── server/
│   ├── server.js            # entry point Express
│   ├── config/prisma.js     # singleton PrismaClient
│   ├── prisma/schema.prisma # sumber kebenaran DB (MySQL)
│   ├── controllers/         # auth, registrasi (port), sistem (port)
│   ├── routes/              # auth, alat-ukur, pengajuan, registrasi, sistem
│   └── middleware/auth.js   # verifyToken, requireRole, adminOnly
├── database/schema.sql      # DDL lama XAMPP (referensi; pengganti: prisma migrate)
├── .env.example             # contoh env (commit), .env asli gitignored
└── README.md
```

## Prasyarat

- Node.js 18+ dan npm
- MySQL via XAMPP (atau MariaDB sistem). Default XAMPP: `host=localhost`, `user=root`, password kosong, `port=3306`.
- `phpMyAdmin` opsional (untuk inspeksi manual).

## Cara menjalankan (keseluruhan)

1. Clone dan masuk direktori:
   ```bash
   git clone <repo-url>
   cd Hino-Calibration
   ```
2. Install backend:
   ```bash
   cd server
   npm install
   ```
3. Siapkan env (dibaca dari `server/.env` oleh Prisma CLI dan `server.js`; salin ke dua lokasi agar konsisten):
   ```bash
   cp .env.example .env
   cp .env.example server/.env
   # edit DATABASE_URL jika perlu, contoh XAMPP:
   # DATABASE_URL="mysql://root:@localhost:3306/hino_calibration"
   ```
4. Nyalakan MySQL (XAMPP):
   - Buka XAMPP Control Panel → Start MySQL, atau `sudo /opt/lampp/lampp startmysql`.
   - Pastikan database ada (Prisma migrate membuatnya otomatis; atau manual `CREATE DATABASE hino_calibration;`).
5. Migrasi Prisma (membuat tabel `users, alat_ukur, riwayat_pembatalan, pengajuan, pengaturan`):
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
   Migrasi dari data XAMPP lama: `mysqldump` / export phpMyAdmin lalu import ke `hino_calibration` sebelum migrate, atau biarkan migrate membuat skema kosong lalu isi ulang.
6. Jalankan server:
   ```bash
   npm run dev     # nodemon, auto-reload
   # atau
   npm start       # node server.js
   ```
7. Buka di browser:
   - Login: `http://localhost:3000/` (atau `/`)
   - Dashboard: `http://localhost:3000/dashboard` (butuh token, auto-redirect jika belum login)
   - Health: `http://localhost:3000/api/health`

Buat admin pertama: daftar sebagai `user` via UI, lalu di MySQL:
```sql
UPDATE users SET role='admin' WHERE username='nama_user';
```

## Variabel environment

| Key | Contoh | Keterangan |
|---|---|---|
| `DATABASE_URL` | `mysql://root:@localhost:3306/hino_calibration` | koneksi Prisma MySQL |
| `PORT` | `3000` | port Express + frontend statis |
| `JWT_SECRET` | `ganti_dengan_secret_yang_kuat` | secret JWT (wajib diganti di produksi) |

## API ringkas

Semua kecuali `/api/auth/*` dan `/api/health` butuh header `Authorization: Bearer <token>`.

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/auth/register` | publik | `{username, password, role?}` → role selain `admin` jadi `user` |
| POST | `/api/auth/login` | publik | `{username, password, ingatSaya?}` → `{token, user}` |
| POST | `/api/auth/logout` | — | stateless, hapus token di client |
| GET | `/api/alat-ukur?q=&status=&tipe=` | login | list master |
| POST | `/api/alat-ukur` | login | registrasi alat |
| PUT | `/api/alat-ukur/:id` | admin | edit master |
| POST | `/api/alat-ukur/:id/cancel` | login | cancel + riwayat |
| GET | `/api/pengajuan?status=` | login | admin semua, user miliknya |
| POST | `/api/pengajuan` | login | kirim pengajuan (`pending`) |
| PUT | `/api/pengajuan/:id/review` | admin | approve/reject (transaction; `registration OK` → upsert master, `cancellation OK` → cancel) |
| GET/POST/PUT/DELETE | `/api/registrasi` | login | CRUD kompatibel lama (alias master) |
| GET/POST/PUT/DELETE | `/api/sistem/users` | admin | manajemen akun |
| GET/PUT | `/api/sistem/settings` | admin | pengaturan aplikasi |

Format body frontend memakai `snake_case` (`nama_alat, control_number, ...`); backend Prisma memakai `camelCase` dan menormalkan dua arah agar kompatibel.

## Script npm (`server/`)

- `npm start` — jalan produksi
- `npm run dev` — nodemon
- `npm run prisma:generate` — generate Prisma Client
- `npm run prisma:migrate` — `prisma migrate dev`
- `npm run prisma:studio` — GUI DB

## Troubleshooting

- `Can't connect to MySQL / ERROR 2002`: MySQL XAMPP belum start. Start via panel, cek `DATABASE_URL` (user/password/port/socket).
- `P2002 / Control number sudah terdaftar`: `control_number` unique — pakai nomor lain atau edit data lama.
- `401 Token tidak ditemukan / Sesi habis`: login ulang; pastikan header `Authorization: Bearer ...` terkirim (frontend baru memakai `/api` relatif, bukan `localhost:3000` hardcode).
- `Prisma enum / non-torque`: API menerima `non-torque` dan `non_torque`, disimpan sebagai enum Prisma `non_torque` (`@map("non-torque")`).
- Dashboard angka/kalender/grafik masih contoh: memang dummy di `dashboard.js` (`TOTAL_TORSI`, `jadwalHari()`), belum query API.
- `.../registrasi` dan `.../sistem` 404: pastikan `npm install` sudah menarik `@prisma/client` dan server dijalankan dari `server/` setelah migrate.

## Catatan migrasi (mysql2 → Prisma)

- `server/config/db.js` (pool `mysql2`) dihapus, diganti `server/config/prisma.js`.
- `ER_DUP_ENTRY` → `P2002`, transaction manual `getConnection/beginTransaction` → `prisma.$transaction`.
- Auth disatukan ke `middleware/auth.js` (`verifyToken`, `adminOnly`); bug lama `role='staff'` diperbaiki ke `'user'` sesuai enum DB.
- Tabel baru yang sebelumnya tidak ada di `schema.sql` (`pengajuan`, `pengaturan` + kolom `users.nama_lengkap/email`) kini ada di `prisma/schema.prisma` sebagai sumber kebenaran.
