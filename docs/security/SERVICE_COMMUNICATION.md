# Service Communication Guide

Eazepay uses a hybrid approach for communication between microservices, combining synchronous and asynchronous patterns to ensure both responsiveness and resilience.

## 1. Synchronous Communication (REST APIs)

**When to use:** For immediate, request/response interactions where the client needs an instant answer.

- **Examples:**
  - `API Gateway` calling `identity-service` to authenticate a user.
  - `transaction-service` calling `wallet-service` to check a balance before a transfer.
  - `ai-ml-service` being called by `transaction-service` for a real-time fraud score.

**Implementation:**
- All services expose a RESTful API.
- We use the `@eazepay/service-client` library, which provides:
  - **Automatic Retries**: Handles transient network failures.
  - **Circuit Breakers**: Prevents cascading failures if a downstream service is down.
  - **Centralized Service Discovery**: A single registry for service URLs.

```typescript
// Example: Calling identity-service from another service
import { ServiceClient, ServiceRegistry } from '@eazepay/service-client';

const registry = ServiceRegistry.getInstance();
const identityClient = new ServiceClient({
  baseURL: registry.getUrl('identity-service'),
});

const user = await identityClient.get('/api/users/123');
```

## 2. Asynchronous Communication (Event Bus)

**When to use:** For operations that can be done in the background, do not need to block the user's request, or need to notify multiple services. This is the **preferred method** for non-critical path operations to improve resilience.

- **Examples:**
  - `transaction-service` publishing a `TRANSACTION_COMPLETED` event.
  - `blockchain-service` subscribing to `TRANSACTION_COMPLETED` to write to the immutable ledger.
  - A future `notification-service` subscribing to `TRANSACTION_COMPLETED` to send an email receipt.
  - `identity-service` publishing a `USER_REGISTERED` event.

**Implementation:**
- We use RabbitMQ as our message broker.
- The `@eazepay/event-bus` library provides a simple interface for publishing and subscribing.

### Publishing an Event

```typescript
// In transaction-service, after a transaction is saved to its own DB
import { EventPublisher, EventType } from '@eazepay/event-bus';

const publisher = new EventPublisher(eventBus, 'transaction-service');

await publisher.publish(EventType.TRANSACTION_COMPLETED, {
  transactionId: 'txn_123',
  amount: 5000,
  userId: 'user_abc'
});
```

### Subscribing to an Event

```typescript
// In blockchain-service
import { EventSubscriber, EventType } from '@eazepay/event-bus';

const subscriber = new EventSubscriber(eventBus, 'blockchain-service');

await subscriber.subscribe(EventType.TRANSACTION_COMPLETED, async (event) => {
  logger.info('Received transaction to record on blockchain', { data: event.data });
  // Perform the slow, async blockchain write here
});
```

## Guiding Principle

> If the user does not need to wait for the result of an operation, do it asynchronously.

This approach ensures that the Eazepay platform remains fast and resilient, even as we add more complex, background-intensive features.