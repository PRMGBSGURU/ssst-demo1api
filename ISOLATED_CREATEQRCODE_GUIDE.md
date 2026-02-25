# Isolated QR Code API - Usage Guide

## 📍 API Location
**File**: [createqrcode.js](createqrcode.js)  
**Route**: `POST /createqrcode`  
**Isolated**: ✅ Yes - Completely independent from other APIs

---

## 🎯 Purpose
Standalone endpoint to create QR codes using **only SSSTID**:
- **ssstid** - SSST ID only (no mobile number required)

---

## 📋 Request Format

**Endpoint**: `POST /createqrcode`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "ssstid": "SSST123456"
}
```

---

## ✅ Input Validation Rules

### SSSTID
- **Format**: `SSST[6 digits]`
- **Examples**:
  - ✅ `SSST123456` (correct)
  - ✅ `SSST789012` (correct)
  - ❌ `SSST12345` (only 5 digits)
  - ❌ `SST123456` (missing S)

---

## 📤 Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "QR code created and saved successfully",
  "data": {
    "qrCodeId": 1,
    "ssstid": "SSST123456",
    "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAAB...",
    "createdAt": "2026-02-25T10:30:45.123Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid SSSTID format",
  "expected_format": "SSST followed by 6 digits (e.g., SSST123456)",
  "received": "SST12345"
}
```

### Error Response (409 Conflict)
```json
{
  "success": false,
  "message": "QR code already exists for this SSSTID",
  "ssstid": "SSST123456"
}
```

---

## 🧪 Test Examples

### Using cURL
```bash
curl -X POST http://localhost:3000/createqrcode \
  -H "Content-Type: application/json" \
  -d '{
    "ssstid": "SSST123456"
  }'
```

### Using PowerShell
```powershell
$body = @{
    ssstid = "SSST123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/createqrcode" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Using JavaScript/Fetch
```javascript
const data = {
  ssstid: "SSST123456"
};

fetch('/createqrcode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 💨 Quick Test Sequence

### Step 1: Start Server
```bash
npm start
```

### Step 2: Create a QR Code
```bash
curl -X POST http://localhost:3000/createqrcode \
  -H "Content-Type: application/json" \
  -d '{
    "ssstid": "SSST654321"
  }'
```

### Step 3: Check Response
You should see:
```json
{
  "success": true,
  "message": "QR code created and saved successfully",
  "data": {
    "qrCodeId": 1,
    "ssstid": "SSST654321",
    "qrCodeData": "data:image/png;base64,..."
  }
}
```

---

## 🖼️ Using QR Code Data in Your App

The `qrCodeData` is a **Data URL** that can be used directly in HTML:

### Display as Image
```html
<img src="{qrCodeData}" alt="SSST QR Code" width="200" height="200" />
```

### React Component Example
```jsx
const [qrCode, setQrCode] = useState(null);

const generateQR = async () => {
  const response = await fetch('/createqrcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ssstid: 'SSST123456'
    })
  });
  
  const result = await response.json();
  setQrCode(result.data.qrCodeData);
};

return (
  <>
    <button onClick={generateQR}>Generate QR Code</button>
    {qrCode && <img src={qrCode} alt="QR Code" width={200} />}
  </>
);
```

---

## 🗄️ Database Integration

QR codes are stored in the `qrcode_reference` table:

```sql
SELECT id, SSSTID, Status, CreatedAt 
FROM qrcode_reference;
```

**Fields**:
- `id`: Auto-increment primary key
- `SSSTID`: Unique identifier (must be unique per table row)
- `MobileNumber`: Optional (nullable) - not used in current QR code generation
- `QRCodeData`: Base64-encoded PNG image containing SSSTID
- `CreatedAt`: Timestamp of creation
- `UpdatedAt`: Last updated timestamp

---

## 🚨 Error Handling

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Missing SSSTID | 400 | SSSTID not provided | Provide SSSTID field |
| Invalid format | 400 | SSSTID format incorrect | Use correct format (SSST followed by 6 digits) |
| Already exists | 409 | QR code exists for this SSSTID | Use different SSSTID |
| Table not found | 500 | Database table missing | Run database setup |
| Data too long | 500 | Column size insufficient | Modify column: `ALTER TABLE qrcode_reference MODIFY COLUMN QRCodeData MEDIUMTEXT;` |

---

## 📊 Integration Points

### With User Registration
The isolated `/createqrcode` endpoint is **NOT** automatically called during `/newregistration`. 
To create a QR code for a registered user:

1. User registers via `/newregistration` (get SSSTID from response)
2. Call `/createqrcode` manually with the SSSTID

**Example Workflow**:
```bash
# Step 1: Register user
curl -X POST http://localhost:3000/newregistration \
  -H "Content-Type: application/json" \
  -d '{
    "surname": "Smith",
    "lastname": "John",
    "emailid": "john@example.com",
    "gender": "Male",
    "mobilenumber": "+911234567890",
    "whatsappnumber": "+911234567890",
    "password": "Pass123"
  }'

# Response contains SSSTID (e.g., SSST789456)

# Step 2: Create QR code for the user
curl -X POST http://localhost:3000/createqrcode \
  -H "Content-Type: application/json" \
  -d '{
    "ssstid": "SSST789456"
  }'
```

---

## 🔒 Isolation Benefits

✅ **Independent**: Handles only QR code creation  
✅ **Focused**: Only takes required input (SSSTID)  
✅ **Reusable**: Can be called anytime, not tied to registration  
✅ **Flexible**: Use in different workflows (batch generation, manual creation, etc.)  
✅ **Testable**: Easy to test in isolation  
✅ **Maintainable**: Clear, single responsibility  
✅ **Simple**: Minimal input, clear output  

---

## 📝 QR Code Content

The QR code encodes only the SSSTID:
```
SSST123456
```

This allows scanners to extract the SSST ID from the QR code.

---

## ⚙️ Configuration

**Environment Variables**: None (uses default database from db.js)

**Database**: `ssst-demo1`  
**Table**: `qrcode_reference`  
**Port**: 3000 (default)

---

## 🔧 Troubleshooting

### Issue: "Table not found" Error
**Solution**: Run database setup
```bash
mysql -u root -p ssst-demo1 < database-setup.sql
```

### Issue: "Data too long" Error
**Solution**: Modify column size
```sql
USE `ssst-demo1`;
ALTER TABLE qrcode_reference MODIFY COLUMN QRCodeData MEDIUMTEXT NOT NULL;
```

### Issue: "Already exists" Error
**Solution**: SSSTID already has a QR code. Either:
- Use a different SSSTID
- Delete the existing QR code and recreate

---

## 📞 Support

For complete API documentation: [QRCODE_API_DOCUMENTATION.md](QRCODE_API_DOCUMENTATION.md)

For setup guide: [QRCODE_QUICKSTART.md](QRCODE_QUICKSTART.md)

---

**Status**: ✅ Production Ready

Created: February 25, 2026

