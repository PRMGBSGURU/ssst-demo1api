# SSST Demo1 API - User Registration Endpoint

## Overview
This document provides detailed information about the new `/newregistration` REST API endpoint for user registration in the SSST Demo1 API.

## Features
- **User Registration**: Register new users with complete profile information
- **Automatic SSSTID Generation**: Generates unique 6-digit SSSTID with "SSST" prefix
- **Password Hashing**: Secure password storage using bcryptjs
- **Input Validation**: Comprehensive validation for all input fields
- **Error Handling**: Detailed error messages for debugging

---

## Installation & Setup

### 1. Update Database Schema
Before using the registration endpoint, update your MySQL database with the new columns:

```bash
# Option A: Fresh database setup (recommended)
mysql -u root -p ssst-demo1 < database-setup.sql

# Option B: Update existing database
mysql -u root -p ssst-demo1 < database-update.sql
```

### 2. Start the Server
```bash
npm run dev
```

---

## API Endpoint

### POST `/newregistration`

Register a new user with complete profile information.

#### Request

**URL**: `http://localhost:3000/newregistration`

**Method**: `POST`

**Content-Type**: `application/json`

#### Request Body

```json
{
  "surname": "Doe",
  "lastname": "John",
  "emailid": "john.doe@example.com",
  "mobilenumber": "9876543210",
  "whatsappnumber": "9876543210",
  "password": "SecurePassword123!"
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `surname` | string | Yes | User's surname/family name |
| `lastname` | string | Yes | User's last name |
| `emailid` | string | Yes | User's email address (must be unique) |
| `mobilenumber` | string | Yes | 10-digit mobile number |
| `whatsappnumber` | string | Yes | 10-digit WhatsApp number |
| `password` | string | Yes | User's password (will be hashed) |

#### Response

##### Success Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "ssstid": "SSST847293",
    "emailid": "john.doe@example.com",
    "surname": "Doe",
    "lastname": "John",
    "mobilenumber": "9876543210",
    "whatsappnumber": "9876543210"
  }
}
```

##### Error Response - Missing Fields (400 Bad Request)

```json
{
  "success": false,
  "message": "All fields are required: surname, lastname, emailid, mobilenumber, whatsappnumber, password"
}
```

##### Error Response - Invalid Email (400 Bad Request)

```json
{
  "success": false,
  "message": "Invalid email format"
}
```

##### Error Response - Invalid Phone Numbers (400 Bad Request)

```json
{
  "success": false,
  "message": "Mobile number and WhatsApp number must be 10 digits"
}
```

##### Error Response - Duplicate Email (409 Conflict)

```json
{
  "success": false,
  "message": "Email already registered"
}
```

##### Error Response - Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Server error during registration",
  "error": "detailed error message"
}
```

---

## SSSTID Generation Logic

The system automatically generates a unique SSSTID for each user:

1. **Format**: `SSST` + 6-digit random number (000000-999999)
2. **Example Generated Values**:
   - SSST123456
   - SSST000001
   - SSST999999
   - SSST847293

3. **Uniqueness**: Each SSSTID is checked against the database to ensure uniqueness before assignment

```javascript
const randomNumber = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
const ssstid = `SSST${randomNumber}`;
```

---

## Input Validation Rules

### Surname & Lastname
- **Type**: String
- **Required**: Yes
- **Length**: Up to 100 characters
- **Accepted Characters**: Letters, spaces, hyphens, apostrophes

### Email ID
- **Type**: String
- **Required**: Yes
- **Format**: Standard email format (user@domain.com)
- **Constraint**: Must be unique in the database
- **Example**: john.doe@example.com

### Mobile Number
- **Type**: String/Numeric
- **Required**: Yes
- **Format**: Exactly 10 digits
- **Example**: 9876543210

### WhatsApp Number
- **Type**: String/Numeric
- **Required**: Yes
- **Format**: Exactly 10 digits
- **Example**: 9876543210

### Password
- **Type**: String
- **Required**: Yes
- **Min Length**: Recommended 8+ characters
- **Security**: Will be hashed using bcryptjs (salted)
- **Note**: Plain passwords should not be sent over non-HTTPS

---

## Example Usage

### Using cURL

```bash
curl -X POST http://localhost:3000/newregistration \
  -H "Content-Type: application/json" \
  -d '{
    "surname": "Doe",
    "lastname": "John",
    "emailid": "john.doe@example.com",
    "mobilenumber": "9876543210",
    "whatsappnumber": "9876543210",
    "password": "SecurePassword123!"
  }'
