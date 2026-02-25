# QR Code Generation - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Update Database Schema
Run the database update script to create the `qrcode_reference` table:

```bash
# Using MySQL directly
mysql -u root -p ssst-demo1 < database-setup.sql

# OR use the QR-specific script
mysql -u root -p ssst-demo1 < database-update-qrcode.sql
```

### Step 2: Install Dependencies
The qrcode package has already been added to `package.json`. Install it:

```bash
npm install
```

### Step 3: Start the Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

You should see the new QR code endpoints in the startup message:
```
🔄 Other:
   GET    /userlogin               - Database user login
   POST   /newregistration         - Register new user
   POST   /createqrcode            - Create QR code (manual)
   GET    /qrcode/:ssstid          - Retrieve QR code for SSSTID
   DELETE /qrcode/:ssstid          - Delete QR code for SSSTID
```

---

## 📋 How It Works

### Automatic QR Code Generation (During Registration)

1. **User registers** via `POST /newregistration`
2. **API immediately returns** user data with newly generated SSSTID
3. **QR code is generated in background** (parallel, non-blocking):
   - Encodes: `SSSTID:SSST123456|MobileNumber:+911234567890`
   - Generates PNG QR code
   - Stores as Base64 in database
4. **User registration is unaffected** even if QR generation fails

### Manual QR Code Creation

Use `POST /createqrcode` endpoint to manually create QR codes for existing users.

---

## 🧪 Test It Now

### Test 1: Register a User (QR Code Auto-Generated)

```bash
curl -X POST http://localhost:3000/newregistration \
  -H "Content-Type: application/json" \
  -d '{
    "surname": "Smith",
    "lastname": "John",
    "emailid": "john.smith@example.com",
    "gender": "Male",
    "mobilenumber": "+911234567890",
    "whatsappnumber": "+911234567890",
    "password": "SecurePass123"
  }'
```

**Response:** (Note the SSSTID in the response)
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "ssstid": "SSST654321",
    "emailid": "john.smith@example.com",
    "surname": "Smith",
    "lastname": "John",
    "gender": "Male",
    "mobilenumber": "+911234567890",
    "whatsappnumber": "+911234567890"
  }
}
```

---

### Test 2: Retrieve the Auto-Generated QR Code

```bash
# Use the SSSTID from the registration response above
curl -X GET http://localhost:3000/qrcode/SSST654321
```

**Response:**
```json
{
  "success": true,
  "message": "QR code retrieved successfully",
  "data": {
    "qrCodeId": 1,
    "ssstid": "SSST654321",
    "mobilenumber": "+911234567890",
    "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAAB",
    "createdAt": "2026-02-25T10:30:45.123Z"
  }
}
```

---

### Test 3: Manually Create a QR Code

```bash
curl -X POST http://localhost:3000/createqrcode \
  -H "Content-Type: application/json" \
  -d '{
    "mobilenumber": "+919876543210",
    "ssstid": "SSST789456"
  }'
```

---

### Test 4: Delete a QR Code

```bash
curl -X DELETE http://localhost:3000/qrcode/SSST789456
```

---

## 📊 Database Verification

Check if QR codes are being saved:

```sql
-- Connect to the database
mysql -u root -p ssst-demo1

-- View all QR codes
SELECT id, SSSTID, MobileNumber, Status, CreatedAt FROM qrcode_reference;

-- View a specific QR code (get only metadata, not the large Base64 data)
SELECT id, SSSTID, MobileNumber, Status, CreatedAt 
FROM qrcode_reference 
WHERE SSSTID = 'SSST654321';
```

---

## ✅ Validation Rules

### SSSTID Format ✔️
- Starts with "SSST"
- Followed by 6 digits
- Example: `SSST123456` ✓
- Invalid: `SSST12345` ✗ (only 5 digits)

### Mobile Number Format ✔️
- Includes country code
- Total 12 digits with +
- Example: `+911234567890` ✓
- Invalid: `9876543210` ✗ (missing country code)

---

## 🔧 File Structure

New files created:
- `qrcode.js` - QR code API routes
- `database-update-qrcode.sql` - Database table creation script
- `QRCODE_API_DOCUMENTATION.md` - Complete API documentation
- `QRCODE_QUICKSTART.md` - This file

Modified files:
- `package.json` - Added qrcode dependency
- `userregistration.js` - Integrated parallel QR code generation
- `index.js` - Mounted QR code routes
- `database-setup.sql` - Included qrcode_reference table

---

## 🛠️ Technical Details

### QR Code Data Structure
Each QR code encodes:
```
SSSTID:{ssstid}|MobileNumber:{mobilenumber}
```

### Storage Format
- Stored as Base64-encoded PNG image
- Data URL format: `data:image/png;base64,{encoded_data}`
- Can be directly used in HTML: `<img src="{qrCodeData}" />`

### Database Table: qrcode_reference
```sql
- id: Auto-increment primary key
- SSSTID: Unique, indexed (UNIQUE, FOREIGN KEY → Users.SSSTID)
- MobileNumber: Indexed for searching
- QRCodeData: LONGTEXT for Base64 PNG data
- Status: active/inactive flag
- CreatedAt: Timestamp
- UpdatedAt: Auto-updated timestamp
```

---

## 🚨 Troubleshooting

### Issue: "Table not found" error
**Solution:** Run the database setup script
```bash
mysql -u root -p ssst-demo1 < database-setup.sql
```

### Issue: QR code not generated after registration
**Solution:** 
1. Check server logs for errors
2. Verify database table exists
3. Ensure MySQL connection is working

### Issue: QR code image not displaying
**Solution:** 
- Copy the full Base64 string from `qrCodeData`
- Ensure no truncation occurred
- Verify database LONGTEXT column size sufficient

---

## 📝 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/newregistration` | Register user (auto QR code) |
| POST | `/createqrcode` | Manual QR code creation |
| GET | `/qrcode/:ssstid` | Retrieve QR code |
| DELETE | `/qrcode/:ssstid` | Delete QR code |

---

## 🌟 Key Features

✅ **Automatic QR Code Generation** - Creates QR code during registration  
✅ **Non-Blocking** - Registration response sent immediately  
✅ **Data Encoded** - QR code contains both SSSTID and mobile number  
✅ **Base64 Format** - Can be used directly in web/mobile apps  
✅ **Database Stored** - All QR codes persisted in database  
✅ **Error Handling** - Graceful degradation if QR generation fails  
✅ **Manual API** - Can create QR codes on demand  
✅ **Retrieval API** - Fetch existing QR codes by SSSTID  
✅ **Delete API** - Remove QR codes from database  

---

## 🎯 Next Steps

1. ✅ Run database setup script
2. ✅ Install npm packages (already done)
3. ✅ Start the server
4. ✅ Test user registration
5. ✅ Verify QR code in database
6. ✅ Retrieve and display QR code in your app

---

## 📞 Support

For complete API documentation, see: [QRCODE_API_DOCUMENTATION.md](QRCODE_API_DOCUMENTATION.md)

For general API info, see: [README.md](README.md)

