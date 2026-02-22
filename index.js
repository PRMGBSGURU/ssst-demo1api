require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const userloginRouter = require('./userlogin');
const userregistrationRouter = require('./userregistration');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(express.json());

// Mount userlogin routes (isolated endpoint)
app.use('/', userloginRouter);

// Mount userregistration routes (isolated endpoint)
app.use('/', userregistrationRouter);

// Sample user database (in production, use a real database)
const users = [
  { id: 1, username: 'admin', password: 'password123' },
  { id: 2, username: 'user', password: 'user123' }
];

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // Token format: "Bearer <token>"
  const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

  jwt.verify(tokenWithoutBearer, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// POST /login - User login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Find user
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token (expires in 1 hour)
  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  res.json({
    message: 'Login successful',
    token: token,
    user: { id: user.id, username: user.username }
  });
});

// GET /protected - Protected route example
app.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'Access granted to protected resource',
    user: req.user
  });
});

// GET /profile - Get user profile (protected)
app.get('/profile', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  res.json({
    message: 'User profile',
    user: { id: user.id, username: user.username }
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
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`\nTest the API:`);
  console.log(`\n1. Login:`);
  console.log(`   POST http://localhost:${PORT}/login`);
  console.log(`   Body: { "username": "admin", "password": "password123" }`);
  console.log(`\n2. Access protected route:`);
  console.log(`   GET http://localhost:${PORT}/protected`);
  console.log(`   Header: Authorization: Bearer <token>`);
});
