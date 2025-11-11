# Eazepay Logging Guide

This guide outlines the standards and best practices for logging across all Eazepay microservices. Consistent, structured logging is critical for debugging, monitoring, and auditing our platform.

## 1. The `@eazepay/logger` Shared Library

All Node.js services **MUST** use the `@eazepay/logger` shared library for all logging activities. This ensures uniformity and allows for centralized configuration updates.

### Key Features
- **Structured JSON Format**: In production, all logs are written in JSON format, making them easily parsable by log aggregation tools like Elasticsearch (ELK Stack), Splunk, or Datadog.
- **Developer-Friendly Console Output**: In development, logs are printed to the console in a colorized, human-readable format.
- **Log Rotation**: Log files are automatically rotated daily or when they reach 20MB, and old logs are compressed and kept for 14 days.
- **Configurable Log Levels**: The log level can be set via the `LOG_LEVEL` environment variable (`error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`).

## 2. Log Environments

### Production (`NODE_ENV=production`)
- **Output**: JSON format to a rotating file (`logs/<service-name>-YYYY-MM-DD.log`).
- **Level**: `info` by default. Can be overridden by `LOG_LEVEL`.
- **Goal**: Machine-readability for log analysis platforms.

### Development (`NODE_ENV=development`)
- **Output**: Colorized text to the console. A copy is also saved to `logs/dev-combined.log` and `logs/dev-error.log`.
- **Level**: `debug` by default.
- **Goal**: Readability for developers during local development.

## 3. How to Log

### Basic Logging
Import the logger and use the appropriate level.

```typescript
import logger from '@eazepay/logger';

logger.info('Service has started successfully.');
logger.warn('Configuration value is missing, using default.');
logger.error('Failed to connect to the database.');
```

### Logging with Metadata
Always add a metadata object to provide context. This is crucial for structured logging.

```typescript
logger.info('User logged in successfully', {
  userId: 'user-123',
  ipAddress: '192.168.1.100'
});

logger.error('Transaction failed', {
  transactionId: 'txn-abc',
  userId: 'user-123',
  errorCode: 'INSUFFICIENT_FUNDS',
  errorMessage: error.message
});
```

### Logging Errors
When logging errors, always include the error object itself to capture the stack trace.

```typescript
try {
  // Risky operation
} catch (error) {
  logger.error('A critical operation failed', {
    error: error, // This will include message and stack trace
    component: 'PaymentProcessor'
  });
}
```

### Request-Level Logging (Correlation ID)
To trace a single request across multiple services, a **correlation ID** is essential. This should be generated at the API Gateway and passed down. Use a child logger to include it in every log message for that request.

```typescript
import { createChildLogger } from '@eazepay/logger';

app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.logger = createChildLogger({ correlationId });
  req.logger.info('Incoming request received');
  next();
});
```

## 4. Best Practices

- **DO** log important business events (e.g., user registration, payment processed).
- **DO** log errors with as much context as possible, including the stack trace.
- **DO NOT** log sensitive information like passwords, full credit card numbers, or unredacted API keys. The logger will have sanitization features, but it's best to be proactive.
- **DO** use the appropriate log level. `error` for failures, `warn` for potential issues, `info` for significant events, `debug` for development details.
- **DO** add a `SERVICE_NAME` environment variable to each service to correctly identify log sources.