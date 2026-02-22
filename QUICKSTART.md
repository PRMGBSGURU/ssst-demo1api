# Quick Start Guide - User Registration API

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js installed
- MySQL server running
- Database: `ssst-demo1` created

---

## Step 1: Setup Database (Choose One)

### Option A: Fresh Database
```bash
mysql -u root -p ssst-demo1 < database-setup.sql
```

### Option B: Update Existing Database
```bash
mysql -u root -p ssst-demo1 < database-update.sql
```

---

## Step 2: Start the Server

```bash
npm run dev
```

**Expected Output**:
```
✓ MySQL Database Connected Successfully
Server running on port 3000
```

---

## Step 3: Test Registration Endpoint

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

### Expected Response (201)
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

---

## Using VS Code REST Client

1. Open `test.rest` file
2. Click "Send Request" on section "6. User Registration (New Endpoint)"
3. View response in left panel

---

## What's Included

✅ Automatic SSSTID generation (SSST + 6 digits)
✅ Secure password hashing (bcryptjs)
✅ Input validation (email, phone, required fields)
✅ Database integration (MySQL)
✅ Error handling with detailed messages
✅ Prepared statements (SQL injection safe)

---

## Input Requirements

| Field | Format | Example |
|-------|--------|---------|
| surname | Text (max 100 chars) | Doe |
| lastname | Text (max 100 chars) | John |
| emailid | Valid email | john.doe@example.com |
| mobilenumber | 10 digits | 9876543210 |
| whatsappnumber | 10 digits | 9876543210 |
| password | Any length | SecurePass123! |

---

## Common Errors & Solutions

### Error: "Email already registered"
```
Solution: Use a different email address
```

### Error: "Mobile number must be 10 digits"
```
Solution: Remove spaces/dashes, provide exactly 10 digits
Example: 9876543210 ✓  98-7654-3210 ✗
```

### Error: "Database Connection Error"
```
Solution: 
1. Start MySQL: sudo service mysql start (Linux) or MySQL Workbench (Windows)
2. Create database: CREATE DATABASE ssst-demo1;
3. Run setup script
```

### Error: "Invalid email format"
```
Solution: Use standard email format: name@domain.com
```

---

## Verify Registration in Database

```sql
mysql -u root -p ssst-demo1

-- See all users
SELECT * FROM Users;

-- Check SSSTID format
SELECT EmailID, SSSTID FROM Users WHERE SSSTID LIKE 'SSST%';

-- Verify passwords are hashed (should start with $2b$)
SELECT EmailID, LEFT(Password, 5) as PasswordHash FROM Users;
```

---

## Check Server Health

```bash
# Check if port 3000 is listening
netstat -an | grep 3000

# Or test with curl
curl http://localhost:3000/
```

---

## Next Step: User Login

After registration, test login:

```bash
curl -X POST http://localhost:3000/userlogin \
  -H "Content-Type: application/json" \
  -d '{
    "emailid": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

---

## Documentation Files

- 📖 Full API Docs → `API_REGISTRATION_DOCS.md`
- 📋 Implementation Details → `IMPLEMENTATION_SUMMARY.md`
- 🧪 Test Requests → `test.rest`
- 📁 Database Schema → `database-setup.sql`
- 🔧 Database Migration → `database-update.sql`

---

## Troubleshooting Checklist

- [ ] MySQL server is running
- [ ] Database `ssst-demo1` exists
- [ ] Database schema includes new columns (Surname, MobileNumber, WhatsAppNumber, SSSTID)
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Server started without errors (`npm run dev`)
- [ ] All 6 input fields provided in request
- [ ] Email format is valid
- [ ] Phone numbers are exactly 10 digits
- [ ] No special characters in phone numbers

---

## Environment Variables (Optional)

Create `.env` file to customize:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=ssst-demo1
JWT_SECRET=your-secret-key-change-in-production
```

---

**Ready to Register Users!** 🎉

For detailed API documentation, see `API_REGISTRATION_DOCS.md`
