# Authentication Flow Review & Recommendations

## Current Authentication Architecture

### ✅ What's Working Well

#### 1. Shared Authentication Middleware (`@eazepay/auth-middleware`)
- ✅ Centralized JWT service
- ✅ Token generation and verification
- ✅ Role-based authorization
- ✅ Permission-based authorization
- ✅ Session validation support
- ✅ Proper error handling

#### 2. Identity Service
- ✅ User registration with role validation
- ✅ Password hashing (bcrypt)
- ✅ 2FA support (SMS, Biometric, Both)
- ✅ Account locking after failed attempts
- ✅ Government ID verification integration
- ✅ Session management
- ✅ Audit logging

#### 3. Security Features
- ✅ JWT with issuer/audience validation
- ✅ Token expiration (8h default)
- ✅ Refresh tokens (7d)
- ✅ Failed login attempt tracking
- ✅ Account locking (30 min after 5 failures)
- ✅ Password strength requirements

## ⚠️ Issues & Recommendations

### 🔴 Critical Issues

#### 1. **JWT Secret Management**

**Current State:**
```typescript
jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
```

**Issues:**
- Fallback to weak default secret
- No validation of secret strength
- Same secret across all services

**Recommendations:**
```typescript
// ✅ Better approach
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters');
}

// ✅ Use different secrets per service or shared secret management
const jwtService = new JWTService({
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: '8h',
  issuer: 'eazepay-identity-service', // Service-specific
  audience: 'eazepay-services'
});
```

#### 2. **Session Validation Not Implemented**

**Current State:**
```typescript
// Session validation is optional but not implemented
const jwtService = new JWTService({
  validateSession: false, // Not checking if session is still valid
});
```

**Issues:**
- Tokens remain valid even after logout
- No way to invalidate tokens
- Security risk if token is compromised

**Recommendations:**
```typescript
// ✅ Implement session validation
const jwtService = new JWTService({
  jwtSecret: JWT_SECRET,
  validateSession: true,
  sessionValidator: async (sessionId: string) => {
    // Check if session exists in Redis or database
    const session = await redis.get(`session:${sessionId}`);
    return session !== null;
  }
});

// ✅ On logout, invalidate session
async function logout(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}
```

#### 3. **2FA Flow Incomplete**

**Current State:**
- 2FA initiated but OTP storage commented out
- No biometric verification implementation
- Session token used for 2FA step is not properly secured

**Issues:**
```typescript
// ❌ OTP storage commented out
// await redis.setex(`otp:${user.id}`, 600, otp);

// ❌ Biometric verification not implemented
if (user.twoFactorMethod === TwoFactorMethod.BIOMETRIC) {
  // No implementation
}
```

**Recommendations:**
```typescript
// ✅ Implement OTP storage
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Store OTP
await redis.setex(`otp:${user.id}`, 600, otp);

// Verify OTP
const storedOTP = await redis.get(`otp:${user.id}`);
if (storedOTP !== otp) {
  throw new UnauthorizedError('Invalid OTP');
}

// Delete OTP after successful verification
await redis.del(`otp:${user.id}`);

// ✅ Implement biometric verification
if (user.twoFactorMethod === TwoFactorMethod.BIOMETRIC) {
  const verified = await biometricService.verify(user.id, biometricData);
  if (!verified) {
    throw new UnauthorizedError('Biometric verification failed');
  }
}
```

### 🟡 Important Improvements

#### 4. **Token Refresh Flow**

**Current State:**
- Refresh tokens generated but no refresh endpoint

**Recommendations:**
```typescript
// ✅ Add token refresh endpoint
router.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    // Verify refresh token
    const payload = jwtService.verifyToken(refreshToken);
    
    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }
    
    // Check if session is still valid
    const session = await sessionRepo.findOne({
      where: { id: payload.sessionId }
    });
    
    if (!session || session.isExpired()) {
      throw new UnauthorizedError('Session expired');
    }
    
    // Generate new access token
    const newAccessToken = jwtService.generateToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      permissions: payload.permissions
    });
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

#### 5. **Service-to-Service Authentication**

**Current State:**
- No authentication between services
- Services trust all internal requests

**Recommendations:**
```typescript
// ✅ Add service authentication
const SERVICE_API_KEY = process.env.SERVICE_API_KEY;

