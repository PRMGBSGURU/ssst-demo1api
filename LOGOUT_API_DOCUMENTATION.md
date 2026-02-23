# Session Management & Logout API Documentation

## Overview

This API implements a robust session management system with automatic inactivity-based logout after **15 minutes** of no user activity. The system tracks all active sessions and provides endpoints to manage user sessions.

---

## Key Features

✅ **Session Tracking**: Every login creates a unique session with timestamp tracking
✅ **Inactivity Timeout**: Users are automatically logged out after 15 minutes of inactivity
✅ **Activity Updates**: Session activity is updated on every API request
✅ **Automatic Cleanup**: Background process removes inactive sessions every 5 minutes
✅ **Session Status**: Users can check their current session status
✅ **Multi-Session Management**: Users can logout all their sessions at once
✅ **Session Analytics**: Admin can view all active sessions in the system

---

## Endpoints

### 1. POST /logout - Logout Current Session

**Description**: Invalidates the current user session and logs out the user.

**Authentication**: Required (Bearer Token)

**Request**:
```http
POST /logout HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "sessionId": "sess_1708689045123_a1b2c3d4e",
    "userId": 1,
    "emailid": "admin",
    "username": "admin",
    "logoutTime": "2026-02-23T10:30:45.123Z",
    "sessionDuration": 1200
  }
}
```

**Response (Error - 401)**:
```json
{
  "success": false,
  "message": "Session expired or not found. Please login again."
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

### 2. POST /login - Create New Session

**Description**: Authenticates user and creates a new session with activity tracking.

**Authentication**: Not required

**Request**:
```http
POST /login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "sess_1708689045123_a1b2c3d4e",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

---

### 3. GET /session-status - Check Session Status

**Description**: Returns current session status including inactivity time and remaining time before auto-logout.

**Authentication**: Required (Bearer Token)

**Request**:
```http
GET /session-status HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Session is active",
  "sessionStatus": {
    "sessionId": "sess_1708689045123_a1b2c3d4e",
    "userId": 1,
    "emailid": "admin",
    "username": "admin",
    "isActive": true,
    "createdAt": "2026-02-23T10:15:45.123Z",
    "lastActivityAt": "2026-02-23T10:25:30.456Z",
    "inactivityMinutes": 5,
    "remainingMinutesBeforeLogout": 10,
    "timeoutMinutes": 15
  }
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/session-status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4. GET /sessions - Get All Active Sessions (Admin)

**Description**: Returns all currently active sessions in the system (useful for admin/monitoring).

**Authentication**: Required (Bearer Token)

**Request**:
```http
GET /sessions HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Active sessions retrieved",
  "statistics": {
    "activeSessionsCount": 3,
    "totalSessionsCount": 5,
    "inactivityTimeoutMinutes": 15
  },
  "sessions": [
    {
      "sessionId": "sess_1708689045123_a1b2c3d4e",
      "userId": 1,
      "emailid": "admin",
      "username": "admin",
      "createdAt": "2026-02-23T10:15:45.123Z",
      "lastActivityAt": "2026-02-23T10:25:30.456Z",
      "inactivityMinutes": 5,
      "ipAddress": "127.0.0.1"
    },
    {
      "sessionId": "sess_1708689046234_b2c3d4e5f",
      "userId": 2,
      "emailid": "user",
      "username": "user",
      "createdAt": "2026-02-23T10:20:00.000Z",
      "lastActivityAt": "2026-02-23T10:27:15.789Z",
      "inactivityMinutes": 3,
      "ipAddress": "192.168.1.100"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/sessions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 5. POST /logout-all - Logout All User Sessions

**Description**: Invalidates all active sessions for the current user (useful when user suspects unauthorized access).

**Authentication**: Required (Bearer Token)

**Request**:
```http
POST /logout-all HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "2 session(s) logged out",
  "count": 2
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/logout-all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## Session Inactivity Timeout Details

### How It Works

1. **Session Creation**: When a user logs in via `/login`, a new session is created with a unique `sessionId`
2. **Activity Tracking**: Every API request updates the `lastActivityAt` timestamp
3. **Inactivity Detection**: The system checks if `(Now - lastActivityAt) > 15 minutes`
4. **Auto-Logout**: Inactive sessions are automatically removed from memory
5. **Cleanup Process**: Background process runs every 5 minutes to clean up expired sessions

### Configuration

```javascript
INACTIVITY_TIMEOUT = 15 * 60 * 1000  // 15 minutes in milliseconds
CLEANUP_INTERVAL = 5 * 60 * 1000     // Check every 5 minutes
```

### Timeline Example

```
10:00:00 - User logs in → Session created
10:05:00 - User makes API call → lastActivityAt = 10:05:00
10:10:00 - User makes API call → lastActivityAt = 10:10:00
10:15:00 - No activity for 5 minutes, but session is still active
10:20:00 - No activity, cleanup job runs → Still valid (10 min inactivity)
10:25:01 - No activity for 15 minutes EXACTLY → Session auto-logged out
```

---

## Session Data Structure

```javascript
{
  sessionId: "sess_1708689045123_a1b2c3d4e",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  userId: 1,
  emailid: "user@example.com",
  username: "John Doe",
  createdAt: 1708689045123,              // Timestamp in milliseconds
  lastActivityAt: 1708689330456,         // Timestamp in milliseconds
  ipAddress: "192.168.1.100",
  isActive: true                          // false after logout
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Username and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Session expired or not found. Please login again."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

## Integration with Protected Routes

All protected routes automatically update session activity:

```javascript
// These routes update session activity on each request:
GET /protected
GET /profile
GET /session-status
GET /sessions
POST /logout
POST /logout-all
```

---

## Testing Workflow

### Step 1: Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

Save the `token` from response.

### Step 2: Use Protected Resource
```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Check Session Status
```bash
curl -X GET http://localhost:3000/session-status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 4: Logout
```bash
curl -X POST http://localhost:3000/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Step 5: Try Using Expired Token (Should Fail)
```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Best Practices

1. **Always Send Token in Header**: Use `Authorization: Bearer <token>` format
2. **Check Session Status**: Periodically call `/session-status` to monitor inactivity
3. **Use Activity Calls**: Make API calls regularly to refresh session
4. **Implement Frontend Warnings**: Warn users when approaching 15-minute timeout
5. **Logout on Navigation Away**: Call `/logout` when user closes browser/app
6. **Monitor Active Sessions**: Use `/sessions` endpoint to audit active sessions

---

## Security Considerations

- Session tokens are stored in memory (volatile)
- Sessions are validated on every API request
- IP address is captured for debugging/audit purposes
- Expired/inactive sessions are automatically cleaned up
- No explicit password reset required; user must login again after logout

---

## Troubleshooting

### Issue: "Session not found" error after login
- **Cause**: Session was expired due to inactivity
- **Solution**: Login again to create a new session

### Issue: Token is valid but session is not found
- **Cause**: System was restarted, clearing in-memory sessions
- **Solution**: Login again

### Issue: Sessions are not being cleaned up
- **Cause**: Cleanup interval is set to 5 minutes
- **Solution**: Wait at most 5 minutes for inactive sessions to be removed

---

## Future Enhancements

- [ ] Persistent session storage (Database/Redis)
- [ ] Session encryption
- [ ] Device-specific session tracking
- [ ] Geo-location tracking
- [ ] Session history/audit logs
- [ ] Two-factor authentication
- [ ] Session expiration notifications
- [ ] Configurable timeout duration

---

**Version**: 1.0.0  
**Last Updated**: February 23, 2026
