# 🔧 Token Validation & Debugging Guide

## ✅ Fix Applied

I've implemented a shared configuration system to ensure **both `/login` and `/userlogin` use the exact same SECRET_KEY** for token generation and verification.

### Changes Made:

1. **Created [config.js](config.js)** - Centralized configuration
   - All modules now import `SECRET_KEY` from the same source
   - Prevents token signature mismatch issues

2. **Updated [index.js](index.js)** - Uses shared config
   - ✅ Imports `SECRET_KEY` from config.js

3. **Updated [userlogin.js](userlogin.js)** - Uses shared config
   - ✅ Imports `SECRET_KEY` from config.js
   - ✅ Uses `JWT_CONFIG` for consistency

4. **Added `/validate-token` endpoint** - Debug endpoint
   - Diagnoses token and session issues
   - Shows detailed error messages

---

## 🧪 How to Test & Fix Your Token Issue

### Step 1: Test the New Validation Endpoint

**With your current token that's giving "Invalid or expired token" error:**

```bash
curl -X POST http://localhost:3000/validate-token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Expected Response (if token is valid):**
```json
{
  "success": true,
  "message": "Token and session are valid",
  "tokenValid": true,
  "sessionValid": true,
  "decodedToken": {
    "id": 1,
    "emailid": "user@example.com",
    "username": "John Doe",
    "issuedAt": "2026-02-23T10:00:00.000Z",
    "expiresAt": "2026-02-23T11:00:00.000Z"
  },
  "sessionDetails": {
    "sessionId": "sess_1708689045123_a1b2c3d4e",
    "userId": 1,
    "emailid": "user@example.com",
    "username": "John Doe",
    "inactivityMinutes": 2
  }
}
```

**Expected Response (if token is invalid):**
```json
{
  "success": false,
  "message": "JWT Verification Failed",
  "error": "invalid token",
  "hint": "Make sure token was copied correctly and SECRET_KEY matches",
  "tokenFormat": {
    "received": "eyJhbGciOiJI...Wgg3D8...",
    "expectedFormat": "Bearer <jwt_token>",
    "bearerPrefix": "YES"
  }
}
```

---

### Step 2: Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **"JWT Verification Failed"** | Token copied incorrectly or SECRET_KEY mismatch | Re-copy the token carefully, ensure no spaces |
| **"Session Validation Failed"** | Session expired or server restarted | Login again to create a new session |
| **Token has spaces** | Copied with extra characters | Copy token between the quotes carefully |
| **Token too old** | Generated >1 hour ago | Tokens expire after 1 hour, login again |

---

### Step 3: Proper Token Usage

**✅ CORRECT - Copy exactly as shown:**
```bash
POST /validate-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWxpZCI6IndXVjJkdiIsImlhdCI6MTcxMTAwMDAwMCwiZXhwIjoxNzExMDAzNjAwfQ.xxxxx
```

**❌ WRONG - Copying with extra whitespace:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 .eyJpZCI6MSwiZW1haWxpZCI6IndXVjJkdiIsImlhdCI6MTcxMTAwMDAwMCwiZXhwIjoxNzExMDAzNjAwfQ.xxxxx
                                                    ^-- Extra space
```

---

## 🔄 Complete Workflow to Test

### 1. Login and Get Token
```bash
curl -X POST http://localhost:3000/userlogin \
  -H "Content-Type: application/json" \
  -d '{"emailid": "user@example.com", "password": "your_password"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "sess_1708689045123_a1b2c3d4e",
  "user": { "emailid": "user@example.com" }
}
```

**👉 Copy the token carefully (no spaces before/after)**

### 2. Validate the Token
```bash
curl -X POST http://localhost:3000/validate-token \
  -H "Authorization: Bearer YOUR_COPIED_TOKEN" \
  -H "Content-Type: application/json"
```

**If it says "Token and session are valid", you can:**

