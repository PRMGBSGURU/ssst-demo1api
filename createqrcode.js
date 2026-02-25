const express = require('express');
const QRCode = require('qrcode');
const pool = require('./db');

const router = express.Router();

/**
 * POST /createqrcode - Isolated API to generate QR code using only SSSTID
 * 
 * This is a standalone, isolated endpoint that handles ONLY QR code creation.
 * It requires:
 * - ssstid: SSST ID in format SSST followed by 6 digits
 * 
 * The QR code encodes only the SSSTID.
 * 
 * Request Body:
 * {
 *   "ssstid": "SSST123456"
 * }
 * 
 * Response Success (201):
 * {
 *   "success": true,
 *   "message": "QR code created and saved successfully",
 *   "data": {
 *     "ssstid": "SSST123456",
 *     "qrCodeData": "data:image/png;base64,iVBORw0KGgo...",
 *     "qrCodeId": 1,
 *     "createdAt": "2026-02-25T10:30:45.123Z"
 *   }
 * }
 * 
 * Response Error (400/409/500):
 * {
 *   "success": false,
 *   "message": "Error description"
 * }
 */
router.post('/createqrcode', async (req, res) => {
  const { ssstid } = req.body;

  // Validate input - SSSTID is required
  if (!ssstid) {
    return res.status(400).json({
      success: false,
      message: 'SSSTID is required',
      required_fields: {
        ssstid: 'SSST[6 digits] (e.g., SSST123456)'
      }
    });
  }

  // Validate SSSTID format: SSST[6 digits]
  if (!/^SSST\d{6}$/.test(ssstid)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid SSSTID format',
      expected_format: 'SSST followed by 6 digits (e.g., SSST123456)',
      received: ssstid
    });
  }

  try {
    // Generate QR code content with SSSTID only
    const qrCodeContent = ssstid;
    
    // Generate QR code as Data URL (Base64 encoded PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeContent);

    // Insert QR code reference into database
    const [result] = await pool.query(
      'INSERT INTO qrcode_reference (SSSTID, QRCodeData) VALUES (?, ?)',
      [ssstid, qrCodeDataUrl]
    );

    // Return success response with QR code data
    res.status(201).json({
      success: true,
      message: 'QR code created and saved successfully',
      data: {
        qrCodeId: result.insertId,
        ssstid: ssstid,
        qrCodeData: qrCodeDataUrl,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('QR Code Generation error:', error);

    // Handle duplicate SSSTID error
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('SSSTID')) {
      return res.status(409).json({
        success: false,
        message: 'QR code already exists for this SSSTID',
        ssstid: ssstid
      });
    }

    // Handle table not found error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        success: false,
        message: 'Database table "qrcode_reference" not found. Please ensure database is properly initialized.',
        setup_steps: [
          'Run: mysql -u root -p ssst-demo1 < database-setup.sql',
          'Or run: mysql -u root -p ssst-demo1 < database-update-qrcode.sql'
        ]
      });
    }

    // Handle data too long error
    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(500).json({
        success: false,
        message: 'QR code data is too large for the database column',
        fix: 'Run: ALTER TABLE qrcode_reference MODIFY COLUMN QRCodeData MEDIUMTEXT NOT NULL;'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Server error during QR code generation',
      error: error.message
    });
  }
});

module.exports = router;
