# @afripay/validation

Centralized input validation and sanitization for AfriPay microservices with Joi schemas and custom validators.

## Features

- ✅ Joi-based validation schemas
- ✅ Custom validators for African context (Kenyan phone, M-Pesa, etc.)
- ✅ Input sanitization
- ✅ Pre-built common schemas
- ✅ Validation middleware
- ✅ Consistent error responses
- ✅ TypeScript support
- ✅ Phone number normalization
- ✅ Email normalization
- ✅ HTML stripping

## Installation

```bash
cd services/shared/validation
npm install
npm run build
```

Then in your service:

```bash
npm install file:../shared/validation
```

## Quick Start

### 1. Use Pre-built Schemas

```typescript
import { validateBody, schemas } from '@afripay/validation';

// User registration
router.post('/register', 
  validateBody(schemas.userRegistration),
  registerHandler
);

// User login
router.post('/login',
  validateBody(schemas.userLogin),
  loginHandler
);

// Transaction creation
router.post('/transactions',
  validateBody(schemas.transactionCreate),
  createTransactionHandler
);
```

### 2. Use Common Schemas

```typescript
import { validateBody, commonSchemas } from '@afripay/validation';
import Joi from 'joi';

// Build custom schema from common schemas
const updateProfileSchema = Joi.object({
  fullName: commonSchemas.name,
  phoneNumber: commonSchemas.kenyanPhoneNumber,
  email: commonSchemas.email.optional()
});

router.put('/profile',
  validateBody(updateProfileSchema),
  updateProfileHandler
);
```

### 3. Validate Multiple Sources

```typescript
import { validateRequest, commonSchemas, schemas } from '@afripay/validation';
import Joi from 'joi';

router.get('/transactions/:id',
  validateRequest({
    params: schemas.idParam,
    query: schemas.pagination
  }),
  getTransactionHandler
);
```

## Common Schemas

### User Schemas

```typescript
// Email
commonSchemas.email

// Password (strong)
commonSchemas.password

// Phone number (E.164)
commonSchemas.phoneNumber

// Kenyan phone number
commonSchemas.kenyanPhoneNumber

// Name
commonSchemas.name

// User role
commonSchemas.userRole
```

### Transaction Schemas

```typescript
// Amount
commonSchemas.amount

// Currency
commonSchemas.currency

// Transaction type
commonSchemas.transactionType

// Transaction status
commonSchemas.transactionStatus
```

### Identification Schemas

```typescript
// UUID
commonSchemas.uuid

// Kenyan ID
commonSchemas.kenyanID

// Passport number
commonSchemas.passportNumber

// M-Pesa transaction ID
commonSchemas.mpesaTransactionID
```

### Other Schemas

```typescript
// Date (ISO 8601)
commonSchemas.date

// URL
commonSchemas.url

// Description
commonSchemas.description

// Pagination page
commonSchemas.page

// Pagination limit
commonSchemas.limit

// Coordinates
commonSchemas.coordinates
```

## Pre-built Schemas

### User Registration

```typescript
import { validateBody, schemas } from '@afripay/validation';

router.post('/register',
  validateBody(schemas.userRegistration),
  handler
);

// Validates:
// - email (required, valid email)
// - password (required, strong password)
// - phoneNumber (required, Kenyan format)
// - fullName (required, 2-255 chars)
// - role (optional, defaults to CUSTOMER)
```

### User Login

```typescript
router.post('/login',
  validateBody(schemas.userLogin),
  handler
);

// Validates:
// - email (required, valid email)
// - password (required)
```

### Transaction Creation

```typescript
router.post('/transactions',
  validateBody(schemas.transactionCreate),
  handler
);

// Validates:
// - type (required, DEPOSIT/WITHDRAWAL/TRANSFER/PAYMENT)
// - amount (required, positive, max 2 decimals)
// - currency (required, KES/USD/EUR/etc.)
// - fromUserId (required, UUID)
// - toUserId (required, UUID)
// - description (optional, max 500 chars)
```

### Pagination

```typescript
router.get('/users',
  validateQuery(schemas.pagination),
  handler
);

// Validates:
// - page (optional, default 1, min 1)
// - limit (optional, default 10, min 1, max 100)
```

### ID Parameter

```typescript
router.get('/users/:id',
  validateParams(schemas.idParam),
  handler
);

// Validates:
// - id (required, UUID format)
```

### Date Range

```typescript
router.get('/reports',
  validateQuery(schemas.dateRange),
  handler
);

// Validates:
// - startDate (required, ISO 8601)
// - endDate (required, ISO 8601)
// - startDate must be before endDate
```

## Custom Validators

### Kenyan-Specific Validators

```typescript
import { validators } from '@afripay/validation';

// Kenyan phone number
validators.isKenyanPhoneNumber('+254712345678'); // true
validators.isKenyanPhoneNumber('0712345678'); // true
validators.isKenyanPhoneNumber('254712345678'); // true

// Kenyan ID number
validators.isKenyanID('12345678'); // true

// M-Pesa transaction ID
validators.isMpesaTransactionID('ABC1234567'); // true
```

### General Validators

```typescript
// Email
validators.isEmail('user@example.com'); // true

// Phone number (E.164)
validators.isPhoneNumber('+254712345678'); // true

// UUID
validators.isUUID('123e4567-e89b-12d3-a456-426614174000'); // true

// Strong password
validators.isStrongPassword('SecurePass123!'); // true

// Currency code
validators.isCurrencyCode('KES'); // true

// Amount
validators.isAmount(1000.50); // true

// Passport number
validators.isPassportNumber('AB123456'); // true
```

## Sanitization

