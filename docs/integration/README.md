# @eazepay/logger

Shared Winston logger for Eazepay microservices.

## Features

- ✅ **Structured Logging**: JSON format in production for easy parsing by log aggregators.
- ✅ **Development Friendly**: Colorized console output for development.
- ✅ **Log Rotation**: Automatically rotates log files daily or when they reach a certain size.
- ✅ **Environment-based**: Different transports for `production` vs. `development`.
- ✅ **Centralized Configuration**: Ensures all services log in a consistent format.
- ✅ **Error Handling**: Captures stack traces for errors.

## Installation

First, build the shared library:
```bash
cd services/shared/logger
npm install
npm run build
```

Then, in the service where you want to use it (e.g., `financial-service`):

```bash
npm install file:../shared/logger
npm install winston winston-daily-rotate-file
```

## Quick Start

### 1. Configure Environment

In your service's `.env` file:

```env
NODE_ENV=development
LOG_LEVEL=info
SERVICE_NAME=financial-service
```

### 2. Use in Your Service

```typescript
import logger, { createChildLogger } from '@eazepay/logger';

// Basic logging
logger.info('Service starting up...');

// Logging with metadata
logger.info('Transaction processed', {
  transactionId: 'txn_123',
  amount: 1000,
});

// Error logging
try {
  // ... some operation
} catch (error) {
  logger.error('Operation failed', { error: error.message, stack: error.stack });
}

// Create a child logger for a specific request
const requestLogger = createChildLogger({ correlationId: 'req_abc' });
requestLogger.info('Processing request');
```