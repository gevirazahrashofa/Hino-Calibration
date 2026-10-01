-- =====================================================
-- schema.sql : setup database hino_calibration
-- Jalankan lewat phpMyAdmin (tab SQL / Import)
-- =====================================================

CREATE DATABASE IF NOT EXISTS hino_calibration
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE hino_calibration;

-- -----------------------------------------------------
-- Tabel users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT(11)      NOT NULL AUTO_INCREMENT,
  username   VARCHAR(50)  NOT NULL,
  password   VARCHAR(255) NOT NULL,                 -- hash bcrypt, bukan teks asli
  role       ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- CATATAN
-- =====================================================
-- 1. Kolom "role" hanya boleh 'admin' atau 'user' (default 'user').
-- 2. Sebaiknya form Sign Up TIDAK menyediakan pilihan admin.
--    Semua pendaftar otomatis menjadi 'user'.
-- 3. Untuk menjadikan seseorang admin, jalankan manual:
--      UPDATE users SET role = 'admin' WHERE username = 'nama_user';
-- 4. Untuk mengembalikan menjadi user biasa:
--      UPDATE users SET role = 'user' WHERE username = 'nama_user';