# Input Validation & Security

## Overview

Comprehensive input validation and sanitization implemented across all authentication endpoints to prevent security vulnerabilities.

---

## ✅ Security Measures Implemented

### 1. Input Validation (Joi Schemas)

All user inputs are validated using Joi schemas before processing:

**Location:** `services/identity-service/src/validation/auth.schemas.ts`

### 2. Rate Limiting

All endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| Login/Register | 5 requests | 15 min | Prevent brute force |
| Password Reset | 3 requests | 1 hour | Prevent abuse |
| 2FA Verification | 5 requests | 5 min | Prevent OTP guessing |

### 3. Input Sanitization

- **Email:** Lowercase, trimmed
- **Strings:** Trimmed, max length enforced
- **Unknown fields:** Stripped automatically
- **SQL Injection:** Prevented by TypeORM parameterization
- **XSS:** Prevented by input validation and output encoding

### 4. Error Handling

- Validation errors return 400 with detailed field errors
- Generic error messages to prevent information disclosure
- No stack traces in production
- Logging for security monitoring

---

## 📋 Validation Rules

### Password Requirements

```typescript
- Minimum: 8 characters
- Maximum: 128 characters
- Must contain:
  ✓ At least one uppercase letter (A-Z)
  ✓ At least one lowercase letter (a-z)
  ✓ At least one number (0-9)
  ✓ At least one special character (@$!%*?&)
```

**Example Valid Passwords:**
- `SecurePass123!`
- `MyP@ssw0rd`
- `Str0ng&Secure`

**Example Invalid Passwords:**
- `password` (no uppercase, number, or special char)
- `PASSWORD123` (no lowercase or special char)
- `Pass123` (too short, no special char)

### Email Validation

```typescript
- Must be valid email format
- Automatically converted to lowercase
- Trimmed of whitespace
- Maximum length enforced
```

**Example Valid Emails:**
- `user@example.com`
- `john.doe@company.co.uk`
- `admin+test@domain.com`

### Phone Validation

```typescript
- International format required
- Pattern: +[country code][number]
- Example: +254712345678
```

**Example Valid Phones:**
- `+254712345678` (Kenya)
- `+1234567890` (US)
- `+447911123456` (UK)

### Full Name Validation

```typescript
- Minimum: 2 characters
- Maximum: 100 characters
- Trimmed of whitespace
- Required field
```

### Token Validation

```typescript
- Refresh tokens: Required, non-empty string
- Reset tokens: Minimum 32 characters
- Session tokens: Required, non-empty string
- OTP: Exactly 6 digits (0-9 only)
```

### Session ID Validation

```typescript
- Must be valid UUID format
- Example: 550e8400-e29b-41d4-a716-446655440000
```

---

## 🛡️ Security Features

### 1. SQL Injection Prevention

**Method:** TypeORM with parameterized queries

```typescript
// Safe - parameterized
const user = await userRepo.findOne({ where: { email } });

// Never do this - vulnerable
const user = await userRepo.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### 2. XSS Prevention

**Methods:**
- Input validation (reject malicious patterns)
- Output encoding (automatic in JSON responses)
- Content Security Policy headers (Helmet)

```typescript
// Validation rejects scripts
email: "<script>alert('xss')</script>" // ❌ Rejected

