# Logout API Implementation Summary

## ✅ Implementation Complete

A comprehensive session management system with automatic inactivity-based logout has been successfully implemented for your Node.js REST API.

---

## 📋 Files Created/Modified

### New Files Created:

1. **[sessionManager.js](sessionManager.js)** (213 lines)
   - Core session management module
   - Handles session creation, validation, and cleanup
   - Automatic inactivity detection (15 minutes)
   - Background cleanup process (every 5 minutes)

2. **[LOGOUT_API_DOCUMENTATION.md](LOGOUT_API_DOCUMENTATION.md)** 
   - Comprehensive API documentation
   - All endpoint specifications with examples
   - cURL examples for testing
   - Troubleshooting guide

### Modified Files:

1. **[index.js](index.js)**
   - Integrated sessionManager module
   - Added JWT verification with session validation
   - Added activity tracking middleware
   - Created 5 new endpoints for session management
   - Enhanced startup messages with ASCII art

2. **[test.rest](test.rest)**
   - Added 6 new test scenarios
   - Complete session management test cases
   - Inactivity timeout testing guide

---

## 🎯 Core Features Implemented

### 1. **POST /logout** - Main Logout Endpoint
```http
POST /logout
Authorization: Bearer <token>
```
- Invalidates the current user session
- Returns session duration and logout timestamp
- Removes session from active sessions
- Response includes detailed session information

### 2. **Session Inactivity Timeout**
- **Timeout Duration**: 15 minutes (900 seconds)
- **Cleanup Check**: Every 5 minutes
- **Automatic**: No manual intervention needed
- **Activity Updates**: Tracked on every API request

### 3. **GET /session-status** - Check Session Status
```http
GET /session-status
Authorization: Bearer <token>
```
- Shows current session status
- Last activity timestamp
- Inactivity time in minutes
- Remaining minutes before auto-logout

### 4. **GET /sessions** - View All Active Sessions (Admin)
```http
GET /sessions
Authorization: Bearer <token>
```
- Lists all active sessions in the system
- Useful for admin monitoring
- Shows inactivity duration per session
- Includes statistics

### 5. **POST /logout-all** - Logout All User Sessions
```http
POST /logout-all
Authorization: Bearer <token>
```
- Invalidates all sessions for the current user
- Useful when user suspects unauthorized access
- Returns count of sessions logged out

---

## 🔧 Technical Architecture

### Session Manager Class

```javascript
SessionManager {
  // Session Storage
  sessions: Map<sessionId, sessionObject>
  
  // Configuration
  INACTIVITY_TIMEOUT: 15 * 60 * 1000  // 15 minutes
  CLEANUP_INTERVAL: 5 * 60 * 1000     // 5 minutes
  
  // Core Methods
  createSession(token, user, ipAddress)      // Create new session
  updateActivity(token)                       // Update last activity
  validateSession(token)                      // Check if active
  logout(token)                               // Invalidate session
  logoutAllUserSessions(userId)              // Logout all user sessions
  startCleanupProcess()                       // Start background cleanup
  getAllActiveSessions()                      // Get active sessions
  getStats()                                  // Get statistics
}
```

### Middleware Chain

```
Request
  ↓
IP Address Capture (req.clientIp)
  ↓
verifyToken → JWT validation + Session check
  ↓
updateSessionActivity → Update lastActivityAt
  ↓
Route Handler → Process request
  ↓
Response
```

### Session Data Model

```javascript
{
  sessionId: "sess_1708689045123_a1b2c3d4e",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  userId: 1,
  emailid: "user@example.com",
  username: "John Doe",
  createdAt: 1708689045123,          // ms since epoch
  lastActivityAt: 1708689330456,     // ms since epoch
  ipAddress: "192.168.1.100",
  isActive: true
}
```

---

## 🚀 How It Works

### Login Flow
```
User Login Request
  ↓
Verify Credentials
  ↓
Create JWT Token
  ↓
Create Session (sessionManager.createSession)
  ↓
Return Token + SessionID
  ↓
User Stores Token Locally
```

### Protected Request Flow
```
User Sends Request with Token
  ↓
verifyToken Middleware
  ├─ Validate JWT signature
  ├─ Check token expiration
  ├─ Validate session exists (sessionManager.validateSession)
  └─ Check session is active
  ↓
updateSessionActivity Middleware
  └─ Update lastActivityAt = now
  ↓
Route Handler Processes Request
  ↓
Response Sent
```

### Inactivity Detection Flow
```
Background Cleanup Process (every 5 minutes)
  ↓
For each active session:
  ├─ Check (now - lastActivityAt) > 15 minutes?
  ├─ If Yes: Mark isActive = false
  ├─ Remove from sessions Map
  └─ Log auto-logout
  ↓
Cleanup Complete
```

### Logout Flow
```
User Calls POST /logout with Token
  ↓
Verify Token & Session (verifyToken middleware)
  ↓
Call sessionManager.logout(token)
  ├─ Find session by token
  ├─ Mark isActive = false
  ├─ Delete from sessions Map
  └─ Return session metadata
  ↓
Return Success Response with Session Duration
  ↓
Token is Now Invalid
```

---

## 📊 Activity Tracking Timeline

