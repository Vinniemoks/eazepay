# @eazepay/swagger-config

Shared Swagger/OpenAPI configuration for Eazepay microservices. Provides interactive API documentation with a consistent look and feel across all services.

## Features

- ✅ OpenAPI 3.0 specification
- ✅ Interactive Swagger UI
- ✅ JWT Bearer authentication support
- ✅ Common schemas (User, Transaction, Wallet, etc.)
- ✅ Standard error responses
- ✅ Pagination support
- ✅ JSDoc comment templates
- ✅ TypeScript support
- ✅ Customizable per service

## Installation

```bash
cd services/shared/swagger-config
npm install
npm run build
```

Then in your service:

```bash
npm install file:../shared/swagger-config
```

## Quick Start

### 1. Setup in Your Service

```typescript
import express from 'express';
import { setupSwagger } from '@eazepay/swagger-config';

const app = express();

// Setup Swagger documentation
setupSwagger(app, {
  serviceName: 'Eazepay Financial Service API',
  serviceDescription: 'Financial transaction and analytics service',
  version: '1.0.0',
  basePath: '/api',
  tags: [
    {
      name: 'Transactions',
      description: 'Transaction management'
    }
  ],
  apiFiles: ['./src/routes/**/*.ts']
});

// Your routes...
app.use('/api/transactions', transactionRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('API Docs: http://localhost:3000/api-docs');
});
```

### 2. Document Your Routes

Add JSDoc comments above your route handlers:

```typescript
/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000.50
 *               currency:
 *                 type: string
 *                 example: KES
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', createTransaction);
```

### 3. Access Documentation

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

## Configuration Options

```typescript
interface SwaggerConfig {
  serviceName: string;              // Service name (required)
  serviceDescription: string;       // Service description (required)
  version: string;                  // API version (required)
  basePath?: string;                // Base path (default: '/api')
  servers?: Array<{                 // Server URLs
    url: string;
    description: string;
  }>;
  tags?: Array<{                    // API tags
    name: string;
    description: string;
  }>;
  apiFiles?: string[];              // Route files to scan
  securitySchemes?: Record<string, any>;  // Custom security schemes
}
```

## Common Schemas

Pre-defined schemas you can reference:

### User Schema
```yaml
$ref: '#/components/schemas/User'
```

### Transaction Schema
```yaml
$ref: '#/components/schemas/Transaction'
```

### Wallet Schema
```yaml
$ref: '#/components/schemas/Wallet'
```

### Error Response
```yaml
$ref: '#/components/schemas/Error'
```

### Pagination
```yaml
$ref: '#/components/schemas/Pagination'
```

## Standard Responses

Pre-defined error responses:

```yaml
401:
  $ref: '#/components/responses/UnauthorizedError'
403:
  $ref: '#/components/responses/ForbiddenError'
404:
  $ref: '#/components/responses/NotFoundError'
400:
  $ref: '#/components/responses/ValidationError'
500:
  $ref: '#/components/responses/ServerError'
```

## Common Parameters

Pre-defined query parameters:

```yaml
parameters:
  - $ref: '#/components/parameters/PageParam'
  - $ref: '#/components/parameters/LimitParam'
```

## Documentation Examples

### GET Endpoint

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, AGENT, ADMIN]
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/users', getUsers);
```

### POST Endpoint

```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/users', createUser);
```

### PUT Endpoint

```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/users/:id', updateUser);
```

### DELETE Endpoint

```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/users/:id', deleteUser);
```

## Authentication in Swagger UI

1. Click the **Authorize** button in Swagger UI
2. Enter your JWT token (without "Bearer " prefix)
3. Click **Authorize**
4. All subsequent requests will include the token

## Custom Schemas

Add service-specific schemas:

```typescript
setupSwagger(app, {
  serviceName: 'My Service',
  serviceDescription: 'Description',
  version: '1.0.0',
  // ... other config
});

// Then in your route comments:
/**
 * @swagger
 * components:
 *   schemas:
 *     CustomModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 */
```

## Best Practices

1. **Tag Organization**: Group related endpoints with tags
2. **Consistent Naming**: Use clear, consistent endpoint names
3. **Complete Examples**: Provide example values for all fields
4. **Error Documentation**: Document all possible error responses
5. **Security**: Mark protected endpoints with `security: [{ bearerAuth: [] }]`
6. **Descriptions**: Add clear descriptions for complex operations
7. **Validation**: Document validation rules (min, max, pattern, etc.)

## Troubleshooting

### Documentation not showing
- Check that `apiFiles` path is correct
- Ensure JSDoc comments are properly formatted
- Verify route files are being scanned

### Schemas not found
- Check schema reference path: `$ref: '#/components/schemas/SchemaName'`
- Ensure schema is defined in common schemas or route comments

### Authentication not working
- Verify JWT token is valid
- Check token format (should not include "Bearer " prefix in UI)
- Ensure `security` is defined on protected endpoints

## Migration from Manual Documentation

### Before
```typescript
// No documentation
router.get('/users', getUsers);
```

### After
```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/users', getUsers);
```

## Integration with CI/CD

Generate OpenAPI spec in CI:

```bash
# In your CI pipeline
npm run build
node -e "
  const app = require('./dist/index');
  const spec = require('./dist/swagger-spec.json');
  console.log(JSON.stringify(spec, null, 2));
" > openapi.json
```

## Support

For issues or questions:
1. Check this README
2. Review Swagger UI error messages
3. Validate OpenAPI spec at https://editor.swagger.io
4. Contact DevOps team

---

**Version**: 1.0.0  
**License**: MIT  
**Maintained By**: Eazepay DevOps Team
