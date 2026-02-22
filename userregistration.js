const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const router = express.Router();

/**
 * POST /newregistration - User registration endpoint with MySQL database insertion
 * 
 * Request Body:
 * {
 *   "surname": "Doe",
 *   "lastname": "John",
 *   "emailid": "john.doe@example.com",
 *   "mobilenumber": "+911234567890",
 *   "whatsappnumber": "+911234567890",
 *   "password": "securePassword123"
 * }
 * 
 * Response Success (201):
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "user": {
 *     "ssstid": "SSST123456",
 *     "emailid": "john.doe@example.com",
 *     "surname": "Doe",
 *     "lastname": "John"
 *   }
 * }
 * 
 * Response Error (400/409/500):
 * {
 *   "success": false,
 *   "message": "Error description"
 * }
 */
router.post('/newregistration', async (req, res) => {
  const { surname, lastname, emailid, mobilenumber, whatsappnumber, password } = req.body;

  // Validate input
  if (!surname || !lastname || !emailid || !password || !mobilenumber || !whatsappnumber) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: surname, lastname, emailid, mobilenumber, whatsappnumber, password'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailid)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Validate mobile and whatsapp numbers
  const phoneRegex = /^\+\d{12}$/;
  if (!phoneRegex.test(mobilenumber) || !phoneRegex.test(whatsappnumber)) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number and WhatsApp number must be in format +[12 digits] (e.g., +911234567890)'
    });
  }

  try {
    // Generate unique SSSTID (SSST + 6-digit random number from 100001 to 999999)
    let ssstid = '';
    let isUnique = false;
    
    while (!isUnique) {
      // Generate random number between 100001 and 999999
      const randomNumber = Math.floor(Math.random() * (999999 - 100001 + 1)) + 100001;
      ssstid = `SSST${randomNumber}`;
      
      // Check if SSSTID already exists
      const [existingSSTID] = await pool.query(
        'SELECT SSSTID FROM Users WHERE SSSTID = ?',
        [ssstid]
      );
      
      if (existingSSTID.length === 0) {
        isUnique = true;
      }
    }

    // Hash password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const [result] = await pool.query(
      'INSERT INTO Users (Surname, LastName, EmailID, MobileNumber, WhatsAppNumber, SSSTID, Password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [surname, lastname, emailid, mobilenumber, whatsappnumber, ssstid, hashedPassword]
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        ssstid: ssstid,
        emailid: emailid,
        surname: surname,
        lastname: lastname,
        mobilenumber: mobilenumber,
        whatsappnumber: whatsappnumber
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('EmailID')) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Handle duplicate SSSTID error (should rarely happen)
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('SSSTID')) {
      return res.status(409).json({
        success: false,
        message: 'Registration failed, please try again'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

module.exports = router;
