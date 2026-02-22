const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /userlogin - Database login endpoint with MySQL validation
 * 
 * Request Body:
 * {
 *   "emailid": "user@example.com",
 *   "password": "user123"
 * }
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "token": "JWT_TOKEN_HERE",
 *   "user": {
 *     "emailid": "user@example.com",
 *     "username": "Regular User"
 *   }
 * }
 * 
 * Response Error (401/400/500):
 * {
 *   "success": false,
 *   "message": "Error description"
 * }
 */
router.post('/userlogin', async (req, res) => {
  const { emailid, password } = req.body;

  // Validate input
  if (!emailid || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'EmailID and password are required' 
    });
  }

  try {
    // Query database for user
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE EmailID = ?',
      [emailid]
    );

    // Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const user = rows[0];

    // Compare password (with bcrypt if hashed, or plain text for demo)
    let passwordMatch = false;
    
    // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (user.Password && user.Password.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, user.Password);
    } else {
      // Plain text comparison (not recommended for production)
      passwordMatch = password === user.Password;
    }

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id || user.ID, 
        emailid: user.EmailID,
        username: user.FirstName || user.LastName || user.UserName || 'User'
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        emailid: user.EmailID,
        username: user.FirstName || user.LastName || user.UserName || 'User'
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
