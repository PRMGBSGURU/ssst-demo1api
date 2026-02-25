# QR Code Generation API Documentation

## Overview

The QR Code Generation API creates unique QR codes for each registered user using their SSST ID and mobile number. The QR codes are automatically generated when a user registers and are stored in the `qrcode_reference` table.

## Features

- **Automatic QR Code Generation**: QR codes are generated automatically during user registration (runs in parallel, non-blocking)
- **Manual QR Code Creation**: Endpoint to manually create QR codes for users
- **QR Code Retrieval**: Fetch existing QR codes by SSSTID
- **QR Code Deletion**: Remove QR codes from the database
- **Database Integration**: All QR codes are stored in the `qrcode_reference` table with links to the Users table

## Database Setup

### Create QR Code Table

Before using the QR Code API, you must create the `qrcode_reference` table. Run one of the following SQL scripts:

**Option 1: Using the comprehensive setup script**
```bash
mysql -u root -p ssst-demo1 < database-setup.sql
```

**Option 2: Using the QR code-specific update script**
```bash
mysql -u root -p ssst-demo1 < database-update-qrcode.sql
```

### Table Structure

```sql
CREATE TABLE `qrcode_reference` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `SSSTID` VARCHAR(20) UNIQUE NOT NULL,
  `MobileNumber` VARCHAR(20) NOT NULL,
  `QRCodeData` LONGTEXT NOT NULL,
  `Status` VARCHAR(50) DEFAULT 'active',
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ssstid (SSSTID),
  INDEX idx_mobilenumber (MobileNumber),
  FOREIGN KEY (SSSTID) REFERENCES Users(SSSTID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## API Endpoints

### 1. Create QR Code (Manual)

**Endpoint:** `POST /createqrcode`

**Description:** Manually create a QR code and save it to the database.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "mobilenumber": "+911234567890",
  "ssstid": "SSST123456"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "QR code created and saved successfully",
  "data": {
    "qrCodeId": 1,
    "ssstid": "SSST123456",
    "mobilenumber": "+911234567890",
    "qrCodeData": "data:image/png;base64,iVBORw0KGgo...",
    "createdAt": "2026-02-25T10:30:45.123Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Both mobilenumber and ssstid are required"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/createqrcode \
  -H "Content-Type: application/json" \
  -d '{
    "mobilenumber": "+911234567890",
    "ssstid": "SSST123456"
  }'
```

---

### 2. Retrieve QR Code

**Endpoint:** `GET /qrcode/:ssstid`

**Description:** Fetch the QR code for a specific SSSTID.