### Automatic Sanitization

```typescript
import { sanitize } from '@afripay/validation';

// Apply to all routes
app.use(sanitize());

// With options
app.use(sanitize({
  trim: true,
  escape: true,
  stripLow: true
}));
```

### Manual Sanitization

```typescript
import { sanitizeInput } from '@afripay/validation';

const sanitized = sanitizeInput(userInput, {
  trim: true,
  escape: true,
  stripLow: true
});
```

### Utility Functions

```typescript
import {
  normalizePhoneNumber,
  normalizeEmail,
  stripHTML,
  removeSensitiveFields
} from '@afripay/validation';

// Normalize phone number
const phone = normalizePhoneNumber('0712345678'); // +254712345678

// Normalize email
const email = normalizeEmail('User@Example.COM'); // user@example.com

// Strip HTML
const clean = stripHTML('<script>alert("xss")</script>Hello'); // Hello

// Remove sensitive fields
const safe = removeSensitiveFields({
  email: 'user@example.com',
  password: 'secret123'
}); // { email: 'user@example.com' }
```

## Validation Middleware

### Validate Body

```typescript
import { validateBody } from '@afripay/validation';
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required()
});

router.post('/users', validateBody(schema), handler);
```

### Validate Query

```typescript
import { validateQuery } from '@afripay/validation';
import Joi from 'joi';

const schema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10)
});

router.get('/users', validateQuery(schema), handler);
```

### Validate Params

```typescript
import { validateParams } from '@afripay/validation';
import Joi from 'joi';

const schema = Joi.object({
  id: Joi.string().uuid().required()
});

router.get('/users/:id', validateParams(schema), handler);
```

### Validate Multiple Sources

```typescript
import { validateRequest } from '@afripay/validation';
import Joi from 'joi';

router.put('/users/:id',
  validateRequest({
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    body: Joi.object({
      name: Joi.string().min(2).required(),
      email: Joi.string().email().required()
    }),
    query: Joi.object({
      notify: Joi.boolean().default(false)
    })
  }),
  handler
);
```

## Error Response Format

Validation errors return a consistent format:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 422,
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format",
        "type": "string.email",
        "value": "invalid-email"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters",
        "type": "string.min"
      }
    ]
  },
  "timestamp": "2025-11-06T10:30:00Z"
}
```

## Custom Schemas

### Build Your Own

```typescript
import { commonSchemas } from '@afripay/validation';
import Joi from 'joi';

const customSchema = Joi.object({
  // Use common schemas
  email: commonSchemas.email,
  phoneNumber: commonSchemas.kenyanPhoneNumber,
  
  // Add custom fields
  businessName: Joi.string().min(3).max(100).required(),
  businessType: Joi.string().valid('RETAIL', 'WHOLESALE', 'SERVICE').required(),
  
  // Nested objects
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    coordinates: commonSchemas.coordinates
  })
});
```

### Custom Validation Logic

```typescript
const schema = Joi.object({
  startDate: commonSchemas.date,
  endDate: commonSchemas.date
}).custom((value, helpers) => {
  if (value.startDate > value.endDate) {
    return helpers.error('dateRange.invalid');
  }
  return value;
}).messages({
  'dateRange.invalid': 'Start date must be before end date'
});
```

## Best Practices

### 1. Use Pre-built Schemas

```typescript
// Good
import { schemas } from '@afripay/validation';
router.post('/register', validateBody(schemas.userRegistration), handler);

// Avoid
const schema = Joi.object({ /* duplicate validation */ });
```

### 2. Combine Common Schemas

```typescript
// Good
import { commonSchemas } from '@afripay/validation';
const schema = Joi.object({
  email: commonSchemas.email,
  amount: commonSchemas.amount
});
```

### 3. Sanitize Input

```typescript
// Good
app.use(sanitize());

// Or per route
router.post('/users', sanitize(), validateBody(schema), handler);
```

### 4. Normalize Data

```typescript
// Good
const phone = normalizePhoneNumber(req.body.phoneNumber);
const email = normalizeEmail(req.body.email);
```

### 5. Validate All Sources

```typescript
// Good
validateRequest({
  params: schemas.idParam,
  body: schemas.userUpdate,
  query: schemas.pagination
})
```

## Testing

```typescript
import { validators, schemas } from '@afripay/validation';

describe('Validation', () => {
  it('should validate Kenyan phone number', () => {
    expect(validators.isKenyanPhoneNumber('+254712345678')).toBe(true);
    expect(validators.isKenyanPhoneNumber('0712345678')).toBe(true);
    expect(validators.isKenyanPhoneNumber('invalid')).toBe(false);
  });

  it('should validate user registration', () => {
    const { error } = schemas.userRegistration.validate({
      email: 'user@example.com',
      password: 'SecurePass123!',
      phoneNumber: '+254712345678',
      fullName: 'John Doe',
      role: 'CUSTOMER'
    });
    expect(error).toBeUndefined();
  });
});
```

## Migration Guide

### Before

```typescript
// Manual validation
router.post('/users', (req, res) => {
  if (!req.body.email || !req.body.email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!req.body.password || req.body.password.length < 8) {
    return res.status(400).json({ error: 'Password too short' });
  }
  // ... more validation
});
```

### After

```typescript
import { validateBody, schemas } from '@afripay/validation';

router.post('/users',
  validateBody(schemas.userRegistration),
  handler
);
```

## Support

For issues or questions:
1. Check this README
2. Review validation error messages
3. Check Joi documentation
4. Contact DevOps team

---

**Version**: 1.0.0  
**License**: MIT  
**Maintained By**: AfriPay DevOps Team
