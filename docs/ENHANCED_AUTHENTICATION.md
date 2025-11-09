# Enhanced Authentication Implementation

## Overview

This document describes the enhanced authentication system implemented for the fintech platform, following industry best practices for security and session management.

## Key Features

### 1. Session Management
- **Redis-based sessions**: Fast, scalable session storage
- **Multi-device support**: Track and manage sessions across devices
- **Session invalidation**: Proper logout with token blacklisting
- **Activity tracking**: Monitor last activity for security

### 2. Token Management
- **JWT tokens**: Secure, stateless authentication
- **Token refresh**: Seamless token renewal without re-login
- **Token blacklisting**: Invalidate tokens on logout
- **Expiration handling**: Automatic token expiry

### 3. Two-Factor Authentication (2FA)
- **OTP storage**: Secure OTP storage in Redis with TTL
- **Multiple methods**: SMS, TOTP, biometric support
- **Verification flow**: Complete 2FA verification process

### 4. Password Security
- **Reset flow**: Secure password reset with time-limited tokens
- **Strong hashing**: bcrypt for password storage
- **Reset tokens**: Cryptographically secure reset tokens

### 5. Security Features
- **Account lockout**: Prevent brute force attacks
- **Failed attempt tracking**: Monitor suspicious activity
- **Device fingerprinting**: Track device information
- **IP tracking**: Monitor access patterns

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/refresh
Refresh an expired access token using a refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 28800
}
```

#### POST /api/auth/logout
Logout and invalidate the current session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### POST /api/auth/logout-all
Logout from all devices and invalidate all sessions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out from all devices"
}
```

#### GET /api/auth/sessions
Get all active sessions for the current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "sess_123",
      "deviceInfo": {
        "userAgent": "Mozilla/5.0...",
        "ip": "192.168.1.1",
        "deviceType": "desktop"
      },
      "createdAt": "2025-11-06T10:00:00Z",
      "lastActivityAt": "2025-11-06T12:30:00Z",
      "expiresAt": "2025-11-06T18:00:00Z"
    }
  ]
}
```

#### DELETE /api/auth/sessions/:sessionId
Terminate a specific session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Session terminated successfully"
}
```

#### POST /api/auth/password-reset/request
Request a password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

#### POST /api/auth/password-reset/verify
Verify the reset token and set a new password.

**Request:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

#### POST /api/auth/2fa/complete
Complete 2FA verification after initial login.

**Request:**
```json
{
  "sessionToken": "temp_session_token",
  "otp": "123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "CUSTOMER"
  }
}
```

## Architecture

### Components

1. **SessionManager** (`@eazepay/auth-middleware`)
   - Manages Redis-based sessions
   - Handles session creation, validation, and termination
   - Supports multi-device session tracking

2. **JWTService** (`@eazepay/auth-middleware`)
   - Generates and validates JWT tokens
   - Manages token pairs (access + refresh)
   - Handles token blacklisting

3. **AuthEnhancedController** (`identity-service`)
   - Implements authentication endpoints
   - Integrates SessionManager and JWTService
   - Handles business logic for auth flows

4. **Redis Client** (`identity-service`)
   - Centralized Redis connection
   - Used for sessions, OTP storage, token blacklisting
   - Configured with retry strategy

### Data Flow

#### Login Flow
1. User submits credentials
2. Credentials validated against database
3. If 2FA enabled, temporary session token issued
4. User completes 2FA verification
5. Full session created in Redis
6. JWT token pair generated and returned

#### Token Refresh Flow
1. Client sends expired access token + refresh token
2. Refresh token validated
3. Session checked in Redis
4. New token pair generated
5. Session updated with new activity timestamp

#### Logout Flow
1. Client sends logout request with access token
2. Token validated and decoded
3. Session removed from Redis
4. Token added to blacklist
5. Success response returned

## Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Session Configuration
SESSION_TTL=28800  # 8 hours in seconds
```

### Redis Requirements

- **Version**: Redis 5.0 or higher
- **Memory**: At least 512MB for session storage
- **Persistence**: RDB or AOF enabled for session recovery
- **Eviction**: `allkeys-lru` policy recommended

## Security Considerations

### Token Security
- JWT secrets must be at least 32 characters
- Tokens are signed with HS256 algorithm
- Refresh tokens have longer expiry than access tokens
- Blacklisted tokens are stored until expiry

### Session Security
- Sessions expire after 8 hours of inactivity
- Device information tracked for anomaly detection
- IP addresses logged for security auditing
- Multi-device sessions can be managed by users

### Password Reset Security
- Reset tokens are cryptographically secure (32 bytes)
- Tokens expire after 1 hour
- Tokens are single-use only
- Email verification required

### 2FA Security
- OTPs expire after 10 minutes
- OTPs are 6 digits, cryptographically random
- Rate limiting on OTP verification
- Support for multiple 2FA methods

## Testing

### Manual Testing

1. **Login and Token Refresh**
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Refresh token
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token>"}'
```

2. **Session Management**
```bash
# Get sessions
curl -X GET http://localhost:8000/api/auth/sessions \
  -H "Authorization: Bearer <access_token>"

# Logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

3. **Password Reset**
```bash
# Request reset
curl -X POST http://localhost:8000/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Verify and reset
curl -X POST http://localhost:8000/api/auth/password-reset/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"<reset_token>","newPassword":"NewPassword123!"}'
```

## Monitoring

### Redis Monitoring

Monitor these Redis metrics:
- Memory usage
- Connected clients
- Commands per second
- Keyspace hits/misses

### Application Monitoring

Monitor these application metrics:
- Login success/failure rates
- Token refresh rates
- Session creation/termination rates
- 2FA completion rates
- Password reset request rates

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis is running: `redis-cli ping`
   - Verify connection settings in .env
   - Check firewall rules

2. **Token Validation Failed**
   - Verify JWT_SECRET is set correctly
   - Check token hasn't expired
   - Ensure token isn't blacklisted

3. **Session Not Found**
   - Check Redis is running
   - Verify session hasn't expired
   - Check Redis memory limits

4. **2FA OTP Invalid**
   - Verify OTP hasn't expired (10 min TTL)
   - Check Redis connection
   - Ensure OTP was stored correctly

## Migration Guide

### From Basic Auth to Enhanced Auth

1. **Install Dependencies**
```bash
cd services/shared/auth-middleware
npm install
npm run build

cd ../../identity-service
npm install
```

2. **Update Environment Variables**
Add Redis configuration to .env

3. **Update Routes**
Import and mount enhanced auth routes in app.ts

4. **Test Endpoints**
Verify all endpoints work correctly

5. **Update Client Applications**
Update clients to use new token refresh flow

## Best Practices

1. **Token Management**
   - Always use HTTPS in production
   - Store tokens securely on client (httpOnly cookies)
   - Implement token refresh before expiry
   - Clear tokens on logout

2. **Session Management**
   - Monitor active sessions regularly
   - Implement session timeout warnings
   - Allow users to view/manage sessions
   - Log session anomalies

3. **Security**
   - Rotate JWT secrets periodically
   - Monitor failed login attempts
   - Implement rate limiting
   - Use strong password policies
   - Enable 2FA for sensitive accounts

4. **Performance**
   - Use Redis connection pooling
   - Implement caching where appropriate
   - Monitor Redis memory usage
   - Set appropriate TTLs

## Future Enhancements

- [ ] Biometric authentication support
- [ ] OAuth2/OpenID Connect integration
- [ ] Hardware token support (YubiKey)
- [ ] Risk-based authentication
- [ ] Behavioral biometrics
- [ ] Session recording for compliance
- [ ] Advanced anomaly detection
- [ ] Passwordless authentication