// Middleware for service-to-service calls
export function authenticateService(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey !== SERVICE_API_KEY) {
    return res.status(401).json({ error: 'Invalid service credentials' });
  }
  
  next();
}

// Use in internal endpoints
router.post('/internal/verify-user', 
  authenticateService,
  handler
);
```

#### 6. **Rate Limiting on Auth Endpoints**

**Current State:**
- General rate limiting exists
- No specific rate limiting for auth endpoints

**Recommendations:**
```typescript
// ✅ Stricter rate limiting for auth
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/auth/login', authRateLimit, loginHandler);
router.post('/auth/register', authRateLimit, registerHandler);
```

#### 7. **Password Reset Flow**

**Current State:**
- Not implemented

**Recommendations:**
```typescript
// ✅ Implement password reset
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    // Don't reveal if user exists
    return res.json({ message: 'If email exists, reset link sent' });
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = await hashPassword(resetToken);
  
  // Store with expiry
  await redis.setex(
    `reset:${user.id}`,
    3600, // 1 hour
    resetTokenHash
  );
  
  // Send email with reset link
  await sendEmail(user.email, `Reset link: /reset-password?token=${resetToken}`);
  
  res.json({ message: 'If email exists, reset link sent' });
});

router.post('/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  // Verify token and update password
  // ...
});
```

### 🟢 Nice to Have

#### 8. **Multi-Device Session Management**

**Recommendations:**
```typescript
// ✅ Track multiple sessions per user
interface Session {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    deviceType: string;
  };
  createdAt: Date;
  lastActivityAt: Date;
}

// Allow users to view and revoke sessions
router.get('/auth/sessions', authenticate, async (req, res) => {
  const sessions = await sessionRepo.find({
    where: { userId: req.user.userId }
  });
  res.json({ sessions });
});

