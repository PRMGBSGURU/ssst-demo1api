-- SQL Script to create qrcode_reference table for QR Code functionality
-- Run this script in MySQL to create the required qrcode_reference table

USE `ssst-demo1`;

-- Create qrcode_reference Table
CREATE TABLE IF NOT EXISTS `qrcode_reference` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `SSSTID` VARCHAR(20) UNIQUE NOT NULL,
  `MobileNumber` VARCHAR(20),
  `QRCodeData` MEDIUMTEXT NOT NULL,
  `Status` VARCHAR(50) DEFAULT 'active',
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ssstid (SSSTID),
  INDEX idx_mobilenumber (MobileNumber),
  FOREIGN KEY (SSSTID) REFERENCES Users(SSSTID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Display the table structure
DESCRIBE `qrcode_reference`;

-- Verify the table creation
SELECT * FROM `qrcode_reference`;
