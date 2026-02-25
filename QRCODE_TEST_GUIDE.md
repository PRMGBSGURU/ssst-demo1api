# QR Code API - Quick Reference & Testing Guide

## 🚀 Quick Start

### 1. Setup Database
```bash
mysql -u root -p ssst-demo1 < database-setup.sql
```

### 2. Install & Start
```bash
npm install
npm start
```

---

## 📝 API Endpoints

### 1. Register User with Auto QR Code
**Endpoint**: `POST /newregistration`

```bash
curl -X POST http://localhost:3000/newregistration \
  -H "Content-Type: application/json" \
  -d '{
    "surname": "Doe",
    "lastname": "John",
    "emailid": "john.doe@example.com",
    "gender": "Male",
    "mobilenumber": "+911234567890",
    "whatsappnumber": "+911234567890",
    "password": "securePassword123"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "ssstid": "SSST654321",
    "emailid": "john.doe@example.com",
    "surname": "Doe",
    "lastname": "John",
    "gender": "Male",
    "mobilenumber": "+911234567890",
    "whatsappnumber": "+911234567890"
  }
}
```

**Note**: QR code is generated automatically in the background!

---

### 2. Create QR Code (Manual)
**Endpoint**: `POST /createqrcode`

```bash
curl -X POST http://localhost:3000/createqrcode \
  -H "Content-Type: application/json" \
  -d '{
    "mobilenumber": "+911234567890",
    "ssstid": "SSST123456"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "QR code created and saved successfully",
  "data": {
    "qrCodeId": 1,
    "ssstid": "SSST123456",
    "mobilenumber": "+911234567890",
    "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAAB...",
    "createdAt": "2026-02-25T10:30:45.123Z"
  }
}
```

---

### 3. Retrieve QR Code
**Endpoint**: `GET /qrcode/:ssstid`

```bash
curl -X GET http://localhost:3000/qrcode/SSST123456
```

**Response**:
```json
{
  "success": true,
  "message": "QR code retrieved successfully",
  "data": {
    "qrCodeId": 1,
    "ssstid": "SSST123456",
    "mobilenumber": "+911234567890",
    "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAAB...",
    "createdAt": "2026-02-25T10:30:45.123Z"
  }
}
```

---

### 4. Delete QR Code
**Endpoint**: `DELETE /qrcode/:ssstid`

```bash
curl -X DELETE http://localhost:3000/qrcode/SSST123456
```

**Response**:
```json
{
  "success": true,
  "message": "QR code deleted successfully",
  "data": {
    "ssstid": "SSST123456",
    "deletedAt": "2026-02-25T10:30:45.123Z"
  }
}
```

---

## 📊 Using QR Code Data in HTML

The `qrCodeData` is a Data URL that can be used directly in HTML:

```html
<!-- Display QR code image -->
<img src="{qrCodeData}" alt="SSST QR Code" width="200" height="200" />
```

Example:
```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAAB..." 
     alt="SSST QR Code" 
     width="200" 
     height="200" />
```

---

## 🧪 Complete Test Sequence

### Step 1: Register a New User
```bash
curl -X POST http://localhost:3000/newregistration \
  -H "Content-Type: application/json" \
  -d '{
    "surname": "Johnson",
    "lastname": "Alice",
    "emailid": "alice.johnson@test.com",
    "gender": "Female",
    "mobilenumber": "+918765432100",
    "whatsappnumber": "+918765432100",
    "password": "SecurePass123"
  }'
```

**Note the SSSTID from response** (e.g., `SSST789456`)

---

### Step 2: Wait 1-2 Seconds
Let the QR code generation complete in the background.

---

### Step 3: Retrieve the Auto-Generated QR Code
```bash
# Replace SSST789456 with the SSSTID from Step 1
curl -X GET http://localhost:3000/qrcode/SSST789456
```

You should see the QR code data!

---

### Step 4: Verify in Database
```bash
mysql -u root -p ssst-demo1
SELECT id, SSSTID, MobileNumber, Status, CreatedAt FROM qrcode_reference;
```

---

## ✅ Expected Startup Message

When you start the server, you should see:

```
╔════════════════════════════════════════════════════════════╗
║                 API Server Started                        ║
║              http://localhost:3000                         ║
╚════════════════════════════════════════════════════════════╝

📋 Available Endpoints:

🔓 Authentication:
   POST   /login                   - Login and create session
   POST   /logout                  - Logout current session
   POST   /logout-all              - Logout all user sessions

✅ Protected Routes (Requires Token):
   GET    /protected               - Access protected resource
   GET    /profile                 - Get user profile
   GET    /session-status          - Check session status & inactivity
   GET    /sessions                - Get all active sessions

🔄 Other:
   GET    /userlogin               - Database user login
   POST   /newregistration         - Register new user
   POST   /createqrcode            - Create QR code (manual)
   GET    /qrcode/:ssstid          - Retrieve QR code for SSSTID
   DELETE /qrcode/:ssstid          - Delete QR code for SSSTID
```

Note the QR code endpoints at the bottom!

---

## 🔍 Console Output During Registration

When a user registers, you should see:

```
✓ QR code generated successfully for SSSTID: SSST789456
```

Or if there's an error:

```
✗ QR code generation failed for SSSTID: SSST789456
```

The registration still succeeds even if QR generation fails!

---

## 📱 Using QR Codes in Your App

### Frontend Example (React)
```jsx
import { useEffect, useState } from 'react';

function QRCodeDisplay({ ssstid }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/qrcode/${ssstid}`)
      .then(res => res.json())
      .then(data => {
        setQrCode(data.data.qrCodeData);
        setLoading(false);
      });
  }, [ssstid]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Your QR Code</h2>
      <img src={qrCode} alt="QR Code" width={200} height={200} />
      <p>Scan this QR code to verify your SSST ID</p>
    </div>
  );
}
```

---

## 🎯 Key Points to Remember

1. **Automatic Generation** - QR codes are created when you register
2. **Non-Blocking** - Registration completes immediately
3. **Parallel Execution** - QR generation happens in background
4. **Data Encoded** - QR contains both SSSTID and mobile number
5. **Base64 Format** - Can be used directly in `<img>` tags
6. **Stored in DB** - All QR codes are persisted
7. **Retrievable** - Use GET endpoint to fetch QR codes
8. **Deletable** - Can remove QR codes if needed

---

## 📚 For More Information

- Full API docs: [QRCODE_API_DOCUMENTATION.md](QRCODE_API_DOCUMENTATION.md)
- Quick start: [QRCODE_QUICKSTART.md](QRCODE_QUICKSTART.md)
- Implementation details: [QRCODE_IMPLEMENTATION_SUMMARY.md](QRCODE_IMPLEMENTATION_SUMMARY.md)

---

**Ready to test?** Start with Step 1 above! 🚀

