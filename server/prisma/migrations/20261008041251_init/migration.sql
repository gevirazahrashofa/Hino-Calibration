-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    `nama_lengkap` VARCHAR(100) NULL,
    `email` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alat_ukur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_alat` VARCHAR(150) NOT NULL,
    `control_number` VARCHAR(80) NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `serial_number` VARCHAR(100) NOT NULL,
    `setting_nm` VARCHAR(50) NULL,
    `range_alat` VARCHAR(100) NULL,
    `akurasi` VARCHAR(100) NULL,
    `process` VARCHAR(100) NOT NULL,
    `status` ENUM('active', 'cancelled') NOT NULL DEFAULT 'active',
    `grp` VARCHAR(100) NOT NULL,
    `line_name` VARCHAR(100) NOT NULL,
    `kode_line` VARCHAR(50) NULL,
    `lokasi` VARCHAR(150) NOT NULL,
    `maker` VARCHAR(100) NULL,
    `master` VARCHAR(100) NULL,
    `no_seri` VARCHAR(100) NULL,
    `tipe` ENUM('torque', 'non-torque') NOT NULL DEFAULT 'torque',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `alat_ukur_control_number_key`(`control_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `riwayat_pembatalan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alat_id` INTEGER NOT NULL,
    `alasan` VARCHAR(255) NULL,
    `dibatalkan_oleh` VARCHAR(100) NULL,
    `tanggal` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengajuan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kategori` ENUM('registration', 'cancellation') NOT NULL,
    `alat_id` INTEGER NULL,
    `tanggal_pengajuan` DATE NULL,
    `maker` VARCHAR(100) NULL,
    `nama_alat` VARCHAR(150) NOT NULL,
    `serial_number` VARCHAR(100) NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `akurasi` VARCHAR(100) NULL,
    `range_alat` VARCHAR(100) NULL,
    `setting` VARCHAR(100) NULL,
    `penggunaan` VARCHAR(150) NULL,
    `penempatan` VARCHAR(150) NULL,
    `kategori_alat` VARCHAR(50) NULL,
    `klasifikasi` VARCHAR(50) NULL,
    `alasan_perubahan` TEXT NULL,
    `dokumen` VARCHAR(255) NULL,
    `ttd_pemohon` LONGTEXT NULL,
    `pemohon` VARCHAR(50) NOT NULL,
    `dept` VARCHAR(100) NULL,
    `kelengkapan` VARCHAR(255) NULL,
    `control_no` VARCHAR(80) NULL,
    `tipe` VARCHAR(20) NULL,
    `grp` VARCHAR(100) NULL,
    `line_name` VARCHAR(100) NULL,
    `kode_line` VARCHAR(50) NULL,
    `catatan` TEXT NULL,
    `ttd_penerima` LONGTEXT NULL,
    `kalibrator` VARCHAR(100) NULL,
    `tanggal_kalibrasi` DATE NULL,
    `judgement` VARCHAR(20) NULL,
    `alasan_ng` TEXT NULL,
    `flow_process` VARCHAR(150) NULL,
    `ttd_diterima_oleh` LONGTEXT NULL,
    `catatan_serah` TEXT NULL,
    `ttd_diserahkan_oleh` LONGTEXT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `reviewed_by` VARCHAR(50) NULL,
    `reviewed_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengaturan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_aplikasi` VARCHAR(100) NOT NULL DEFAULT 'Hino Calibration',
    `versi` VARCHAR(20) NOT NULL DEFAULT '1.0.0',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `riwayat_pembatalan` ADD CONSTRAINT `riwayat_pembatalan_alat_id_fkey` FOREIGN KEY (`alat_id`) REFERENCES `alat_ukur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengajuan` ADD CONSTRAINT `pengajuan_alat_id_fkey` FOREIGN KEY (`alat_id`) REFERENCES `alat_ukur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
