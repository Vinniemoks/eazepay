# Eazepay Security Quick Reference

Quick reference guide for developers working with Eazepay security features.

---

## 🚀 Quick Start

```bash
# 1. Generate secrets
node scripts/security/generate-secrets.js --save

# 2. Setup TLS
bash scripts/security/setup-tls-certificates.sh

# 3. Deploy securely
bash scripts/security/deploy-secure.sh

# 4. Verify security
bash scripts/security/verify-security.sh
```

---

## 🔐 Authentication

### Protect Routes

```typescript
import { authenticate, requireRole, UserRole } from '@eazepay/auth-middleware';

// Require authentication
router.get('/protected', authenticate, handler);

// Require specific role
router.get('/admin', authenticate, requireRole(UserRole.ADMIN), handler);

// Require any of multiple roles
router.get('/reports', 
  authenticate, 
  requireAnyRole([UserRole.ADMIN, UserRole.MANAGER]), 
  handler
);
```

### Generate Tokens

```typescript
import { JWTService } from '@eazepay/auth-middleware';

const jwtService = new JWTService({
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: '8h'
});

const token = jwtService.generateToken({
  userId: user.id,
  email: user.email,
  role: user.role,
  sessionId: sessionId,
  permissions: user.permissions
});
```

### Session Management

```typescript
import { SessionManager } from '@eazepay/auth-middleware';

const sessionManager = new SessionManager(redis, 28800);

// Create session
await sessionManager.createSession(
  sessionId,
  userId,
  email,
  role,
  deviceInfo
);

// Validate session
const isValid = await sessionManager.validateSession(sessionId);

// Invalidate session
await sessionManager.invalidateSession(sessionId);
```

---

## 🔒 Encryption

### Encrypt Data

```typescript
import { DataEncryption } from '@eazepay/security';

const encryption = new DataEncryption(process.env.ENCRYPTION_KEY!);

// Encrypt string
const encrypted = encryption.encrypt('sensitive data');

// Decrypt string
const decrypted = encryption.decrypt(encrypted);

// Encrypt object
const encryptedObj = encryption.encryptObject({ ssn: '123-45-6789' });

// Decrypt object
const decryptedObj = encryption.decryptObject(encryptedObj);
```

### Encrypt PII Fields

```typescript
// Encrypt specific fields
const user = {
  email: 'user@example.com',
  ssn: '123-45-6789',
  phone: '+1234567890'
};

const encrypted = encryption.encryptPII(user, ['ssn', 'phone']);

// Decrypt when needed
const decrypted = encryption.decryptPII(encrypted, ['ssn', 'phone']);
```

### TypeORM Decorator

```typescript
import { Entity, Column } from 'typeorm';
import { Encrypted } from '@eazepay/security';

@Entity()
class User {
  @Column()
  @Encrypted(encryptionService)
  ssn: string;
}
```

---

## 📝 Audit Logging

### Log Events

```typescript
import { AuditLogger } from '@eazepay/security';

const auditLogger = new AuditLogger({
  serviceName: 'identity-service',
  redis: redisClient
});

// Log authentication
await auditLogger.logAuth({
  userId: user.id,
  action: 'login',
  status: 'success',
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});

// Log data access
await auditLogger.logDataAccess({
  userId: user.id,
  action: 'read',
  resource: 'transaction',
  resourceId: transaction.id,
  status: 'success'
});

// Log security event
await auditLogger.logSecurity({
  userId: user.id,
  action: 'unauthorized_access',
  resource: 'admin_panel',
  status: 'failure',
  severity: 'high',
  ipAddress: req.ip
});
```

---

## 🚨 Security Monitoring

### Track Security Events

```typescript
import { SecurityMonitor } from '@eazepay/security';

const securityMonitor = new SecurityMonitor({
  redis: redisClient,
  bruteForceThreshold: 5,
  enableAutoBlock: true
});

// Track failed login
await securityMonitor.trackFailedLogin(email, ipAddress);

// Track suspicious activity
await securityMonitor.trackSuspiciousActivity(
  userId,
  'multiple_failed_transactions'
);

// Check if blocked
const isBlocked = await securityMonitor.isBlocked(email);

// Block manually
await securityMonitor.blockIdentifier(email, 3600); // 1 hour
```

### Handle Alerts

```typescript
securityMonitor.on('securityAlert', (alert) => {
  console.error('Security Alert:', alert);
  
  if (alert.severity === 'critical') {
    // Notify security team
    notifySecurityTeam(alert);
  }
});
```

---

## 🛡️ Input Validation

### Validate Requests

```typescript
import { validate, validateBody } from '@eazepay/validation';
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

router.post('/login', validateBody(schema), handler);
```

### Sanitize Input

```typescript
import { sanitize, sanitizeInput } from '@eazepay/validation';

// Middleware
router.post('/endpoint', sanitize(), handler);

// Manual sanitization
const clean = sanitizeInput(userInput, {
  trim: true,
  escape: true,
  stripLow: true
});
```

---

## 🔑 Secrets Management

### Get Secrets

```typescript
import { SecretsManager } from '@eazepay/security';

const secretsManager = new SecretsManager({
  provider: 'aws',
  region: 'us-east-1'
});

// Get secret
const jwtSecret = await secretsManager.getSecret('eazepay/JWT_SECRET');

// Generate secret
const newSecret = secretsManager.generateSecret(64);

// Rotate secret
await secretsManager.rotateSecret('JWT_SECRET');
```

### Auto-Rotation

