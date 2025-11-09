# @eazepay/auth-middleware

Shared authentication and authorization middleware for Eazepay microservices.

## Features

- ✅ JWT token generation and verification
- ✅ Authentication middleware
- ✅ Role-based authorization
- ✅ Permission-based authorization
- ✅ Session validation support
- ✅ Optional authentication
- ✅ TypeScript support
- ✅ Centralized error handling

## Installation

```bash
cd services/shared/auth-middleware
npm install
npm run build
```

Then in your service:

```bash
npm install file:../shared/auth-middleware
```

## Usage

### 1. Initialize in Your Service

```typescript
import express from 'express';
import { JWTService, initializeAuth, authenticate } from '@eazepay/auth-middleware';

const app = express();

// Initialize JWT service
const jwtService = new JWTService({
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: '8h',
  issuer: 'eazepay-services',
  audience: 'eazepay-services'
});

// Initialize auth middleware
initializeAuth(jwtService);

// Use authentication on routes
app.use('/api/protected', authenticate);
```

### 2. Generate Tokens

```typescript
import { JWTService } from '@eazepay/auth-middleware';

const jwtService = new JWTService({
  jwtSecret: process.env.JWT_SECRET!
});

// Generate access token
const token = jwtService.generateToken({
  userId: user.id,
  email: user.email,
  role: user.role,
  sessionId: session.id,
  permissions: ['READ_USERS', 'WRITE_TRANSACTIONS']
});

// Generate refresh token
const refreshToken = jwtService.generateRefreshToken(user.id, session.id);
```

### 3. Authentication Middleware

```typescript
import { authenticate, optionalAuth } from '@eazepay/auth-middleware';

// Require authentication
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Optional authentication
app.get('/api/public', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ message: 'Hello ' + req.user.email });
  } else {
    res.json({ message: 'Hello guest' });
  }
});
```

### 4. Role-Based Authorization

```typescript
import { authenticate, requireRole, requireAnyRole, UserRole } from '@eazepay/auth-middleware';

// Require specific role
app.get('/api/admin', authenticate, requireRole(UserRole.ADMIN), (req, res) => {
  res.json({ message: 'Admin only' });
});

// Require any of multiple roles
app.get('/api/management', 
  authenticate, 
  requireAnyRole([UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPERUSER]),
  (req, res) => {
    res.json({ message: 'Management access' });
  }
);

// Convenience methods
import { requireSuperuser, requireAdmin, requireManager } from '@eazepay/auth-middleware';

app.get('/api/superuser', authenticate, requireSuperuser(), handler);
app.get('/api/admin', authenticate, requireAdmin(), handler);
app.get('/api/manager', authenticate, requireManager(), handler);
```

### 5. Permission-Based Authorization

```typescript
import { authenticate, requirePermission, requireAnyPermission } from '@eazepay/auth-middleware';

// Require specific permission
app.get('/api/users', 
  authenticate, 
  requirePermission('READ_USERS'),
  (req, res) => {
    res.json({ users: [] });
  }
);

// Require any of multiple permissions
app.post('/api/transactions', 
  authenticate, 
  requireAnyPermission(['CREATE_TRANSACTION', 'ADMIN_OVERRIDE']),
  (req, res) => {
    res.json({ success: true });
  }
);
```

### 6. Session Validation

```typescript
import { JWTService, initializeAuth } from '@eazepay/auth-middleware';

const jwtService = new JWTService({
  jwtSecret: process.env.JWT_SECRET!,
  validateSession: true,
  sessionValidator: async (sessionId: string) => {
    // Check if session exists in database/Redis
    const session = await sessionRepository.findOne({ where: { id: sessionId } });
    return session && !session.isExpired();
  }
});

initializeAuth(jwtService);
```

### 7. Access User Info in Routes

```typescript
import { AuthRequest } from '@eazepay/auth-middleware';

app.get('/api/profile', authenticate, (req: AuthRequest, res) => {
  const user = req.user!;
  
  res.json({
    userId: user.userId,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  });
});
```

## API Reference

### JWTService

```typescript
class JWTService {
  constructor(config: AuthConfig);
  generateToken(payload: TokenPayload): string;
  generateRefreshToken(userId: string, sessionId: string): string;
  verifyToken(token: string): TokenPayload;
  decodeToken(token: string): TokenPayload | null;
  validateSession(sessionId: string): Promise<boolean>;
  extractTokenFromHeader(authHeader?: string): string | null;
}
```

### Middleware Functions

```typescript
// Authentication
function authenticate(req, res, next): Promise<void>;
function optionalAuth(req, res, next): Promise<void>;

// Role-based
function requireRole(role: UserRole): Middleware;
function requireAnyRole(roles: UserRole[]): Middleware;
function requireSuperuser(): Middleware;
function requireAdmin(): Middleware;
function requireManager(): Middleware;

// Permission-based
function requirePermission(permission: string): Middleware;
function requireAnyPermission(permissions: string[]): Middleware;
function requireAllPermissions(permissions: string[]): Middleware;
```

### Types

```typescript
enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPERUSER = 'SUPERUSER'
}

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  permissions?: string[];
}

interface AuthRequest extends Request {
  user?: TokenPayload;
  sessionId?: string;
}
```

### Error Classes

```typescript
class AuthenticationError extends Error
class AuthorizationError extends Error
class TokenExpiredError extends AuthenticationError
class InvalidTokenError extends AuthenticationError
class MissingTokenError extends AuthenticationError
class InsufficientPermissionsError extends AuthorizationError
class InvalidRoleError extends AuthorizationError
```

## Environment Variables

```bash
# Required
JWT_SECRET=your-super-secret-key-min-32-chars

# Optional
JWT_EXPIRES_IN=8h
JWT_ISSUER=eazepay-services
JWT_AUDIENCE=eazepay-services
```

## Security Best Practices

1. **Strong JWT Secret**: Use a secret key of at least 32 characters
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Expiry**: Set appropriate token expiration times
4. **Session Validation**: Enable session validation for critical services
5. **Refresh Tokens**: Use refresh tokens for long-lived sessions
6. **Least Privilege**: Grant minimum required permissions

## Migration from Service-Specific Auth

### Before (service-specific)

```typescript
// financial-service/src/middleware/auth.ts
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

### After (shared middleware)

```typescript
// financial-service/src/index.ts
import { JWTService, initializeAuth, authenticate } from '@eazepay/auth-middleware';

const jwtService = new JWTService({
  jwtSecret: process.env.JWT_SECRET!
});
initializeAuth(jwtService);

// Use in routes
app.use('/api', authenticate);
```

## Testing

```typescript
import { JWTService } from '@eazepay/auth-middleware';

describe('JWTService', () => {
  const jwtService = new JWTService({
    jwtSecret: 'test-secret-key-at-least-32-chars'
  });

  it('should generate and verify token', () => {
    const token = jwtService.generateToken({
      userId: '123',
      email: 'test@example.com',
      role: UserRole.CUSTOMER,
      sessionId: 'session-123'
    });

    const payload = jwtService.verifyToken(token);
    expect(payload.userId).toBe('123');
  });
});
```

## Troubleshooting

### "Auth middleware not initialized"
Call `initializeAuth(jwtService)` before using middleware.

### "Invalid token"
Check that JWT_SECRET matches across services.

### "Token expired"
Token has exceeded expiration time. Use refresh token to get new access token.

### "Insufficient permissions"
User doesn't have required permission. Check token payload.

---

**Version**: 1.0.0  
**License**: MIT  
**Maintained By**: Eazepay DevOps Team
