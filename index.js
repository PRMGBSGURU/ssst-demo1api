require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const userloginRouter = require('./userlogin');
const userregistrationRouter = require('./userregistration');
const createqrcodeRouter = require('./createqrcode');
const sessionManager = require('./sessionManager');
const { SECRET_KEY } = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Middleware to extract IP address
app.use((req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  next();
});

// Mount userlogin routes (isolated endpoint)
app.use('/', userloginRouter);

// Mount userregistration routes (isolated endpoint)
app.use('/', userregistrationRouter);

// Mount isolated QR code creation endpoint
app.use('/', createqrcodeRouter);

// Sample user database (in production, use a real database)
const users = [
  { id: 1, username: 'admin', password: 'password123' },
  { id: 2, username: 'user', password: 'user123' }
];

// JWT Verification Middleware with Session Validation
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ 
      success: false,
      message: 'No token provided' 
    });
  }

  // Token format: "Bearer <token>"
  const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

  jwt.verify(tokenWithoutBearer, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
    
    // Validate session exists and is active
    const session = sessionManager.validateSession(tokenWithoutBearer);
    if (!session) {
      return res.status(401).json({ 
        success: false,
        message: 'Session expired or not found. Please login again.' 
      });
    }

    req.user = decoded;
    req.token = tokenWithoutBearer;
    req.session = session;
    next();
  });
};

// Middleware to update session activity on each request
const updateSessionActivity = (req, res, next) => {
  if (req.token) {
    sessionManager.updateActivity(req.token);
  }
  next();
};

// POST /login - User login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Username and password are required' 
    });
  }

  // Find user
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid credentials' 
    });
  }

  // Generate JWT token (expires in 1 hour)
  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  // Create session
  const session = sessionManager.createSession(
    token,
    { id: user.id, emailid: username, username: user.username },
    req.clientIp
  );

  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    sessionId: session.sessionId,
    user: { id: user.id, username: user.username }
  });
});

/**
 * POST /logout - Logout endpoint with session invalidation
 * 
 * Headers Required:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "message": "Logout successful",
 *   "data": {
 *     "sessionId": "sess_...",
 *     "userId": 1,
 *     "emailid": "user@example.com",
 *     "username": "admin",
 *     "logoutTime": "2026-02-23T10:30:45.123Z",
 *     "sessionDuration": 1200
 *   }
 * }
 * 
 * Response Error (401/403):
 * {
 *   "success": false,
 *   "message": "Error description"
 * }
 */
app.post('/logout', verifyToken, updateSessionActivity, (req, res) => {
  const token = req.token;

  // Logout the session
  const result = sessionManager.logout(token);

  if (result.success) {
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: result.data
    });
  } else {
    return res.status(401).json({
      success: false,
      message: result.message
    });
  }
});

/**
 * GET /session-status - Get current session status
 * Useful to check if session is still active and inactivity time
 */
app.get('/session-status', verifyToken, updateSessionActivity, (req, res) => {
  const session = req.session;
  const inactivityMs = Date.now() - session.lastActivityAt;
  const inactivityMinutes = Math.round(inactivityMs / 60000);
  const remainingMinutes = 15 - inactivityMinutes;

  res.json({
    success: true,
    message: 'Session is active',
    sessionStatus: {
      sessionId: session.sessionId,
      userId: session.userId,
      emailid: session.emailid,
      username: session.username,
      isActive: session.isActive,
      createdAt: new Date(session.createdAt).toISOString(),
      lastActivityAt: new Date(session.lastActivityAt).toISOString(),
      inactivityMinutes: inactivityMinutes,
      remainingMinutesBeforeLogout: Math.max(remainingMinutes, 0),
      timeoutMinutes: 15
    }
  });
});

/**
 * GET /sessions - Get all active sessions (Admin endpoint)
 * Shows all currently active sessions in the system
 */
app.get('/sessions', verifyToken, updateSessionActivity, (req, res) => {
  const sessions = sessionManager.getAllActiveSessions();
  const stats = sessionManager.getStats();

  res.json({
    success: true,
    message: 'Active sessions retrieved',
    statistics: stats,
    sessions: sessions
  });
});

/**
 * POST /logout-all - Logout all sessions for the current user
 * Useful when user suspects unauthorized access
 */
app.post('/logout-all', verifyToken, updateSessionActivity, (req, res) => {
  const userId = req.user.id;
  const result = sessionManager.logoutAllUserSessions(userId);

  res.json({
    success: true,
    message: result.message,
    count: result.count
  });
});