```typescript
// Enable automatic rotation (every 30 days)
secretsManager.enableAutoRotation('JWT_SECRET', 2592000);

secretsManager.on('secretRotated', ({ name, timestamp }) => {
  console.log(`Secret ${name} rotated at ${timestamp}`);
  // Trigger service restart
});
```

---

## 🌐 TLS Configuration

### HTTPS Server

```typescript
import https from 'https';
import { TLSManager } from '@eazepay/security';

const tlsManager = new TLSManager({
  certPath: '/etc/ssl/certs/server-cert.pem',
  keyPath: '/etc/ssl/private/server-key.pem',
  minVersion: 'TLSv1.3'
});

const server = https.createServer(
  tlsManager.getServerOptions(),
  app
);

server.listen(443);
```

### mTLS Client

```typescript
import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
  cert: fs.readFileSync('/etc/ssl/certs/client-cert.pem'),
  key: fs.readFileSync('/etc/ssl/private/client-key.pem'),
  ca: fs.readFileSync('/etc/ssl/certs/ca-cert.pem')
});

const response = await axios.get('https://service:8000/api', {
  httpsAgent: agent
});
```

---

## 🚦 Rate Limiting

### Apply Rate Limits

```typescript
import { RateLimiter } from '@eazepay/auth-middleware';

const rateLimiter = new RateLimiter(redis, {
  windowMs: 900000, // 15 minutes
  maxRequests: 100
});

router.use('/api', rateLimiter.middleware());
```

### Custom Rate Limits

```typescript
// Auth endpoints (stricter)
const authLimiter = new RateLimiter(redis, {
  windowMs: 300000, // 5 minutes
  maxRequests: 5
});

router.post('/login', authLimiter.middleware(), handler);
```

---

## 🔍 Security Headers

### Apply Security Middleware

```typescript
import { createSecurityMiddleware } from '@eazepay/security';

const securityMiddleware = createSecurityMiddleware({
  cors: {
    allowedOrigins: ['https://app.eazepay.com'],
    credentials: true
  },
  helmet: {
    contentSecurityPolicy: true,
    hsts: true
  }
});

app.use(securityMiddleware);
```

---

## 🗄️ Database Security

### Secure Connection

```typescript
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync('/etc/ssl/certs/ca-cert.pem'),
    rejectUnauthorized: true
  }
});
```

### Redis with TLS

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6380,
  password: process.env.REDIS_PASSWORD,
  tls: {
    ca: fs.readFileSync('/etc/ssl/certs/ca-cert.pem')
  }
});
```

---

## 🧪 Testing Security

### Test Authentication

```bash
# Login
curl -X POST https://api.eazepay.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token
curl https://api.eazepay.com/api/protected \
  -H "Authorization: Bearer <token>"
```

### Test Rate Limiting

```bash
# Trigger rate limit
for i in {1..30}; do
  curl https://api.eazepay.com/health
done
```

### Test TLS

```bash
# Check TLS version
openssl s_client -connect api.eazepay.com:443 -tls1_3

# Check certificate
openssl s_client -connect api.eazepay.com:443 -showcerts
```

### Test Security Headers

```bash
# Check headers
curl -I https://api.eazepay.com/health

# Should see:
# Strict-Transport-Security
# X-Frame-Options
# X-Content-Type-Options
# Content-Security-Policy
```

---

## 📚 Common Patterns

### Secure API Endpoint

```typescript
import { authenticate, requireRole, validateBody, sanitize } from '@eazepay/middleware';
import { auditLogger, securityMonitor } from '@eazepay/security';

router.post('/api/transaction',
  // Security middleware
  sanitize(),
  authenticate,
  requireRole(UserRole.USER),
  validateBody(transactionSchema),
  rateLimiter.middleware(),
  
  // Handler
  async (req, res) => {
    try {
      // Process transaction
      const result = await processTransaction(req.body);
      
      // Log success
      await auditLogger.logTransaction({
        userId: req.user.userId,
        action: 'create',
        resourceId: result.id,
        status: 'success'
      });
      
      res.json({ success: true, data: result });
    } catch (error) {
      // Log failure
      await auditLogger.logTransaction({
        userId: req.user.userId,
        action: 'create',
        resourceId: '',
        status: 'failure'
      });
      
      // Track suspicious activity
      await securityMonitor.trackSuspiciousActivity(
        req.user.userId,
        'failed_transaction'
      );
      
      res.status(500).json({ success: false, error: 'Transaction failed' });
    }
  }
);
```

---

## 🆘 Troubleshooting

### Check Logs

```bash
# Audit logs
tail -f logs/audit-*.log

# Service logs
docker-compose logs -f identity-service

# Security alerts
docker-compose logs | grep -i "security\|alert"
```

### Verify Configuration

```bash
# Run security verification
bash scripts/security/verify-security.sh

# Check environment
env | grep -E "JWT|API_KEY|DB_|REDIS_"

# Test endpoints
curl -k https://localhost:443/health
```

---

## 📞 Support

- **Documentation:** `docs/security/SECURITY_IMPLEMENTATION_GUIDE.md`
- **Email:** security@eazepay.com
- **Emergency:** +1-XXX-XXX-XXXX (24/7)

---

## 🔗 Related Documentation

- [Security Implementation Guide](SECURITY_IMPLEMENTATION_GUIDE.md)
- [Security Upgrade Summary](../../SECURITY_UPGRADE_SUMMARY.md)
- [Security Checklist](../../SECURITY_CHECKLIST.md)
- [API Documentation](../api/)
