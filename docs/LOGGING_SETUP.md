# Structured Logging Setup with Winston

## Overview

All backend Node.js services now use Winston for structured JSON logging with automatic log rotation. This provides consistent, searchable logs across all services.

## Services with Winston Logging

### Newly Added
- **financial-service** - Financial transaction and analytics service
- **ussd-service** - USSD Gateway microservice
- **agent-service** - Agent management service

### Updated with File Rotation
- **identity-service** - Identity and authentication service
- **iot-service** - IoT device management service
- **blockchain-service** - Blockchain ledger service
- **robotics-service** - Robotics and RPA service

## Features

### JSON Structured Logs
All logs are output in JSON format for easy parsing and analysis:
```json
{
  "level": "info",
  "message": "Incoming request",
  "timestamp": "2025-11-06 10:30:45",
  "service": "financial-service",
  "method": "POST",
  "path": "/api/transactions",
  "ip": "192.168.1.100"
}
```

### Log Rotation
- **Max file size**: 5MB per log file
- **Max files**: 5 rotated files kept
- **Log types**: 
  - `error.log` - Error level logs only
  - `combined.log` - All log levels

### Environment-Based Logging
- **Development**: Logs to console with colors + files
- **Production**: Logs to files only (JSON format)
- **Log Level**: Configurable via `LOG_LEVEL` environment variable (default: `info`)

## Usage

### Import Logger
```typescript
// TypeScript services
import logger from './utils/logger';

// JavaScript services
const logger = require('./utils/logger');
```

### Log Examples
```typescript
// Info logging
logger.info('User logged in', { userId: '123', email: 'user@example.com' });

// Warning logging
logger.warn('Rate limit approaching', { userId: '123', requests: 95 });

// Error logging
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  database: 'postgres'
});
```

### Request Logging
All services automatically log incoming requests:
```typescript
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});
```

## Log Locations

Each service stores logs in its own `logs/` directory:
```
services/
├── financial-service/
│   └── logs/
│       ├── error.log
│       └── combined.log
├── ussd-service/
│   └── logs/
│       ├── error.log
│       └── combined.log
└── ...
```

**Note**: Log directories are automatically created and are excluded from git via `.gitignore`.

## Configuration

### Environment Variables
```bash
# Set log level (error, warn, info, debug)
LOG_LEVEL=info

# Set environment (affects console logging)
NODE_ENV=production
```

### Custom Configuration
To modify logging behavior, edit the logger file in each service:
```
services/<service-name>/src/utils/logger.ts
```

## CI/CD Integration

The GitHub Actions CI workflow automatically:
1. Installs Winston dependencies for all services
2. Runs tests with proper logging
3. Builds services with logging enabled
4. Performs security audits on logging dependencies

### Running CI Locally
```bash
# Install dependencies for all services
cd services/financial-service && npm install
cd ../ussd-service && npm install
cd ../agent-service && npm install
cd ../identity-service && npm install
cd ../iot-service && npm install
cd ../blockchain-service && npm install
cd ../robotics-service && npm install
```

## Dependencies Added

All services now include:
```json
{
  "dependencies": {
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1"
  }
}
```

## Best Practices

1. **Use structured data**: Always pass metadata as objects
   ```typescript
   // Good
   logger.info('Payment processed', { amount: 100, currency: 'KES' });
   
   // Avoid
   logger.info(`Payment processed: 100 KES`);
   ```

2. **Include context**: Add relevant context to help debugging
   ```typescript
   logger.error('Transaction failed', {
     transactionId: txn.id,
     userId: user.id,
     error: error.message,
     stack: error.stack
   });
   ```

3. **Use appropriate levels**:
   - `error`: System errors, exceptions
   - `warn`: Warnings, deprecated features
   - `info`: General information, request logs
   - `debug`: Detailed debugging information

4. **Avoid sensitive data**: Never log passwords, tokens, or PII
   ```typescript
   // Bad
   logger.info('User login', { password: user.password });
   
   // Good
   logger.info('User login', { userId: user.id, email: user.email });
   ```

## Monitoring & Analysis

### Log Aggregation
Consider integrating with:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **Datadog**
- **CloudWatch** (AWS)
- **Stackdriver** (GCP)

### Example Queries
```bash
# Find all errors in the last hour
grep '"level":"error"' services/*/logs/error.log

# Find specific transaction logs
grep '"transactionId":"TXN123"' services/*/logs/combined.log

# Count requests by service
grep '"message":"Incoming request"' services/*/logs/combined.log | \
  jq -r '.service' | sort | uniq -c
```

## Troubleshooting

### Logs not appearing
1. Check log directory exists and is writable
2. Verify `NODE_ENV` is set correctly
3. Check `LOG_LEVEL` environment variable

### Log files too large
1. Adjust `maxsize` in logger configuration
2. Reduce `maxFiles` to keep fewer rotated files
3. Implement log archival strategy

### Performance issues
1. Reduce log level in production (`LOG_LEVEL=warn`)
2. Disable console logging in production
3. Use async transports for high-volume logging

## Migration Notes

### From console.log
Replace all `console.log`, `console.error`, `console.warn` with logger:
```typescript
// Before
console.log('User created:', userId);
console.error('Error:', error);

// After
logger.info('User created', { userId });
logger.error('Error occurred', { error: error.message, stack: error.stack });
```

### From Morgan
Morgan can coexist with Winston for HTTP logging, but Winston provides more flexibility:
```typescript
// Morgan (HTTP only)
app.use(morgan('combined'));

// Winston (all logging)
logger.info('Request received', { method, path, ip });
```

## Support

For issues or questions about logging:
1. Check this documentation
2. Review service-specific logger configuration
3. Check CI/CD logs for dependency issues
4. Contact the DevOps team

---

**Last Updated**: November 6, 2025
**Maintained By**: DevOps Team
