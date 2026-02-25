const express = require('express');
const QRCode = require('qrcode');
const pool = require('./db');

const router = express.Router();

/**
 * POST /createqrcode - Generate QR code and save to database
 * 
 * Request Body:
 * {
 *   "mobilenumber": "+911234567890",
 *   "ssstid": "SSST123456"
 * }
 * 
 * Response Success (201):
 * {
 *   "success": true,
 *   "message": "QR code created and saved successfully",
 *   "data": {
 *     "ssstid": "SSST123456",
 *     "mobilenumber": "+911234567890",
 *     "qrCodeData": "data:image/png;base64,iVBORw0KGgo...",
 *     "qrCodeId": 1,
 *     "createdAt": "2026-02-25T10:30:45.123Z"
 *   }
 * }
 * 
 * Response Error (400/500):
 * {
 *   "success": false,
 *   "message": "Error description"
 * }
 */
router.post('/createqrcode', async (req, res) => {
  const { mobilenumber, ssstid } = req.body;

  // Validate input
  if (!mobilenumber || !ssstid) {
    return res.status(400).json({
      success: false,
      message: 'Both mobilenumber and ssstid are required'
    });
  }

  // Validate mobile number format
  const phoneRegex = /^\+\d{12}$/;
  if (!phoneRegex.test(mobilenumber)) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number must be in format +[12 digits] (e.g., +911234567890)'
    });
  }

  // Validate SSSTID format
  if (!/^SSST\d{6}$/.test(ssstid)) {
    return res.status(400).json({
      success: false,
      message: 'SSSTID must be in format SSST followed by 6 digits (e.g., SSST123456)'
    });
  }

  try {
    // Generate QR code data with combined information
    const qrCodeContent = `SSSTID:${ssstid}|MobileNumber:${mobilenumber}`;
    
    // Generate QR code as Data URL (Base64)
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeContent);

    // Insert QR code reference into database
    const [result] = await pool.query(
      'INSERT INTO qrcode_reference (SSSTID, MobileNumber, QRCodeData) VALUES (?, ?, ?)',
      [ssstid, mobilenumber, qrCodeDataUrl]
    );

    // Return success response with QR code data
    res.status(201).json({
      success: true,
      message: 'QR code created and saved successfully',
      data: {
        qrCodeId: result.insertId,
        ssstid: ssstid,
        mobilenumber: mobilenumber,
        qrCodeData: qrCodeDataUrl,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('QR Code Generation error:', error);

    // Handle duplicate SSSTID in qrcode table
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('SSSTID')) {
      return res.status(409).json({
        success: false,
        message: 'QR code already exists for this SSSTID'
      });
    }

    // Handle table not found error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        success: false,
        message: 'Database table "qrcode_reference" not found. Please run database setup script.',
        hint: 'Execute database-setup.sql or database-update-qrcode.sql'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during QR code generation',
      error: error.message
    });
  }
});

/**
 * GET /qrcode/:ssstid - Retrieve QR code for a specific SSSTID
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "message": "QR code retrieved successfully",
 *   "data": {
 *     "qrCodeId": 1,
 *     "ssstid": "SSST123456",
 *     "mobilenumber": "+911234567890",
 *     "qrCodeData": "data:image/png;base64,iVBORw0KGgo...",
 *     "createdAt": "2026-02-25T10:30:45.123Z"
 *   }
 * }
 * 
 * Response Error (404/500):
 * {
 *   "success": false,
 *   "message": "Error description"
 * }
 */
router.get('/qrcode/:ssstid', async (req, res) => {
  const { ssstid } = req.params;

  // Validate SSSTID format
  if (!/^SSST\d{6}$/.test(ssstid)) {
    return res.status(400).json({
      success: false,
      message: 'SSSTID must be in format SSST followed by 6 digits (e.g., SSST123456)'
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, SSSTID, MobileNumber, QRCodeData, CreatedAt FROM qrcode_reference WHERE SSSTID = ?',
      [ssstid]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found for the given SSSTID'
      });
    }

    const qrData = rows[0];
    res.json({
      success: true,
      message: 'QR code retrieved successfully',
      data: {
        qrCodeId: qrData.id,
        ssstid: qrData.SSSTID,
        mobilenumber: qrData.MobileNumber,
        qrCodeData: qrData.QRCodeData,
        createdAt: new Date(qrData.CreatedAt).toISOString()
      }
    });

  } catch (error) {
    console.error('QR Code retrieval error:', error);

    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        success: false,
        message: 'Database table "qrcode_reference" not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error retrieving QR code',
      error: error.message
    });
  }
});

/**
 * DELETE /qrcode/:ssstid - Delete QR code for a specific SSSTID
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "message": "QR code deleted successfully",
 *   "data": {
 *     "ssstid": "SSST123456",
 *     "deletedAt": "2026-02-25T10:30:45.123Z"
 *   }
 * }
 */
router.delete('/qrcode/:ssstid', async (req, res) => {
  const { ssstid } = req.params;

  // Validate SSSTID format
  if (!/^SSST\d{6}$/.test(ssstid)) {
    return res.status(400).json({
      success: false,
      message: 'SSSTID must be in format SSST followed by 6 digits (e.g., SSST123456)'
    });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM qrcode_reference WHERE SSSTID = ?',
      [ssstid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found for the given SSSTID'
      });
    }

    res.json({
      success: true,
      message: 'QR code deleted successfully',
      data: {
        ssstid: ssstid,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('QR Code deletion error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error deleting QR code',
      error: error.message
    });
  }
});

module.exports = router;