/**
 * POST /validate-token - Debug endpoint to validate token and session
 * Helps diagnose token/session issues
 * 
 * Request:
 * POST /validate-token
 * Authorization: Bearer <token>
 * 
 * Response: Shows token validation details
 */
app.post('/validate-token', (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'No token provided',
      hint: 'Send token in Authorization header: Bearer <token>'
    });
  }

  const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

  // Check JWT validity
  jwt.verify(tokenWithoutBearer, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'JWT Verification Failed',
        error: err.message,
        hint: 'Make sure token was copied correctly and SECRET_KEY matches',
        tokenFormat: {
          received: `${token.substring(0, 20)}...${token.substring(token.length - 10)}`,
          expectedFormat: 'Bearer <jwt_token>',
          bearerPrefix: token.startsWith('Bearer ') ? 'YES' : 'NO'
        }
      });
    }

    // Check session validity
    const session = sessionManager.validateSession(tokenWithoutBearer);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session Validation Failed',
        hint: 'Session not found. You may need to login again.',
        decodedToken: {
          id: decoded.id,
          emailid: decoded.emailid,
          username: decoded.username,
          iat: new Date(decoded.iat * 1000).toISOString(),
          exp: new Date(decoded.exp * 1000).toISOString()
        }
      });
    }

    // All checks passed
    res.json({
      success: true,
      message: 'Token and session are valid',
      tokenValid: true,
      sessionValid: true,
      decodedToken: {
        id: decoded.id,
        emailid: decoded.emailid,
        username: decoded.username,
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      },
      sessionDetails: {
        sessionId: session.sessionId,
        userId: session.userId,
        emailid: session.emailid,
        username: session.username,
        createdAt: new Date(session.createdAt).toISOString(),
        lastActivityAt: new Date(session.lastActivityAt).toISOString(),
        inactivityMinutes: Math.round((Date.now() - session.lastActivityAt) / 60000)
      }
    });
  });
});

// GET /protected - Protected route example
app.get('/protected', verifyToken, updateSessionActivity, (req, res) => {
  res.json({
    success: true,
    message: 'Access granted to protected resource',
    user: req.user,
    sessionId: req.session.sessionId
  });
});

// GET /profile - Get user profile (protected)
app.get('/profile', verifyToken, updateSessionActivity, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  res.json({
    success: true,
    message: 'User profile',
    user: { id: user.id, username: user.username },
    sessionId: req.session.sessionId
  });
});

// GET / - Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running', version: '1.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║                 API Server Started                        ║`);
  console.log(`║              http://localhost:${PORT}${' '.repeat(34-PORT.toString().length)}║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);
  
  console.log(`📋 Available Endpoints:\n`);
  
  console.log(`🔓 Authentication:`);
  console.log(`   POST   /login                   - Login and create session`);
  console.log(`   POST   /logout                  - Logout current session`);
  console.log(`   POST   /logout-all              - Logout all user sessions\n`);
  
  console.log(`✅ Protected Routes (Requires Token):`);
  console.log(`   GET    /protected               - Access protected resource`);
  console.log(`   GET    /profile                 - Get user profile`);
  console.log(`   GET    /session-status          - Check session status & inactivity`);
  console.log(`   GET    /sessions                - Get all active sessions\n`);
  
  console.log(`🔄 Other:`);
  console.log(`   GET    /userlogin               - Database user login`);
  console.log(`   POST   /newregistration         - Register new user`);
  console.log(`   POST   /createqrcode            - Create QR code (Isolated API)`);
  console.log(`                                    Inputs: mobilenumber, ssstid\n`);
  
  console.log(`⏱️  Session Configuration:`);
  console.log(`   • Inactivity Timeout: 15 minutes`);
  console.log(`   • Automatic Cleanup: Every 5 minutes\n`);
  
  console.log(`📝 Test Examples:\n`);
  
  console.log(`1️⃣  Login:`);
  console.log(`    POST http://localhost:${PORT}/login`);
  console.log(`    Body: { "username": "admin", "password": "password123" }\n`);
  
  console.log(`2️⃣  Check Session Status:`);
  console.log(`    GET http://localhost:${PORT}/session-status`);
  console.log(`    Header: Authorization: Bearer <token>\n`);
  
  console.log(`3️⃣  Logout:`);
  console.log(`    POST http://localhost:${PORT}/logout`);
  console.log(`    Header: Authorization: Bearer <token>\n`);
  
  console.log(`4️⃣  View All Active Sessions:`);
  console.log(`    GET http://localhost:${PORT}/sessions`);
  console.log(`    Header: Authorization: Bearer <token>\n`);
});