```
TIME    ACTION                          INACTIVITY
────────────────────────────────────────────────
10:00   User Logs In                    0 min
        Session Created
        lastActivityAt = 10:00
        
10:05   User Makes API Call              5 min
        lastActivityAt = 10:05
        
10:10   User Makes API Call              5 min
        lastActivityAt = 10:10
        
10:15   No Activity                      5 min
        (No updates happening)
        
10:20   No Activity                      10 min
        Background Cleanup Runs
        Still Valid (< 15 min)
        
10:22   User Makes API Call              12 min → Reset
        lastActivityAt = 10:22
        
10:25   No Activity                      3 min
        
10:37   No Activity                      15 min
        Session Auto-Logged Out

10:40   User Tries API Call with Token
        Error: Session Not Found
        Must Login Again
```

---

## 🔐 Security Considerations

1. **Session Validation on Every Request**
   - JWT token verified
   - Session existence checked
   - Session activity timestamp validated

2. **Automatic Cleanup**
   - Inactive sessions automatically removed
   - No manual cleanup needed
   - Memory efficient

3. **IP Address Tracking**
   - Captured for debugging/auditing
   - Useful for detecting suspicious activity

4. **In-Memory Storage**
   - Sessions stored in memory (volatile)
   - Lost on server restart (by design)
   - Users must login again after restart

5. **Token Invalidation**
   - Tokens remain valid (JWT) but sessions removed
   - Double validation layer prevents exploits

---

## 📝 Testing Scenarios

### Scenario 1: Basic Logout
```
1. POST /login → Get token
2. POST /logout with token → Success
3. GET /protected with token → 401 Session not found
```

### Scenario 2: Inactivity Timeout
```
1. POST /login → Get token
2. Wait 15+ minutes without making requests
3. GET /session-status → 401 Session expired
OR
4. Cleanup job removes your session automatically
```

### Scenario 3: Activity Update
```
1. POST /login at 10:00
2. GET /session-status at 10:10 (inactivity = 10 min)
3. GET /protected at 10:15 (inactivity reset = 0 min)
4. GET /session-status → lastActivityAt = 10:15
```

### Scenario 4: Multiple Sessions
```
1. User A logs in → Session 1 created
2. User A logs in again → Session 2 created
3. POST /logout-all → Both sessions invalidated
4. No valid sessions for User A
```

---

## 🛠️ Configuration

All timeout settings are configurable in [sessionManager.js](sessionManager.js):

```javascript
// Line 10-11
this.INACTIVITY_TIMEOUT = 15 * 60 * 1000  // Change to desired minutes
this.CLEANUP_INTERVAL = 5 * 60 * 1000     // Change cleanup frequency
```

To change to 30 minutes:
```javascript
this.INACTIVITY_TIMEOUT = 30 * 60 * 1000  // 30 minutes
```

---

## 📦 Dependencies

No additional packages required! Uses existing dependencies:
- `express` - HTTP server
- `jsonwebtoken` - JWT handling
- `dotenv` - Environment variables

---

## 🧪 Testing the Implementation

### Using REST Client (VS Code Extension)

1. Install "REST Client" extension by Huachao Mao
2. Open [test.rest](test.rest)
3. Run test requests:
   - Request #2 - Login
   - Request #16 - Check Session Status
   - Request #18 - Logout
   - Request #20 - Try using logged-out token (should fail)

### Using cURL

Login:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

Check Session Status:
```bash
curl -X GET http://localhost:3000/session-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Logout:
```bash
curl -X POST http://localhost:3000/logout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📚 Documentation References

- **[LOGOUT_API_DOCUMENTATION.md](LOGOUT_API_DOCUMENTATION.md)** - Complete API reference
- **[sessionManager.js](sessionManager.js)** - Session manager implementation with JSDoc comments
- **[index.js](index.js)** - Server setup and endpoint definitions
- **[test.rest](test.rest)** - REST client test cases

---

## ✨ Best Practices Implemented

✅ **Singleton Pattern** - SessionManager is a singleton instance
✅ **Event Logging** - Console logs for all session events
✅ **Error Handling** - Comprehensive error responses
✅ **Comments & Documentation** - Extensive inline and external docs
✅ **RESTful Design** - Following REST conventions
✅ **Security** - Double validation (JWT + Session)
✅ **Performance** - Efficient Map-based storage
✅ **Scalability** - Ready for Redis/Database upgrade

---

## 🔮 Future Enhancements

- [ ] Persist sessions to Redis/Database
- [ ] Session encryption
- [ ] Device-specific tracking
- [ ] Geo-location validation
- [ ] Session audit logs
- [ ] Frontend session warnings
- [ ] Configurable timeout UI
- [ ] WebSocket support for real-time updates
- [ ] Two-factor authentication
- [ ] Session comparison (suspicious activities)

---

## 🐛 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Session not found" after login | Session expired due to inactivity | Login again |
| Token valid but session gone | Server restarted | Login again |
| Sessions not cleaning up | Cleanup interval is 5 minutes | Wait up to 5 minutes |
| Port 3000 already in use | Another process using the port | Change PORT in .env |

---

## 📞 Support

For questions or issues:
1. Check [LOGOUT_API_DOCUMENTATION.md](LOGOUT_API_DOCUMENTATION.md)
2. Review code comments in [sessionManager.js](sessionManager.js)
3. Check test cases in [test.rest](test.rest)
4. Verify all dependencies are installed: `npm install`

---

**Version**: 1.0.0  
**Implementation Date**: February 23, 2026  
**Status**: ✅ Complete and Tested  
**Author**: GitHub Copilot / Expert Node.js Developer
