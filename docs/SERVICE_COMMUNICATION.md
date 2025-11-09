# Service Communication Guide

## Overview

Eazepay uses a hybrid communication pattern combining synchronous HTTP calls with asynchronous event-driven messaging for robust inter-service communication.

## Architecture

### 1. Synchronous Communication (HTTP)
- **Use Case**: Request-response patterns, immediate data needs
- **Implementation**: ServiceClient with circuit breaker and retry logic
- **Examples**: User authentication, balance checks, transaction validation

### 2. Asynchronous Communication (Events)
- **Use Case**: Fire-and-forget, eventual consistency, notifications
- **Implementation**: RabbitMQ event bus with topic exchange
- **Examples**: Audit logging, notifications, analytics updates

## Service Registry

All services are registered in a centralized registry with automatic environment detection.

### Registered Services

| Service | Docker URL | Local URL | Port |
|---------|-----------|-----------|------|
| identity-service | http://identity-service:8000 | http://localhost:8000 | 8000 |
| biometric-service | http://biometric-service:8001 | http://localhost:8001 | 8001 |
| transaction-service | http://transaction-service:8002 | http://localhost:8002 | 8002 |
| wallet-service | http://wallet-service:8003 | http://localhost:8003 | 8003 |
| ussd-service | http://ussd-service:8004 | http://localhost:8004 | 8004 |
| agent-service | http://agent-service:8005 | http://localhost:8005 | 8005 |
| financial-service | http://financial-service:3002 | http://localhost:3002 | 3002 |
| blockchain-service | http://blockchain-service:8010 | http://localhost:8010 | 8010 |
| iot-service | http://iot-service:8020 | http://localhost:8020 | 8020 |
| robotics-service | http://robotics-service:8040 | http://localhost:8040 | 8040 |

### Environment Detection

The system automatically detects the environment:
- **Docker**: Uses service names (e.g., `http://identity-service:8000`)
- **Local**: Uses localhost (e.g., `http://localhost:8000`)

Set `DOCKER_ENV=true` to force Docker mode.

## HTTP Communication with Circuit Breaker

### Installation

```bash
cd services/shared/service-client
npm install
npm run build
```

### Usage

```typescript
import { ServiceClient, ServiceRegistry } from '@eazepay/service-client';

// Get service URL from registry
const registry = ServiceRegistry.getInstance();
const identityServiceUrl = registry.getUrl('identity-service');

// Create client with circuit breaker
const client = new ServiceClient({
  serviceName: 'financial-service',
  baseURL: identityServiceUrl,
  timeout: 30000,
  circuitBreaker: {
    enabled: true,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
  },
  retry: {
    enabled: true,
    retries: 3,
    retryDelay: 1000
  }
});

// Make requests
try {
  const user = await client.get('/api/users/123');
  console.log('User:', user);
} catch (error) {
  if (error instanceof CircuitBreakerOpenError) {
    console.error('Service unavailable - circuit breaker open');
  } else {
    console.error('Request failed:', error);
  }
}

// Check circuit breaker stats
const stats = client.getStats();
console.log('Circuit breaker state:', stats?.state);
```

### Circuit Breaker Configuration

```typescript
{
  timeout: 30000,                    // Request timeout in ms
  errorThresholdPercentage: 50,      // % of failures to open circuit
  resetTimeout: 30000,               // Time before attempting to close
  rollingCountTimeout: 10000,        // Window for counting failures
  rollingCountBuckets: 10,           // Number of buckets in window
  enabled: true                      // Enable/disable circuit breaker
}
```

### Retry Configuration

```typescript
{
  retries: 3,                        // Number of retry attempts
  retryDelay: 1000,                  // Base delay between retries (ms)
  enabled: true,                     // Enable/disable retries
  retryCondition: (error) => {       // Custom retry condition
    return error.response?.status >= 500;
  }
}
```

## Event-Driven Communication

### Installation

```bash
cd services/shared/event-bus
npm install
npm run build
```

### Publishing Events

```typescript
import { EventBus, EventPublisher, EventType } from '@eazepay/event-bus';

// Initialize event bus
const eventBus = new EventBus({
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
});

await eventBus.connect();

// Create publisher
const publisher = new EventPublisher(eventBus, 'financial-service');

// Publish event
await publisher.publish(
  EventType.TRANSACTION_COMPLETED,
  {
    transactionId: 'TXN123',
    fromUserId: 'USER1',
    toUserId: 'USER2',
    amount: 1000,
    currency: 'KES'
  },
  {
    correlationId: 'REQ456',
    priority: 'high'
  }
);
```

### Subscribing to Events

```typescript
import { EventBus, EventSubscriber, EventType } from '@eazepay/event-bus';

// Initialize event bus
const eventBus = new EventBus({
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
});

await eventBus.connect();

// Create subscriber
const subscriber = new EventSubscriber(eventBus, 'audit-service');

// Subscribe to specific event
await subscriber.subscribe(
  EventType.TRANSACTION_COMPLETED,
  async (event) => {
    console.log('Transaction completed:', event.data);
    // Process event...
  }
);

// Subscribe to pattern (all transaction events)
await subscriber.subscribeToPattern(
  'transaction.*',
  async (event) => {
    console.log('Transaction event:', event.type, event.data);
    // Process event...
  }
);
```

