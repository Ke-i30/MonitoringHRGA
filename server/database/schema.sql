CREATE DATABASE IF NOT EXISTS `hrga_request_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hrga_request_db`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `email_logs`;
DROP TABLE IF EXISTS `requisition_attachments`;
DROP TABLE IF EXISTS `requisition_items`;
DROP TABLE IF EXISTS `requisitions`;
DROP TABLE IF EXISTS `assets`;
DROP TABLE IF EXISTS `asset_categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `otp_code` VARCHAR(10) NULL,
  `otp_expires_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `asset_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `assets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `specification` TEXT,
  `stock_quantity` INT DEFAULT 0,
  `unit` VARCHAR(30) NOT NULL DEFAULT 'Pcs',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `requisitions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
  `supervisor_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  `priority_level` VARCHAR(20) NOT NULL DEFAULT 'Medium',
  `status` VARCHAR(30) NOT NULL DEFAULT 'Pending',
  `rejection_reason` TEXT NULL,
  `estimated_completion_at` DATETIME NULL,
  `approved_by` INT NULL,
  `approved_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `requisition_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `requisition_id` INT NOT NULL,
  `asset_id` INT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `specification` TEXT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `urgency_reason` TEXT NULL,
  FOREIGN KEY (`requisition_id`) REFERENCES `requisitions` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `requisition_attachments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `requisition_id` INT NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`requisition_id`) REFERENCES `requisitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `email_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `requisition_id` INT NULL,
  `recipient_email` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `body_content` TEXT NOT NULL,
  `email_type` VARCHAR(50) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'SENT',
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`requisition_id`) REFERENCES `requisitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Master Admin', 'Satu-satunya Admin pengelola sistem penuh (Approval Akun, Stok, Tiket & Divisi)'),
(2, 'Supervisor', 'Peminta barang dari masing-masing divisi/departemen');

INSERT INTO `departments` (`id`, `name`, `code`) VALUES
(1, 'Frontliner', 'FRN'),
(2, 'Sales', 'SLS'),
(3, 'Photography', 'PHT'),
(4, 'Printing', 'PRT'),
(5, 'Keuangan', 'FIN');

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role_id`, `department_id`, `is_active`) VALUES
(1, 'Master Admin HRGA', 'managerlavanilla@gmail.com', '$2b$10$3YmG0o3Zk8Jp0GgJvV6Q7eK7u8n9m0L1k2j3h4g5f6e7d8c9b0a1b', 1, 5, 1),
(2, 'Budi Supervisor Sales', 'spv.sales@company.com', '$2b$10$3YmG0o3Zk8Jp0GgJvV6Q7eK7u8n9m0L1k2j3h4g5f6e7d8c9b0a1b', 2, 2, 1),
(3, 'Siti Supervisor Photography', 'spv.photo@company.com', '$2b$10$3YmG0o3Zk8Jp0GgJvV6Q7eK7u8n9m0L1k2j3h4g5f6e7d8c9b0a1b', 2, 3, 1);

INSERT INTO `asset_categories` (`id`, `name`) VALUES
(1, 'Stasioneri & ATK'),
(2, 'Tinta & Media Cetak'),
(3, 'Peralatan Fotografi'),
(4, 'Fasilitas & Kebersihan'),
(5, 'Perangkat IT & Aksesori');

INSERT INTO `assets` (`category_id`, `name`, `specification`, `stock_quantity`, `unit`) VALUES
(2, 'Tinta Epson 003 Hitam', 'Tinta refill printer Epson L3110 / L3150 Original', 15, 'Botol'),
(2, 'Tinta Epson 003 Cyan', 'Tinta refill printer Epson L3110 / L3150 Cyan Original', 10, 'Botol'),
(1, 'Kertas HVS A4 80gsm', 'PaperOne A4 80 gram 1 Rim', 25, 'Rim'),
(1, 'Pulpen Pilot G2 0.5mm Hitam', 'Pulpen gel hitam Pilot G2 0.5', 50, 'Pcs'),
(3, 'SD Card SanDisk Extreme Pro 128GB', 'Speed up to 200MB/s V30 UHS-I', 4, 'Pcs'),
(4, 'Kertas Foto Glossy A4 260gsm', 'Joyko Photo Paper Premium 20 lembar', 12, 'Pack');
