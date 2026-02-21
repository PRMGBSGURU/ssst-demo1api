# SSST Demo1 API - Express REST API with JWT Authentication

A basic REST API built with Express.js and JWT authentication for secure endpoints.

## Features

- Express.js server
- JWT (JSON Web Token) authentication
- Protected routes with token verification
- Environment-based configuration
- User login with credentials
- Sample protected endpoints

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (edit `.env` file):
```
PORT=3000
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

## Running the Server

### Development (with hot reload using nodemon):
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Health Check
```
GET /
```
Returns API status.

**Response:**
```json
{
  "message": "API is running",
  "version": "1.0.0"
}
```

---

### 2. Login (POST /login)
Authenticate user and receive JWT token.

```
POST /login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Available Test Users:**
- Username: `admin`, Password: `password123`
- Username: `user`, Password: `user123`

**Response (Success):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

**Response (Error):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Protected Route
```
GET /protected
Authorization: Bearer <token>
```

Requires valid JWT token in Authorization header.

**Response:**
```json
{
  "message": "Access granted to protected resource",
  "user": {
    "id": 1,
    "username": "admin",
    "iat": 1629842400,
    "exp": 1629846000
  }
}
```

---

### 4. Get User Profile (Protected)
```
GET /profile
Authorization: Bearer <token>
```

Requires valid JWT token.

**Response:**
```json
{
  "message": "User profile",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

---

## Usage Examples

### Using cURL:

**1. Login:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

**2. Access Protected Route:**
```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman:

1. **POST /login**
   - Set method to POST
   - URL: `http://localhost:3000/login`
   - Body (JSON): `{ "username": "admin", "password": "password123" }`
   - Copy the `token` from response

2. **GET /protected**
   - Set method to GET
   - URL: `http://localhost:3000/protected`
   - Headers: Add `Authorization: Bearer <token>`

### Using JavaScript (Fetch API):

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'password123' })
});

const { token } = await loginResponse.json();

// Access protected route
const protectedResponse = await fetch('http://localhost:3000/protected', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await protectedResponse.json();
console.log(data);
```

## JWT Token Details

- **Algorithm:** HS256 (HMAC SHA-256)
- **Expiration:** 1 hour
- **Payload:** Contains user ID and username
- **Format in Header:** `Authorization: Bearer <token>`

## Token Validation

The API validates tokens by checking:
1. Token presence in Authorization header
2. Token format (Bearer scheme)
3. Token signature (using JWT_SECRET)
4. Token expiration time

## Error Responses

| Status | Message | Reason |
|--------|---------|--------|
| 400 | Username and password are required | Missing credentials |
| 401 | Invalid credentials | Wrong username/password |
| 401 | Invalid or expired token | Token is malformed or expired |
| 403 | No token provided | Missing Authorization header |
| 404 | Route not found | Invalid endpoint |
| 500 | Internal server error | Server error |

## Project Structure

```
ssst-demo1api/
├── index.js              # Main application file
├── package.json          # Project dependencies and scripts
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Security Considerations

⚠️ **Important for Production:**

1. **Change JWT Secret:** Update `JWT_SECRET` in `.env` to a strong, random value
2. **Use Environment Variables:** Never commit secrets to version control
3. **HTTPS:** Always use HTTPS in production
4. **Password Hashing:** In production, hash passwords using bcrypt
5. **Database:** Replace sample user array with real database (MongoDB, PostgreSQL, etc.)
6. **Rate Limiting:** Implement rate limiting to prevent brute-force attacks
7. **Input Validation:** Validate and sanitize all inputs
8. **CORS:** Configure CORS appropriately for your frontend domain

## Development Tips

- The API logs startup information with test endpoints
- Token expires after 1 hour by default (configurable in code)
- Sample users are hardcoded for demo purposes only
- All errors are returned as JSON responses

## License

ISC

## Author

PRMGBSGURU