**Parameters:**
- `ssstid` (path) - The SSST ID in format SSST followed by 6 digits (e.g., SSST123456)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "QR code retrieved successfully",
  "data": {
    "qrCodeId": 1,
    "ssstid": "SSST123456",
    "mobilenumber": "+911234567890",
    "qrCodeData": "data:image/png;base64,iVBORw0KGgo...",
    "createdAt": "2026-02-25T10:30:45.123Z"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "QR code not found for the given SSSTID"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/qrcode/SSST123456
```

---

### 3. Delete QR Code

**Endpoint:** `DELETE /qrcode/:ssstid`

**Description:** Delete the QR code for a specific SSSTID.

**Parameters:**
- `ssstid` (path) - The SSST ID in format SSST followed by 6 digits (e.g., SSST123456)

**Response (Success - 200):**
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

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "QR code not found for the given SSSTID"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/qrcode/SSST123456
```

---

## User Registration with Automatic QR Code Generation

### Endpoint: `POST /newregistration`

When a user registers using the `/newregistration` endpoint, a QR code is automatically generated in parallel. The registration response is sent immediately, and the QR code generation happens in the background.

**Request Body:**
```json
{
  "surname": "Doe",
  "lastname": "John",
  "emailid": "john.doe@example.com",
  "gender": "Male",
  "mobilenumber": "+911234567890",
  "whatsappnumber": "+911234567890",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "ssstid": "SSST123456",
    "emailid": "john.doe@example.com",
    "surname": "Doe",
    "lastname": "John",
    "gender": "Male",
    "mobilenumber": "+911234567890",
    "whatsappnumber": "+911234567890"
  }
}
```

**QR Code Generation (Background):**
- SSSTID and mobile number are captured from the registration request
- QR code is generated encoding both values
- QR code is automatically saved to `qrcode_reference` table
- If QR code generation fails, it's logged but doesn't affect the registration

---

## QR Code Content Format

The QR code encodes the following information:
```
SSSTID:{ssstid}|MobileNumber:{mobilenumber}
```

**Example:**
```
SSSTID:SSST123456|MobileNumber:+911234567890
```

This format allows scanning to extract both the SSST ID and mobile number from the QR code.

---

## Validation Rules

### SSSTID Format
- Must start with "SSST"
- Followed by exactly 6 digits (100001-999999)
- Example: `SSST123456`

### Mobile Number Format
- Must include country code
- Format: `+[12 digits total]`
- Example: `+911234567890`

### Error Responses

**400 Bad Request:**
- Missing required fields
- Invalid SSSTID format
- Invalid mobile number format

**409 Conflict:**
- QR code already exists for the SSSTID (when creating manually)

**404 Not Found:**
- QR code doesn't exist (on retrieve/delete)

**500 Internal Server Error:**
- Database connection issues
- Table not found (qrcode_reference table missing)

---

## Integration with User Registration

The QR code generation is seamlessly integrated with the user registration process:

1. **User submits registration request** to `/newregistration`
2. **User is validated** and inserted into the Users table
3. **SSSTID is generated** (SSST + 6 random digits)
4. **User data is returned** immediately (201 response)
5. **QR code generation starts** in parallel (non-blocking):
   - Content is prepared: `SSSTID:SSST123456|MobileNumber:+911234567890`
   - QR code is generated as Base64 encoded PNG data
   - QR code is saved to `qrcode_reference` table
6. **Success/error is logged** to console

This approach ensures the registration experience remains fast while the QR code is securely generated and stored.

---

## Database Relationships

The `qrcode_reference` table has a foreign key relationship with the `Users` table:

```sql
FOREIGN KEY (SSSTID) REFERENCES Users(SSSTID) ON DELETE CASCADE
```

This ensures:
- A QR code can only be created for an existing user (SSSTID)
- When a user is deleted, their associated QR code is automatically deleted
- Referential integrity is maintained

---

## Error Handling

### QR Code Table Not Found

If the `qrcode_reference` table doesn't exist:

**During Manual Creation:**
```json
{
  "success": false,
  "message": "Database table \"qrcode_reference\" not found. Please run database setup script.",
  "hint": "Execute database-setup.sql or database-update-qrcode.sql"
}
```

**During Registration (Background):**
- User registration succeeds normally
- QR code generation fails gracefully
- Error is logged to console with helpful message
- Registration is not affected

---

## Performance Considerations

### Parallel Processing
- QR code generation runs asynchronously after registration
- Database insertion happens in parallel with user registration
- User registration response is not delayed by QR code generation

### Database Optimization
- SSSTID is indexed for fast lookup
- Mobile number is indexed for searching
- LONGTEXT column for QR code storage (supports large Base64 PNG data)
- Foreign key relationship ensures data consistency

---

## Testing the API

### Test User Registration with Automatic QR Code

```bash
# Register a new user
curl -X POST http://localhost:3000/newregistration \
  -H "Content-Type: application/json" \
  -d '{
    "surname": "Johnson",
    "lastname": "Alice",
    "emailid": "alice.johnson@example.com",
    "gender": "Female",
    "mobilenumber": "+918765432100",
    "whatsappnumber": "+918765432100",
    "password": "SecurePass123"
  }'

# Wait a moment for QR code to be generated in background

# Retrieve the QR code (use SSSTID from registration response)
curl -X GET http://localhost:3000/qrcode/SSST654321
```

### Test Manual QR Code Creation

```bash
curl -X POST http://localhost:3000/createqrcode \
  -H "Content-Type: application/json" \
  -d '{
    "mobilenumber": "+919876543210",
    "ssstid": "SSST789456"
  }'
```

---

## Dependencies

- **qrcode**: ^1.5.3 - QR code generation library
- **mysql2**: ^3.6.0 - MySQL database driver
- **express**: ^4.18.2 - Web framework

---

## Troubleshooting

### QR Code Not Generated After Registration
1. Check if `qrcode_reference` table exists: `DESCRIBE qrcode_reference;`
2. Run database setup script if table is missing
3. Check server logs for error messages
4. Verify MySQL connection is working

### QR Code Data URL Not Displaying
1. Ensure the full Base64 data string is copied
2. Verify database LONGTEXT column can hold the data (should be ~1-2KB per QR code)
3. Check if there are any truncation issues with your database client

### Foreign Key Constraint Error
- Ensure the user (SSSTID) exists in the Users table before creating a QR code
- SSSTID must be unique in the Users table

---

## Version History

- **v1.0.0** (2026-02-25): Initial release with automatic QR code generation on user registration

