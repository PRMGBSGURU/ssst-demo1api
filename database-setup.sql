-- SQL Script to setup database and Users table for SSST Demo1 API
-- Run this script in MySQL to create the required database and table

-- Create Database
CREATE DATABASE IF NOT EXISTS `ssst-demo1`;

-- Use the database
USE `ssst-demo1`;

-- Create Users Table
CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ID` INT,
  `Surname` VARCHAR(100),
  `LastName` VARCHAR(100),
  `Gender` VARCHAR(20),
  `EmailID` VARCHAR(255) UNIQUE NOT NULL,
  `Password` VARCHAR(255) NOT NULL,
  `MobileNumber` VARCHAR(20),
  `WhatsAppNumber` VARCHAR(20),
  `SSSTID` VARCHAR(20) UNIQUE,
  `FirstName` VARCHAR(100),
  `UserName` VARCHAR(100),
  `Status` VARCHAR(50) DEFAULT 'active',
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (EmailID),
  INDEX idx_ssstid (SSSTID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Insert Sample Data (plain text passwords for testing)
INSERT INTO `Users` (`EmailID`, `Password`, `FirstName`, `LastName`, `UserName`, `Status`) VALUES
('admin@example.com', 'admin123', 'Admin', 'User', 'admin', 'active'),
('user@example.com', 'user123', 'Regular', 'User', 'user', 'active'),
('test@example.com', 'test123', 'Test', 'Account', 'testuser', 'active');

-- Display the Users table
SELECT * FROM `Users`;

-- Display the qrcode_reference table structure
DESCRIBE `qrcode_reference`;