router.delete('/auth/sessions/:sessionId', authenticate, async (req, res) => {
  await sessionRepo.delete({ id: req.params.sessionId });
  await redis.del(`session:${req.params.sessionId}`);
  res.json({ message: 'Session revoked' });
});
```

#### 9. **Audit Logging Enhancement**

**Recommendations:**
```typescript
// ✅ Log all authentication events
async function logAuthEvent(
  userId: string,
  action: string,
  success: boolean,
  metadata?: any
) {
  await auditRepo.save({
    userId,
    action,
    success,
    metadata: {
      ...metadata,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
  });
}

// Log events
await logAuthEvent(user.id, 'LOGIN', true);
await logAuthEvent(user.id, 'LOGIN_FAILED', false);
await logAuthEvent(user.id, 'LOGOUT', true);
await logAuthEvent(user.id, '2FA_VERIFIED', true);
```

#### 10. **Token Blacklisting**

**Recommendations:**
```typescript
// ✅ Blacklist tokens on logout
async function logout(token: string, sessionId: string) {
  const decoded = jwtService.decodeToken(token);
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
  
  // Blacklist token until it expires
  await redis.setex(`blacklist:${token}`, expiresIn, '1');
  
  // Invalidate session
  await redis.del(`session:${sessionId}`);
}

// Check blacklist in auth middleware
export async function authenticate(req, res, next) {
  const token = extractToken(req);
  
  // Check if token is blacklisted
  const isBlacklisted = await redis.get(`blacklist:${token}`);
  if (isBlacklisted) {
    throw new UnauthorizedError('Token has been revoked');
  }
  
  // Continue with normal verification
  // ...
}
```

## Recommended Implementation Priority

### Phase 1: Critical Security (Immediate)
1. ✅ Enforce strong JWT secret validation
2. ✅ Implement session validation with Redis
3. ✅ Complete 2FA flow (OTP storage + biometric)
4. ✅ Add token refresh endpoint
5. ✅ Implement token blacklisting on logout

### Phase 2: Important Features (Week 1)
6. ✅ Add service-to-service authentication
7. ✅ Implement password reset flow
8. ✅ Add stricter rate limiting on auth endpoints
9. ✅ Enhance audit logging

### Phase 3: Nice to Have (Week 2-3)
10. ✅ Multi-device session management
11. ✅ Session activity tracking
12. ✅ Email verification on registration
13. ✅ Account recovery options

## Updated Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│ 1. User submits registration                                │
│ 2. Validate input (email, phone, password)                  │
│ 3. Hash password                                            │
│ 4. Create user (status: PENDING)                           │
│ 5. Attempt government ID verification (if customer)        │
│ 6. Send verification email                                 │
│ 7. Notify admins for manual verification                   │
│ 8. Return: "Registration successful, awaiting verification"│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                              │
├─────────────────────────────────────────────────────────────┤
│ 1. User submits email + password                            │
│ 2. Verify credentials                                       │
│ 3. Check account status (verified, locked)                 │
│ 4. Check if 2FA required                                   │
│    ├─ YES: Generate session token, send OTP               │
│    │        Return: { requires2FA: true, sessionToken }    │
│    └─ NO:  Generate JWT + refresh token                   │
│            Create session in Redis                         │
│            Return: { accessToken, refreshToken, user }     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      2FA FLOW                                │
├─────────────────────────────────────────────────────────────┤
│ 1. User submits sessionToken + OTP/biometric               │
│ 2. Verify session token                                    │
│ 3. Verify OTP (from Redis) OR biometric data              │
│ 4. Generate JWT + refresh token                           │
│ 5. Create session in Redis                                │
│ 6. Delete OTP from Redis                                  │
│ 7. Return: { accessToken, refreshToken, user }            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   TOKEN REFRESH FLOW                         │
├─────────────────────────────────────────────────────────────┤
│ 1. User submits refresh token                              │
│ 2. Verify refresh token                                    │
│ 3. Check session validity in Redis                         │
│ 4. Generate new access token                               │
│ 5. Return: { accessToken }                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     LOGOUT FLOW                              │
├─────────────────────────────────────────────────────────────┤
│ 1. User submits access token                               │
│ 2. Extract session ID from token                           │
│ 3. Blacklist token in Redis (until expiry)                │
│ 4. Delete session from Redis                               │
│ 5. Return: { message: 'Logged out successfully' }         │
└─────────────────────────────────────────────────────────────┘
```

## Security Checklist

- [x] Password hashing (bcrypt)
- [x] JWT with expiration
- [x] Refresh tokens
- [x] Role-based access control
- [x] Permission-based access control
- [x] Failed login attempt tracking
- [x] Account locking
- [x] 2FA support
- [ ] **Session validation (IMPLEMENT)**
- [ ] **Token blacklisting (IMPLEMENT)**
- [ ] **Strong JWT secret enforcement (IMPLEMENT)**
- [ ] **Complete 2FA flow (IMPLEMENT)**
- [ ] **Token refresh endpoint (IMPLEMENT)**
- [ ] Service-to-service authentication
- [ ] Password reset flow
- [ ] Email verification
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging

## Conclusion

### Current Status: ⚠️ **MOSTLY GOOD, NEEDS CRITICAL FIXES**

The authentication architecture is well-designed with good foundations:
- ✅ Centralized auth middleware
- ✅ Proper JWT implementation
- ✅ Role and permission support
- ✅ 2FA framework

However, **critical security gaps** must be addressed before production:
1. **Session validation** - Tokens can't be invalidated
2. **2FA completion** - OTP storage and biometric verification incomplete
3. **JWT secret validation** - Weak default secret allowed
4. **Token refresh** - No refresh endpoint
5. **Token blacklisting** - No logout mechanism

**Recommendation**: Implement Phase 1 (Critical Security) items immediately before production deployment.

---

**Reviewed**: November 6, 2025  
**Status**: Needs Critical Fixes  
**Priority**: HIGH
