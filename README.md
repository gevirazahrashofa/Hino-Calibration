# Hino Calibration

Aplikasi pendataan kalibrasi alat ukur (torque & non-torque): user mengajukan registrasi/cancellation alat, admin kalibrasi me-review dan menyetujui, lalu data masuk ke master list alat ukur.

- **User**: ajukan registrasi/cancellation (dengan tanda tangan digital), pantau status pengajuan sendiri, lihat daftar alat.
- **Admin**: review dan setujui/tolak pengajuan (plus cetak form), kelola master data alat, cancel alat, kelola akun dan pengaturan aplikasi.

Frontend: HTML/CSS/JS (`client/`). Backend: Express + Prisma + MariaDB (`server/`, database via Docker).

## Butuh apa

- Node.js 18+ dan npm
- Docker + Docker Compose (Docker Desktop di Windows/Mac)

## Cara menjalankan (dari folder root)

```bash
npm run setup
```

Salin `.env.example` menjadi `.env`, lalu isi `ADMIN_PASSWORD` dan `JWT_SECRET`:

- Windows CMD: `copy .env.example .env`
- PowerShell: `Copy-Item .env.example .env`
- Linux/Mac: `cp .env.example .env`

```bash
npm run db:up            # nyalakan MariaDB (localhost:3307)
npm run prisma:migrate   # buat tabel-tabel
npm run prisma:seed      # buat akun admin awal (tanpa buka DB manual)
npm run dev              # jalankan aplikasi
```

Buka `http://localhost:3000` dan login dengan `ADMIN_USERNAME` / `ADMIN_PASSWORD` dari `.env`. Cek kesehatan API: `http://localhost:3000/api/health`. Inspeksi DB (pengganti phpMyAdmin): `http://localhost:8081` (server `db`, user `hino`).

Reset data dari nol:

```bash
docker compose down -v
npm run db:up
npm run prisma:migrate
npm run prisma:seed
```

## Pengaturan (.env)

| Key | Contoh | Keterangan |
|---|---|---|
| `DATABASE_URL` | `mysql://hino:hino_pass@localhost:3307/hino_calibration` | koneksi MariaDB Docker |
| `PORT` | `3000` | port aplikasi |
| `JWT_SECRET` | (acak, rahasia) | secret token login — wajib diganti |
| `ADMIN_USERNAME` | `admin` | username admin awal |
| `ADMIN_PASSWORD` | (min 6 karakter) | password admin awal — wajib diganti |

## Script

| Perintah | Fungsi |
|---|---|
| `npm run setup` | install dependensi backend |
| `npm run dev` / `npm start` | jalan dev (auto-reload) / produksi |
| `npm run db:up` / `db:down` / `db:logs` | nyala/mati/log database |
| `npm run prisma:migrate` | migrasi skema DB |
| `npm run prisma:seed` | buat admin awal (aman diulang, dilewati bila sudah ada) |
| `npm run prisma:studio` | GUI database |

Struktur: `client/` (login, dashboard, assets) · `server/` (Express, Prisma di `prisma/`, API di `routes/` + `controllers/`) · `docker-compose.yml` + `docker/init-db/` (database).

## Masalah umum

- **Aplikasi tidak bisa ke database**: tunggu container sehat (`docker compose ps`), lalu cek `DATABASE_URL` (port `3307`).
- **Port 3000 sudah dipakai**: hentikan proses lain yang memakai port tersebut, lalu jalankan ulang.
- **`docker compose` gagal konek daemon**: pastikan Docker jalan, lalu `docker context use default` dan ulangi.
- **Migrate error `P3014/P1010` (DB lama)**: beri hak migrate ke user `hino` sekali via Adminer sebagai `root`: `GRANT ALL PRIVILEGES ON *.* TO 'hino'@'%'; FLUSH PRIVILEGES;`
