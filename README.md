# Hino Calibration

Sistem manajemen kalibrasi alat ukur (torque & non-torque) — pengajuan registrasi/cancellation oleh user, review dan approval oleh admin kalibrasi, serta master list alat ukur.

Frontend: HTML/CSS/JS vanilla (`client/`). Backend: Express 4 + Prisma ORM + MariaDB (`server/`). Database berjalan di Docker (MariaDB 11); tidak ada ketergantungan XAMPP.

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
│   ├── prisma/schema.prisma # sumber kebenaran DB (MariaDB)
│   ├── prisma/migrations/   # migrasi Prisma
│   ├── controllers/         # auth, registrasi, sistem
│   ├── routes/              # auth, alat-ukur, pengajuan, registrasi, sistem
│   └── middleware/auth.js   # verifyToken, requireRole, adminOnly
├── docker-compose.yml       # DB MariaDB + Adminer
├── package.json             # script root (teruskan ke server/)
├── .env.example             # contoh env (commit), .env asli gitignored
└── README.md
```

## Prasyarat

- Node.js 18+ dan npm
- Docker + Docker Compose (untuk database)
- Tanpa XAMPP — database hanya dari `docker compose`

## Cara menjalankan (keseluruhan)

Semua perintah di bawah dijalankan dari root proyek (ada `package.json` root yang meneruskan ke `server/`).

1. Clone dan masuk direktori:
   ```bash
   git clone <repo-url>
   cd Hino-Calibration
   ```
2. Install backend:
   ```bash
   npm run setup
   ```
3. Siapkan env (satu file di root; npm script `prisma:*` otomatis memuatnya):
   ```bash
   cp .env.example .env
   # isi default sudah cocok untuk docker-compose:
   # DATABASE_URL="mysql://hino:hino_pass@localhost:3307/hino_calibration"
   ```
4. Nyalakan database Docker (MariaDB 11 di `localhost:3307`):
   ```bash
   npm run db:up
   npm run db:logs
   ```
   Database `hino_calibration`, user `hino` / password `hino_pass` dibuat otomatis. Prisma migrate juga bisa membuat DB bila belum ada.
5. Migrasi Prisma (membuat tabel `users, alat_ukur, riwayat_pembatalan, pengajuan, pengaturan`):
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```
   Catatan: user `hino` tidak punya hak `CREATE DATABASE` untuk shadow DB migrate. Bila `migrate dev` error `P3014/P1010`, jalankan sekali dari `server/` dengan URL root:
   ```bash
   cd server && DATABASE_URL="mysql://root:root@localhost:3307/hino_calibration" npx prisma migrate dev
   ```
   Runtime app tetap memakai `hino` (cukup hak CRUD).
6. Jalankan server:
   ```bash
   npm run dev     # nodemon, auto-reload (atau: npm run db:up untuk DB saja)
   # atau
   npm start       # node server.js
   ```
7. Buka di browser:
   - Login: `http://localhost:3000/` (atau `/`)
   - Dashboard: `http://localhost:3000/dashboard` (butuh token, auto-redirect jika belum login)
   - Health: `http://localhost:3000/api/health`
   - Adminer (pengganti phpMyAdmin): `http://localhost:8081` — server `db`, user `hino`, password `hino_pass`, db `hino_calibration`

Buat admin pertama: daftar sebagai `user` via UI, lalu via Adminer / Prisma Studio:
```sql
UPDATE users SET role='admin' WHERE username='nama_user';
```

Reset total (hapus data DB, dari root):
```bash
docker compose down -v
npm run db:up
npm run prisma:migrate
```

## Variabel environment

| Key | Contoh | Keterangan |
|---|---|---|
| `DATABASE_URL` | `mysql://hino:hino_pass@localhost:3307/hino_calibration` | koneksi Prisma ke MariaDB Docker |
| `PORT` | `3000` | port Express + frontend statis |
| `JWT_SECRET` | `ganti_dengan_secret_yang_kuat` | secret JWT (wajib diganti di produksi) |

Kredensial Docker (`docker-compose.yml`): root `root`, user `hino` / `hino_pass`, DB `hino_calibration`, host port `3307`.

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

## Script npm (dari root; diteruskan ke `server/` bila perlu)

- `npm run setup` — install dependensi backend (`server/`)
- `npm start` — jalan produksi
- `npm run dev` — nodemon
- `npm run db:up` / `db:down` / `db:logs` — kontrol container DB
- `npm run prisma:generate` — generate Prisma Client
- `npm run prisma:migrate` — `prisma migrate dev`
- `npm run prisma:studio` — GUI DB

## Troubleshooting

- `Can't reach database / P1000/P1001`: container DB belum ready. Cek `docker compose ps`, `docker compose logs db`, tunggu healthcheck hijau, cek `DATABASE_URL` (port `3307`, bukan `3306`).
- `Port 3307 sudah dipakai`: hentikan MySQL lokal lain atau ubah mapping di `docker-compose.yml`.
- `failed to connect to the docker API ... desktop/docker.sock`: konteks Docker menunjuk ke Docker Desktop yang tidak jalan. Perbaiki sekali: `docker context use default`, lalu ulangi `npm run db:up`. Alternatif per-perintah: `DOCKER_HOST=unix:///var/run/docker.sock npm run db:up`.
- `P2002 / Control number sudah terdaftar`: `control_number` unique — pakai nomor lain atau edit data lama.
- `401 Token tidak ditemukan / Sesi habis`: login ulang; pastikan header `Authorization: Bearer ...` terkirim (frontend memakai `/api` relatif).
- `Prisma enum / non-torque`: API menerima `non-torque` dan `non_torque`, disimpan sebagai enum Prisma `non_torque` (`@map("non-torque")`).
- Dashboard angka/kalender/grafik masih contoh: memang dummy di `dashboard.js` (`TOTAL_TORSI`, `jadwalHari()`), belum query API.
- `.../registrasi` dan `.../sistem` 404: pastikan `npm run setup` sudah menarik `@prisma/client` dan migrate sudah jalan.
- `ENOENT ... package.json` saat `npm run <script>`: script backend hanya ada di root dan `server/` — jalankan dari salah satu direktori itu, bukan dari subfolder lain.

## Catatan database

- Sumber kebenaran skema: `server/prisma/schema.prisma` + `server/prisma/migrations/`.
- DB lokal: MariaDB 11 via `docker-compose.yml` (`db_data` volume). Tidak ada `database/schema.sql` lagi.
- duplikat `ER_DUP_ENTRY` lama → `P2002`; transaction manual → `prisma.$transaction`; auth disatukan di `middleware/auth.js`.