```

### Using JavaScript/Fetch API

```javascript
const registerUser = async () => {
  const response = await fetch('http://localhost:3000/newregistration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      surname: 'Doe',
      lastname: 'John',
      emailid: 'john.doe@example.com',
      mobilenumber: '9876543210',
      whatsappnumber: '9876543210',
      password: 'SecurePassword123!'
    })
  });

  const result = await response.json();
  console.log(result);
};

registerUser();
```

### Using Axios

```javascript
const axios = require('axios');

axios.post('http://localhost:3000/newregistration', {
  surname: 'Doe',
  lastname: 'John',
  emailid: 'john.doe@example.com',
  mobilenumber: '9876543210',
  whatsappnumber: '9876543210',
  password: 'SecurePassword123!'
})
.then(response => {
  console.log('Registration successful:', response.data);
})
.catch(error => {
  console.error('Registration failed:', error.response.data);
});
```

### Using REST Client (VS Code Extension)

See `test.rest` file in the project for ready-to-use requests.

---

## Database Schema

### Users Table

```sql
CREATE TABLE `Users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ID` INT,
  `Surname` VARCHAR(100),
  `LastName` VARCHAR(100),
  `EmailID` VARCHAR(255) UNIQUE NOT NULL,
  `Password` VARCHAR(255) NOT NULL,
  `MobileNumber` VARCHAR(20),
  `WhatsAppNumber` VARCHAR(20),
  `SSSTID` VARCHAR(20) UNIQUE,
  `FirstName` VARCHAR(100),
  `UserName` VARCHAR(100),
  `Status` VARCHAR(50) DEFAULT 'active',
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (EmailID),
  INDEX idx_ssstid (SSSTID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcryptjs with salt (cost = 10)
2. **Email Uniqueness**: Database constraint ensures duplicate emails are rejected
3. **SSSTID Uniqueness**: Database constraint ensures each SSSTID is unique
4. **Input Validation**: All inputs are validated before database operations
5. **SQL Injection Protection**: Using prepared statements (parameterized queries)
6. **HTTPS Recommended**: For production, use HTTPS to protect sensitive data

---

## Testing Tips

1. **Test with REST Client**: Use the requests defined in `test.rest`
2. **Check Database**: 
   ```sql
   SELECT * FROM Users;
   ```
3. **Verify SSSTID Format**:
   ```sql
   SELECT EmailID, SSSTID FROM Users WHERE SSSTID LIKE 'SSST%';
   ```
4. **Check Password Hashing**:
   ```sql
   SELECT EmailID, Password FROM Users;
   -- Passwords will start with $2b$ (bcrypt hash)
   ```

---

## Troubleshooting

### Error: "Email already registered"
- **Cause**: The email you're trying to register already exists
- **Solution**: Use a different email address

### Error: "Mobile number and WhatsApp number must be 10 digits"
- **Cause**: Phone numbers are not in the correct format
- **Solution**: Provide exactly 10 digits without spaces or special characters

### Error: "Invalid email format"
- **Cause**: Email doesn't follow the standard format (user@domain.com)
- **Solution**: Enter a valid email address

### Error: "Database Connection Error"
- **Cause**: MySQL server is not running or database doesn't exist
- **Solution**: 
  1. Start MySQL server
  2. Create database: `CREATE DATABASE ssst-demo1;`
  3. Run: `mysql -u root -p ssst-demo1 < database-setup.sql`

### Error: "Server error during registration"
- **Cause**: Unexpected server error
- **Solution**: Check server console logs for detailed error information

---

## Related Endpoints

- **User Login**: `POST /userlogin` - Authenticate with email and password
- **Database Health**: Check `db.js` for connection status

---

## File Structure

```
ssst-demo1api/
├── index.js                      # Main server file
├── db.js                          # Database connection
├── userlogin.js                   # Login endpoint
├── userregistration.js            # Registration endpoint (NEW)
├── database-setup.sql             # Database schema (UPDATED)
├── database-update.sql            # Database migration script (NEW)
├── test.rest                      # API test requests (UPDATED)
├── package.json                   # Dependencies
└── README.md                      # Project documentation
```

---

## Version History

### v1.1.0 (Current)
- Added `/newregistration` endpoint
- Added automatic SSSTID generation with "SSST" prefix
- Added MobileNumber and WhatsAppNumber fields
- Added Surname field to Users table
- Enhanced database schema with indexes

### v1.0.0
- Basic login functionality
- JWT token generation
- User authentication

---

## Support

For issues or questions, please refer to the project repository or contact the development team.
