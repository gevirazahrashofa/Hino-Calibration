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

CREATE TABLE IF NOT EXISTS alat_ukur (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nama_alat      VARCHAR(150) NOT NULL,
  control_number VARCHAR(80)  NOT NULL UNIQUE,
  model          VARCHAR(100) NOT NULL,
  serial_number  VARCHAR(100) NOT NULL,
  setting_nm     VARCHAR(50),
  range_alat     VARCHAR(100),
  akurasi        VARCHAR(100),
  process        VARCHAR(100) NOT NULL,
  status         ENUM('active','cancelled') NOT NULL DEFAULT 'active',
  grp            VARCHAR(100) NOT NULL,   -- group master list
  line_name      VARCHAR(100) NOT NULL,
  kode_line      VARCHAR(50),
  lokasi         VARCHAR(150) NOT NULL,   -- lokasi / area
  maker          VARCHAR(100),            -- pembuat
  master         VARCHAR(100),
  no_seri        VARCHAR(100),
  tipe           ENUM('torque','non-torque') NOT NULL DEFAULT 'torque',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS riwayat_pembatalan (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  alat_id     INT NOT NULL,
  alasan      VARCHAR(255),
  dibatalkan_oleh VARCHAR(100),
  tanggal     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alat_id) REFERENCES alat_ukur(id)
);
