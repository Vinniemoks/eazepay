# Quick Start: Enhanced Authentication

## Prerequisites

- Node.js 18+ installed
- Redis server running
- PostgreSQL database configured

## Setup Steps

### 1. Install Redis

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Mac
brew install redis
```

**Start Redis:**
```bash
redis-server
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

### 2. Run Setup Script

**Windows:**
```bash
.\scripts\setup-enhanced-auth.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-enhanced-auth.sh
./scripts/setup-enhanced-auth.sh
```

### 3. Configure Environment

Create or update `services/identity-service/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eazepay_identity

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Session Configuration
SESSION_TTL=28800

# Server
PORT=8000
NODE_ENV=development
```

### 4. Start the Service

```bash
cd services/identity-service
npm run dev
```

## Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+254712345678",
    "password": "SecurePass123!",
    "fullName": "Test User",
    "role": "CUSTOMER",
    "verificationType": "NATIONAL_ID",
    "verificationNumber": "12345678"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "CUSTOMER"
  }
}
```

### 3. Refresh Token

```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 4. Get Active Sessions

```bash
curl -X GET http://localhost:8000/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Logout from All Devices

```bash
curl -X POST http://localhost:8000/api/auth/logout-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Request Password Reset

```bash
curl -X POST http://localhost:8000/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 8. Complete Password Reset

```bash
curl -X POST http://localhost:8000/api/auth/password-reset/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_EMAIL",
    "newPassword": "NewSecurePass123!"
  }'
```

## Verify Redis Data

Check what's stored in Redis:

```bash
# Connect to Redis CLI
redis-cli

# List all keys
KEYS *

# View a session
GET session:SESSION_ID

# View user sessions
SMEMBERS user:USER_ID:sessions

# View blacklisted tokens
GET blacklist:TOKEN

# View OTP
GET otp:USER_ID

# View password reset token
GET password-reset:TOKEN
```

## Common Issues

### Redis Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:**
1. Ensure Redis is running: `redis-cli ping`
2. Check Redis host/port in .env
3. Check firewall settings

### JWT Secret Error

**Error:** `JWT secret must be at least 32 characters`

**Solution:**
Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to .env:
```env
JWT_SECRET=<generated_secret>
```

### Module Not Found Error

**Error:** `Cannot find module '@afripay/auth-middleware'`

**Solution:**
```bash
# Build auth-middleware
cd services/shared/auth-middleware
npm install
npm run build

# Link it (if needed)
npm link

# In identity-service
cd ../../identity-service
npm link @afripay/auth-middleware
```

### Database Connection Error

**Error:** `Connection terminated unexpectedly`

**Solution:**
1. Ensure PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Check database exists
4. Run migrations if needed

## Next Steps

1. **Enable 2FA**: Update user to enable 2FA
2. **Test Multi-Device**: Login from multiple devices
3. **Monitor Sessions**: Check Redis for session data
4. **Test Token Refresh**: Wait for token to expire and refresh
5. **Test Logout**: Verify sessions are properly terminated

## Production Checklist

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable Redis persistence (RDB/AOF)
- [ ] Configure Redis password
- [ ] Use HTTPS for all endpoints
- [ ] Set up Redis monitoring
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Set up backup for Redis
- [ ] Configure session timeout
- [ ] Test disaster recovery

## Support

For detailed documentation, see:
- [Enhanced Authentication Guide](./ENHANCED_AUTHENTICATION.md)
- [Authentication Flow Review](./AUTHENTICATION_FLOW_REVIEW.md)
- [Critical Issues Fixed](./CRITICAL_ISSUE_5_FIXED.md)
