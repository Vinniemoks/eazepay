# Eazepay Security Implementation Guide

## Overview

This guide provides comprehensive instructions for implementing enterprise-grade security across the Eazepay microservices platform.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication & Authorization](#authentication--authorization)
3. [Secrets Management](#secrets-management)
4. [TLS/SSL Configuration](#tlsssl-configuration)
5. [Database Security](#database-security)
6. [Network Security](#network-security)
7. [Audit Logging](#audit-logging)
8. [Security Monitoring](#security-monitoring)
9. [Compliance](#compliance)
10. [Incident Response](#incident-response)

---

## Quick Start

### 1. Generate Secrets

```bash
# Generate all required secrets
node scripts/security/generate-secrets.js --save

# Review generated secrets
cat .env.generated
```

### 2. Setup TLS Certificates

```bash
# For development (self-signed)
bash scripts/security/setup-tls-certificates.sh

# For production (Let's Encrypt)
certbot certonly --standalone -d api.eazepay.com
```

### 3. Configure Secrets Manager

**AWS Secrets Manager:**
```bash
# Store secrets in AWS
aws secretsmanager create-secret \
  --name eazepay/JWT_SECRET \
  --secret-string "your-generated-secret"
```

**Azure Key Vault:**
```bash
# Store secrets in Azure
az keyvault secret set \
  --vault-name eazepay-vault \
  --name JWT-SECRET \
  --value "your-generated-secret"
```

### 4. Deploy Secure Configuration

```bash
# Use secure Docker Compose
docker-compose -f docker-compose.secure.yml up -d

# Or deploy to Kubernetes
kubectl apply -f k8s/secure/
```

---

## Authentication & Authorization

### JWT Configuration

**Environment Variables:**
```env
JWT_SECRET=<64-char-base64-secret>
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=eazepay-services
JWT_AUDIENCE=eazepay-services
```

**Implementation:**
```typescript
import { JWTService } from '@eazepay/auth-middleware';

const jwtService = new JWTService({
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: '8h',
  issuer: 'eazepay-services',
  audience: 'eazepay-services'
});
```

### Session Management

**Redis-backed sessions:**
```typescript
import { SessionManager } from '@eazepay/auth-middleware';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6380,
  password: process.env.REDIS_PASSWORD,
  tls: {
    ca: fs.readFileSync('/etc/ssl/certs/ca-cert.pem')
  }
});

const sessionManager = new SessionManager(redis, 28800); // 8 hours
```

### Role-Based Access Control

```typescript
import { requireRole, requireAnyRole } from '@eazepay/auth-middleware';

// Require specific role
router.get('/admin/users', 
  authenticate, 
  requireRole(UserRole.ADMIN), 
  handler
);

// Require any of multiple roles
router.get('/reports', 
  authenticate, 
  requireAnyRole([UserRole.ADMIN, UserRole.MANAGER]), 
  handler
);
```

---

## Secrets Management

### Using AWS Secrets Manager

**Setup:**
```typescript
import { SecretsManager } from '@eazepay/security';

const secretsManager = new SecretsManager({
  provider: 'aws',
  region: 'us-east-1',
  cacheEnabled: true,
  cacheTTL: 3600
});

// Get secret
const jwtSecret = await secretsManager.getSecret('eazepay/JWT_SECRET');
```

### Using Azure Key Vault

```typescript
const secretsManager = new SecretsManager({
  provider: 'azure',
  vaultUrl: 'https://eazepay-vault.vault.azure.net',
  cacheEnabled: true
});
```

### Secrets Rotation

**Automatic rotation (every 30 days):**
```typescript
secretsManager.enableAutoRotation('JWT_SECRET', 2592000);

secretsManager.on('secretRotated', ({ name, timestamp }) => {
  console.log(`Secret ${name} rotated at ${timestamp}`);
  // Trigger service restart
});
```

**Manual rotation:**
```bash
# Dry run
DRY_RUN=true bash scripts/security/rotate-secrets.sh

# Actual rotation
bash scripts/security/rotate-secrets.sh
```

---

## TLS/SSL Configuration

### Generate Certificates

**Development (self-signed):**
```bash
bash scripts/security/setup-tls-certificates.sh
```

**Production (Let's Encrypt):**
```bash
# Install certbot
apt-get install certbot

# Generate certificate
certbot certonly --standalone \
  -d api.eazepay.com \
  -d admin.eazepay.com \
  --email admin@eazepay.com \
  --agree-tos

# Auto-renewal
certbot renew --dry-run
```

### Enable TLS in Services

**Node.js/Express:**
```typescript
import https from 'https';
import fs from 'fs';
import { TLSManager } from '@eazepay/security';

const tlsManager = new TLSManager({
  certPath: '/etc/ssl/certs/server-cert.pem',
  keyPath: '/etc/ssl/private/server-key.pem',
  caPath: '/etc/ssl/certs/ca-cert.pem',
  minVersion: 'TLSv1.3',
  enableMTLS: true
});

const server = https.createServer(
  tlsManager.getServerOptions(),
  app
);

server.listen(443);
```

### mTLS for Service-to-Service Communication

```typescript
import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
  cert: fs.readFileSync('/etc/ssl/certs/client-cert.pem'),
  key: fs.readFileSync('/etc/ssl/private/client-key.pem'),
  ca: fs.readFileSync('/etc/ssl/certs/ca-cert.pem'),
  rejectUnauthorized: true
});

const response = await axios.get('https://internal-service:8000/api', {
  httpsAgent: agent
});
```

---

## Database Security

### PostgreSQL with SSL

**Configuration:**
```bash
# postgresql.conf
ssl = on
ssl_cert_file = '/etc/ssl/certs/server-cert.pem'
ssl_key_file = '/etc/ssl/private/server-key.pem'
ssl_ca_file = '/etc/ssl/certs/ca-cert.pem'
ssl_min_protocol_version = 'TLSv1.3'
ssl_ciphers = 'HIGH:!aNULL:!MD5'
```

**Connection:**
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

### Encryption at Rest

**Field-level encryption:**
```typescript
import { DataEncryption } from '@eazepay/security';

const encryption = new DataEncryption(process.env.ENCRYPTION_KEY!);

// Encrypt sensitive fields
const user = {
  email: 'user@example.com',
  ssn: '123-45-6789',
  phone: '+1234567890'
};

const encrypted = encryption.encryptPII(user, ['ssn', 'phone']);

// Decrypt when needed
const decrypted = encryption.decryptPII(encrypted, ['ssn', 'phone']);
```

**TypeORM decorator:**
```typescript
import { Entity, Column } from 'typeorm';
import { Encrypted } from '@eazepay/security';

@Entity()
class User {
  @Column()
  email: string;

  @Column()
  @Encrypted(encryptionService)
  ssn: string;

  @Column()
  @Encrypted(encryptionService)
  phone: string;
}
```

### Redis with TLS

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6380,
  password: process.env.REDIS_PASSWORD,
  tls: {
    ca: fs.readFileSync('/etc/ssl/certs/ca-cert.pem'),
    cert: fs.readFileSync('/etc/ssl/certs/client-cert.pem'),
    key: fs.readFileSync('/etc/ssl/private/client-key.pem'),
    rejectUnauthorized: true
  }
});
```

---

## Network Security

### Network Segmentation

**Docker networks:**
```yaml
networks:
  frontend:    # Public-facing services
  backend:     # Internal services (no external access)
  database:    # Database services (no external access)
```

### Firewall Rules

**iptables:**
```bash
# Allow HTTPS
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow HTTP (for redirect)
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Block direct database access
iptables -A INPUT -p tcp --dport 5432 -j DROP
iptables -A INPUT -p tcp --dport 6379 -j DROP

# Allow internal network
iptables -A INPUT -s 172.21.0.0/24 -j ACCEPT
```

### API Gateway Security

**Nginx configuration:**
- Rate limiting
- IP whitelisting
- Request size limits
- Security headers
- WAF rules

See `infrastructure/nginx/nginx-secure.conf` for full configuration.

---

## Audit Logging

### Setup Audit Logger

```typescript
import { AuditLogger } from '@eazepay/security';
import Redis from 'ioredis';

const auditLogger = new AuditLogger({
  serviceName: 'identity-service',
  redis: redisClient,
  logToFile: true,
  logToRedis: true,
  retentionDays: 90
});

// Log authentication event
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
  action: 'unauthorized_access_attempt',
  resource: 'admin_panel',
  status: 'failure',
  severity: 'high',
  ipAddress: req.ip
});
```

### Query Audit Logs

```typescript
// Get events by type
const events = await auditLogger.getEvents(
  'authentication',
  new Date('2024-01-01'),
  new Date('2024-01-31')
);

// Get statistics
const stats = await auditLogger.getStats();
console.log(stats); // { authentication: 1234, data_access: 5678, ... }
```

---

## Security Monitoring

### Setup Security Monitor

```typescript
import { SecurityMonitor } from '@eazepay/security';

const securityMonitor = new SecurityMonitor({
  redis: redisClient,
  bruteForceThreshold: 5,
  bruteForceWindow: 300,
  enableAutoBlock: true,
  alertWebhook: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
});

// Track failed login
await securityMonitor.trackFailedLogin(email, ipAddress);

// Track suspicious activity
await securityMonitor.trackSuspiciousActivity(
  userId,
  'multiple_failed_transactions',
  { count: 10 }
);

// Check if blocked
const isBlocked = await securityMonitor.isBlocked(email);
```

### Security Alerts

```typescript
securityMonitor.on('securityAlert', (alert) => {
  console.error('Security Alert:', alert);
  
  // Send to monitoring system
  sendToDatadog(alert);
  sendToSentry(alert);
  
  // Notify security team
  if (alert.severity === 'critical') {
    notifySecurityTeam(alert);
  }
});
```

---

## Compliance

### PCI DSS

**Requirements:**
- ✅ Encryption in transit (TLS 1.3)
- ✅ Encryption at rest (AES-256-GCM)
- ✅ Access control (RBAC)
- ✅ Audit logging (90-day retention)
- ✅ Network segmentation
- ✅ Regular security testing

### GDPR

**Requirements:**
- ✅ Data encryption
- ✅ Right to erasure
- ✅ Data portability
- ✅ Consent management
- ✅ Breach notification
- ✅ Data minimization

### SOC 2

**Requirements:**
- ✅ Access controls
- ✅ Encryption
- ✅ Monitoring & logging
- ✅ Incident response
- ✅ Change management
- ✅ Vendor management

---

## Incident Response

### Security Incident Playbook

**1. Detection:**
- Monitor security alerts
- Review audit logs
- Check anomaly detection

**2. Containment:**
```bash
# Block compromised user
await securityMonitor.blockIdentifier(userId, 86400);

# Revoke all sessions
await sessionManager.invalidateUserSessions(userId);

# Rotate compromised secrets
bash scripts/security/rotate-secrets.sh
```

**3. Investigation:**
```typescript
// Get recent alerts
const alerts = await securityMonitor.getRecentAlerts('unauthorized_access', 100);

// Get audit trail
const events = await auditLogger.getEvents(
  'security',
  startTime,
  endTime
);
```

**4. Recovery:**
- Restore from backup
- Apply security patches
- Update firewall rules
- Notify affected users

**5. Post-Incident:**
- Document incident
- Update security policies
- Conduct training
- Improve monitoring

---

## Security Checklist

### Pre-Production

- [ ] Generate strong secrets
- [ ] Configure secrets manager
- [ ] Setup TLS certificates
- [ ] Enable database encryption
- [ ] Configure network segmentation
- [ ] Setup audit logging
- [ ] Enable security monitoring
- [ ] Configure rate limiting
- [ ] Setup WAF rules
- [ ] Enable HSTS
- [ ] Configure CORS properly
- [ ] Remove default credentials
- [ ] Disable debug mode
- [ ] Setup backup encryption
- [ ] Configure alerting
- [ ] Document security procedures

### Post-Production

- [ ] Monitor security alerts
- [ ] Review audit logs weekly
- [ ] Rotate secrets monthly
- [ ] Update certificates before expiry
- [ ] Conduct security audits quarterly
- [ ] Perform penetration testing
- [ ] Review access controls
- [ ] Update dependencies
- [ ] Train team on security
- [ ] Test incident response

---

## Support

For security issues, contact: security@eazepay.com

**Emergency:** +1-XXX-XXX-XXXX (24/7)