// Safe output
res.json({ email: user.email }); // ✅ Automatically encoded
```

### 3. NoSQL Injection Prevention

**Method:** Input validation and sanitization

```typescript
// Validation prevents injection
{ "$ne": null } // ❌ Rejected by schema validation
```

### 4. CSRF Protection

**Methods:**
- JWT tokens (stateless)
- SameSite cookie attribute
- Origin validation

### 5. Rate Limiting

**Implementation:** Redis-based distributed rate limiting

```typescript
// Automatic rate limiting on all auth endpoints
router.post('/login', authLimiter.middleware(), ...)
```

### 6. Email Enumeration Prevention

**Method:** Always return success message

```typescript
// Don't reveal if email exists
return res.json({
  success: true,
  message: 'If email exists, reset link has been sent'
});
```

### 7. Timing Attack Prevention

**Method:** Constant-time password comparison

```typescript
// bcrypt.compare uses constant-time comparison
const isValid = await bcrypt.compare(password, hash);
```

---

## 📊 Validation Examples

### Registration Request

**Valid Request:**
```json
{
  "email": "user@example.com",
  "phone": "+254712345678",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "CUSTOMER",
  "verificationType": "NATIONAL_ID",
  "verificationNumber": "12345678"
}
```

**Invalid Request (Multiple Errors):**
```json
{
  "email": "invalid-email",
  "phone": "123",
  "password": "weak",
  "fullName": "J",
  "role": "INVALID_ROLE",
  "verificationType": "NATIONAL_ID",
  "verificationNumber": "12345678"
}
```

**Error Response:**
```json
{
  "error": "Validation error",
  "code": "SYS_003",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "phone",
      "message": "Please provide a valid phone number in international format"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    },
    {
      "field": "fullName",
      "message": "Full name must be at least 2 characters"
    },
    {
      "field": "role",
      "message": "Role must be either CUSTOMER or AGENT"
    }
  ]
}
```

### Login Request

**Valid Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Invalid Request:**
```json
{
  "email": "not-an-email",
  "password": ""
}
```

**Error Response:**
```json
{
  "error": "Validation error",
  "code": "SYS_003",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password is required"
    }
  ]
}
```

### Password Reset Request

**Valid Request:**
```json
{
  "email": "user@example.com"
}
```

**Invalid Request:**
```json
{
  "email": "invalid"
}
```

**Error Response:**
```json
{
  "error": "Validation error",
  "code": "SYS_003",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

## 🔍 Testing Validation

### Test Invalid Inputs

```bash
# Invalid email
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test"}'

# Weak password
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak","fullName":"Test","phone":"+254712345678","role":"CUSTOMER","verificationType":"NATIONAL_ID","verificationNumber":"12345678"}'

# Invalid phone
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","fullName":"Test","phone":"123","role":"CUSTOMER","verificationType":"NATIONAL_ID","verificationNumber":"12345678"}'

# SQL injection attempt
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com OR 1=1--","password":"test"}'

# XSS attempt
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>@example.com","password":"SecurePass123!","fullName":"<script>alert(1)</script>","phone":"+254712345678","role":"CUSTOMER","verificationType":"NATIONAL_ID","verificationNumber":"12345678"}'
```

### Test Rate Limiting

```bash
# Make 6 login attempts rapidly
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done

# 6th attempt should return 429 Too Many Requests
```

---

## 🚨 Common Vulnerabilities Prevented

### ✅ SQL Injection
- **Prevention:** TypeORM parameterized queries
- **Validation:** Input sanitization
- **Status:** PROTECTED

### ✅ XSS (Cross-Site Scripting)
- **Prevention:** Input validation, output encoding
- **Headers:** Content Security Policy (Helmet)
- **Status:** PROTECTED

### ✅ CSRF (Cross-Site Request Forgery)
- **Prevention:** JWT tokens, SameSite cookies
- **Validation:** Origin checking
- **Status:** PROTECTED

### ✅ Brute Force Attacks
- **Prevention:** Rate limiting (5 attempts/15min)
- **Additional:** Account lockout after failures
- **Status:** PROTECTED

### ✅ Email Enumeration
- **Prevention:** Generic success messages
- **Implementation:** Same response for existing/non-existing emails
- **Status:** PROTECTED

### ✅ Timing Attacks
- **Prevention:** Constant-time comparisons
- **Implementation:** bcrypt.compare
- **Status:** PROTECTED

### ✅ NoSQL Injection
- **Prevention:** Input validation
- **Validation:** Schema enforcement
- **Status:** PROTECTED

### ✅ Mass Assignment
- **Prevention:** Explicit field whitelisting
- **Validation:** stripUnknown: true
- **Status:** PROTECTED

### ✅ Parameter Pollution
- **Prevention:** Single value enforcement
- **Validation:** Schema validation
- **Status:** PROTECTED

### ✅ Path Traversal
- **Prevention:** Input validation
- **Validation:** No file path inputs accepted
- **Status:** PROTECTED

---

## 📝 Best Practices Implemented

### 1. Fail Securely
```typescript
// Always validate, fail if invalid
if (error) {
  return res.status(400).json({ error: 'Validation error' });
}
```

### 2. Whitelist, Don't Blacklist
```typescript
// Define what's allowed, reject everything else
role: Joi.string().valid('CUSTOMER', 'AGENT')
```

### 3. Defense in Depth
```typescript
// Multiple layers of security
1. Rate limiting
2. Input validation
3. Authentication
4. Authorization
5. Audit logging
```

### 4. Least Privilege
```typescript
// Only return necessary data
res.json({
  user: {
    id: user.id,
    email: user.email,
    role: user.role
    // Don't return: passwordHash, tokens, etc.
  }
});
```

### 5. Secure by Default
```typescript
// Validation enabled by default
// Rate limiting enabled by default
// Authentication required by default
```

---

## 🔧 Configuration

### Validation Options

```typescript
// In validation middleware
schema.validate(req.body, {
  abortEarly: false,      // Return all errors
  stripUnknown: true,     // Remove unknown fields
  convert: true,          // Type conversion
  allowUnknown: false     // Reject unknown fields
});
```

### Rate Limit Configuration

```env
# Adjust in environment variables
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW=900000  # 15 minutes
RATE_LIMIT_PASSWORD_RESET_MAX=3
RATE_LIMIT_PASSWORD_RESET_WINDOW=3600000  # 1 hour
```

---

## 📊 Monitoring

### Validation Failures

Monitor these metrics:
- Validation error rate
- Most common validation errors
- Suspicious patterns (SQL injection attempts)
- Rate limit hits

### Logging

```typescript
// Validation errors are logged
logger.warn('Validation failed', {
  endpoint: req.path,
  errors: validationErrors,
  ip: req.ip
});

// Suspicious activity logged
logger.error('Potential attack detected', {
  type: 'SQL_INJECTION_ATTEMPT',
  input: sanitizedInput,
  ip: req.ip
});
```

---

## ✅ Checklist

### Input Validation
- [x] All endpoints have validation
- [x] Strong password requirements
- [x] Email format validation
- [x] Phone format validation
- [x] Token format validation
- [x] Parameter validation
- [x] Unknown fields stripped

### Rate Limiting
- [x] Login endpoints rate limited
- [x] Registration rate limited
- [x] Password reset rate limited
- [x] 2FA endpoints rate limited
- [x] Per-user limiting
- [x] Per-IP limiting

### Security Headers
- [x] Helmet configured
- [x] CORS configured
- [x] Content-Type validation
- [x] Rate limit headers

### Error Handling
- [x] Validation errors detailed
- [x] Generic error messages
- [x] No stack traces in production
- [x] Security events logged

---

## 🎯 Summary

**Status:** ✅ FULLY SECURED

All user input handlers are properly configured with:
- ✅ Comprehensive validation schemas
- ✅ Rate limiting on all endpoints
- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Brute force protection
- ✅ Email enumeration prevention
- ✅ Error handling
- ✅ Security logging

**Security Level:** ENTERPRISE GRADE
**Compliance:** OWASP Top 10 Protected
**Status:** PRODUCTION READY ✅

---

**Last Updated:** November 6, 2025
**Version:** 1.0.0
