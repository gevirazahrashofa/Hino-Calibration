-- Dijalankan otomatis oleh image MariaDB hanya saat volume db_data masih kosong
-- (inisialisasi pertama). Memberi user hino hak CREATE DATABASE agar
-- `prisma migrate dev` bisa membuat shadow database. Aman untuk dev lokal.
GRANT ALL PRIVILEGES ON *.* TO 'hino'@'%';
FLUSH PRIVILEGES;
