-- SQL Script to update existing Users table with new columns for user registration feature
-- Run this script if you already have the Users table but need to add the new columns

USE `ssst-demo1`;

-- Add new columns if they don't exist
ALTER TABLE `Users` ADD COLUMN IF NOT EXISTS `Surname` VARCHAR(100);
ALTER TABLE `Users` ADD COLUMN IF NOT EXISTS `MobileNumber` VARCHAR(20);
ALTER TABLE `Users` ADD COLUMN IF NOT EXISTS `WhatsAppNumber` VARCHAR(20);
ALTER TABLE `Users` ADD COLUMN IF NOT EXISTS `SSSTID` VARCHAR(20) UNIQUE;

-- Add indexes for better query performance
ALTER TABLE `Users` ADD INDEX IF NOT EXISTS idx_ssstid (SSSTID);

-- Display the updated table structure
DESCRIBE `Users`;

-- Verify the changes
SELECT * FROM `Users`;