### 3. Use Protected Endpoints
```bash
curl -X GET http://localhost:3000/session-status \
  -H "Authorization: Bearer YOUR_COPIED_TOKEN"

curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer YOUR_COPIED_TOKEN"

curl -X POST http://localhost:3000/logout \
  -H "Authorization: Bearer YOUR_COPIED_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📝 Using REST Client (VS Code)

### 1. Install REST Client Extension
- Open VS Code
- Go to Extensions
- Search for "REST Client" by Huachao Mao
- Click Install

### 2. Open test.rest
- Open the file `test.rest`
- Find request #2 (Login - Admin User) or request #5 (Database User Login)
- Click "Send Request"
- Copy the token from the response

### 3. Test Validate Token
```
POST http://localhost:3000/validate-token
Authorization: Bearer <paste_your_token_here>
Content-Type: application/json
```

### 4. Use Token in Other Requests
```
GET http://localhost:3000/session-status
Authorization: Bearer <paste_your_token_here>
```

---

## 🛠️ Environment Variable Setup (Optional)

If you want to use a custom SECRET_KEY (recommended for production):

### 1. Create/Edit `.env` file in project root:
```
JWT_SECRET=your-super-secret-key-here-change-in-production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=ssst-demo1
```

### 2. Restart the server
Both `/login` and `/userlogin` will now use your custom SECRET_KEY

### 3. Verify it's working
```bash
curl -X POST http://localhost:3000/validate-token \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ♻️ If Token Still Invalid

### Reset and Try Again:

1. **Kill all Node processes:**
   ```bash
   taskkill /F /IM node.exe
   ```

2. **Clear any cached tokens** from your client

3. **Start fresh:**
   ```bash
   cd c:\Users\pathi\Documents\SSSTAppDev\App1\ssst-demo1\ssst-demo1api
   node index.js
   ```

4. **Login immediately:**
   ```bash
   curl -X POST http://localhost:3000/userlogin \
     -H "Content-Type: application/json" \
     -d '{"emailid": "user@example.com", "password": "your_password"}'
   ```

5. **Copy token immediately** (within 30 seconds)

6. **Use the token immediately** (within 1 hour expiry)

---

## 📊 Debug Information

The `/validate-token` endpoint will show you:

✅ **JWT Status** - Is the token properly signed & not expired?
✅ **Session Status** - Does the session exist in memory?
✅ **Token Claims** - User ID, email, username from token
✅ **Session Details** - Session ID, creation time, inactivity
✅ **Expiry Information** - When token will expire (1 hour from creation)

---

## Common "Invalid or expired token" Fixes

### Fix #1: Token Expiration
- **Problem**: Token generated >1 hour ago
- **Solution**: Login again to get fresh token
- **Verification**: Use `/validate-token` to see expiry time

### Fix #2: Token Format
- **Problem**: Missing "Bearer " prefix
- **Solution**: Always send as `Authorization: Bearer <token>`
- **Verification**: `/validate-token` will show `bearerPrefix: YES`

### Fix #3: Token Corruption
- **Problem**: Token copied with extra spaces/characters
- **Solution**: Copy token from response as-is between quotes
- **Verification**: Token should be a continuous string with 3 parts separated by dots

### Fix #4: SECRET_KEY Mismatch (NOW FIXED!)
- **Problem**: Different modules using different SECRET_KEYs
- **Solution**: ✅ Now fixed with shared config.js
- **Verification**: Both endpoints use config.js

---

## 🎯 Quick Summary

**What was the problem?**
- Different modules might have used different SECRET_KEYs for token signing/verification

**What did I fix?**
- ✅ Created [config.js](config.js) - Shared configuration
- ✅ Updated both [index.js](index.js) and [userlogin.js](userlogin.js) to use config.js
- ✅ Added `/validate-token` endpoint for debugging

**What should you do?**
1. Test with `/validate-token` to see detailed error info
2. Copy token correctly (no extra spaces)
3. Use token within 1 hour of creation
4. If still failing, check `/validate-token` output for specific issue

---

**Testing Status:** ✅ Server running with fixes  
**Next Step:** Test with `/validate-token` and share the response if errors persist
