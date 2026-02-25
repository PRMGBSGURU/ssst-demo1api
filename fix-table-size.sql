USE `ssst-demo1`;

-- Add MobileNumber column if it doesn't exist (nullable)
ALTER TABLE qrcode_reference ADD COLUMN IF NOT EXISTS MobileNumber VARCHAR(20);

-- Modify QRCodeData column to MEDIUMTEXT to support larger QR code data
ALTER TABLE qrcode_reference MODIFY COLUMN QRCodeData MEDIUMTEXT NOT NULL;

-- Verify the changes
DESCRIBE qrcode_reference;

SELECT * FROM qrcode_reference;