### Standard Events

| Event Type | Description | Data |
|------------|-------------|------|
| user.created | New user registered | userId, email, phoneNumber |
| user.verified | User identity verified | userId, verificationType |
| transaction.completed | Transaction successful | transactionId, amount, currency |
| transaction.failed | Transaction failed | transactionId, reason |
| payment.initiated | Payment started | paymentId, amount, method |
| wallet.credited | Wallet balance increased | walletId, amount, transactionId |
| wallet.debited | Wallet balance decreased | walletId, amount, transactionId |
| biometric.enrolled | Biometric data enrolled | userId, biometricType |
| agent.registered | New agent registered | agentId, location |
| audit.log.created | Audit log entry created | logId, action, userId |

## Best Practices

### When to Use HTTP vs Events

**Use HTTP (Synchronous) when:**
- You need immediate response
- Operation requires confirmation
- Data consistency is critical
- Request-response pattern fits naturally

**Use Events (Asynchronous) when:**
- Fire-and-forget operations
- Multiple services need to react
- Eventual consistency is acceptable
- Decoupling services is important

### Error Handling

```typescript
import { 
  ServiceCommunicationError, 
  CircuitBreakerOpenError, 
  ServiceTimeoutError 
} from '@eazepay/service-client';

try {
  const result = await client.post('/api/transactions', data);
} catch (error) {
  if (error instanceof CircuitBreakerOpenError) {
    // Service is down, use fallback
    return fallbackResponse();
  } else if (error instanceof ServiceTimeoutError) {
    // Request timed out, retry or queue
    await queueForRetry(data);
  } else if (error instanceof ServiceCommunicationError) {
    // Handle specific HTTP errors
    if (error.statusCode === 404) {
      return notFoundResponse();
    }
  }
  throw error;
}
```

### Health Checks

```typescript
// Check if service is healthy
const isHealthy = await client.healthCheck();

if (!isHealthy) {
  console.warn('Service is unhealthy');
  // Use fallback or circuit breaker
}
```

### Monitoring

```typescript
// Get circuit breaker statistics
const stats = client.getStats();

if (stats) {
  console.log('Circuit state:', stats.state);
  console.log('Success rate:', stats.stats.successes / stats.stats.fires);
  console.log('Failure rate:', stats.stats.failures / stats.stats.fires);
}
```

## Configuration

### Environment Variables

Add to all service `.env` files:

```bash
# Service Communication
DOCKER_ENV=false
SERVICE_PROTOCOL=http
SERVICE_TIMEOUT=30000
SERVICE_RETRY_ATTEMPTS=3
CIRCUIT_BREAKER_ENABLED=true
CIRCUIT_BREAKER_THRESHOLD=50

# Service URLs (auto-detected if not set)
IDENTITY_SERVICE_URL=http://localhost:8000
TRANSACTION_SERVICE_URL=http://localhost:8002
# ... other services

# RabbitMQ
RABBITMQ_URL=amqp://admin:rabbitmq_password_2024!@localhost:5672/eazepay
RABBITMQ_ENABLED=true
```

### Docker Compose

Services automatically discover each other via Docker network:

```yaml
services:
  financial-service:
    environment:
      - DOCKER_ENV=true
      - RABBITMQ_URL=amqp://admin:rabbitmq_password_2024!@rabbitmq:5672/eazepay
    networks:
      - eazepay-network
```

## Migration Guide

### Updating Existing Services

1. **Install dependencies:**
```bash
npm install @eazepay/service-client @eazepay/event-bus
```

2. **Replace direct axios calls:**
```typescript
// Before
const response = await axios.post('http://localhost:8000/api/users', data);

// After
import { ServiceClient, ServiceRegistry } from '@eazepay/service-client';

const registry = ServiceRegistry.getInstance();
const client = new ServiceClient({
  serviceName: 'my-service',
  baseURL: registry.getUrl('identity-service')
});

const user = await client.post('/api/users', data);
```

3. **Add event publishing:**
```typescript
// After critical operations
await publisher.publish(EventType.USER_CREATED, {
  userId: user.id,
  email: user.email
});
```

4. **Update environment variables:**
```bash
# Add to .env
DOCKER_ENV=false
CIRCUIT_BREAKER_ENABLED=true
RABBITMQ_ENABLED=true
```

## Troubleshooting

### Circuit Breaker Opens Frequently
- Check service health and logs
- Increase error threshold percentage
- Increase timeout values
- Review retry configuration

### Events Not Being Received
- Verify RabbitMQ connection
- Check queue bindings in RabbitMQ management UI
- Ensure routing keys match
- Check consumer is running

### Service Discovery Fails
- Verify DOCKER_ENV setting
- Check service URLs in environment
- Ensure services are on same Docker network
- Review ServiceRegistry configuration

## Support

For issues or questions:
1. Check this documentation
2. Review service logs
3. Check RabbitMQ management UI (http://localhost:15673)
4. Contact DevOps team

---

**Last Updated**: November 6, 2025  
**Maintained By**: DevOps Team
