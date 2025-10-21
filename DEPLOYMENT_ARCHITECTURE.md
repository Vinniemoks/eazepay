# Eazepay - Distributed Deployment Architecture

## Overview

Eazepay is designed as a microservices architecture that can be deployed:
- **Monolithic**: All services on one server (current docker-compose setup)
- **Distributed**: Services across multiple servers/platforms
- **Hybrid**: Critical services on-premise, others in cloud
- **Multi-platform**: Web, mobile apps, desktop apps

## Service Independence Strategy

### 1. API Gateway Pattern
Each service exposes its own REST API and can be accessed independently through:
- Direct service URLs (for internal communication)
- API Gateway (for external/client access)
- Service mesh (for advanced deployments)

### 2. Configuration Management

#### Environment-Based Configuration
Each service uses environment variables for configuration, allowing deployment flexibility:

```env
# Service can work standalone or integrated
SERVICE_MODE=standalone|integrated

# Service discovery
IDENTITY_SERVICE_URL=http://identity-service:8000
TRANSACTION_SERVICE_URL=http://transaction-service:8002
# ... etc

# Database (can be separate per service)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eazepay_identity

# Message Queue (optional for standalone)
RABBITMQ_ENABLED=true
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
```

### 3. Service Communication Patterns

#### Synchronous (REST API)
- Direct HTTP calls between services
- Fallback mechanisms when services are unavailable
- Circuit breaker pattern for resilience

#### Asynchronous (Message Queue)
- Event-driven communication via RabbitMQ
- Services can work offline and sync later
- Eventual consistency model

#### Hybrid Mode
- Critical operations use synchronous calls
- Non-critical operations use async messaging
- Graceful degradation when services are down

## Deployment Scenarios

### Scenario 1: Single Server (Current)
```
┌─────────────────────────────────────┐
│         Single Server               │
│  ┌──────────────────────────────┐  │
│  │   Docker Compose             │  │
│  │  - All services              │  │
│  │  - Shared database           │  │
│  │  - Local network             │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Scenario 2: Distributed Services
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Server 1   │  │   Server 2   │  │   Server 3   │
│              │  │              │  │              │
│  Identity    │  │ Transaction  │  │   Wallet     │
│  Biometric   │  │   Agent      │  │   USSD       │
│              │  │              │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
              API Gateway / Load Balancer
```

### Scenario 3: Cloud + On-Premise Hybrid
```
┌─────────────────────────────────────┐
│         Cloud (AWS/Azure)           │
│  - Customer Portal                  │
│  - Agent Portal                     │
│  - Transaction Service              │
│  - Wallet Service                   │
└──────────────┬──────────────────────┘
               │ VPN/API Gateway
┌──────────────┴──────────────────────┐
│      On-Premise (Your Server)       │
│  - Identity Service                 │
│  - Biometric Service                │
│  - Admin Portal                     │
│  - Database (sensitive data)        │
└─────────────────────────────────────┘
```

### Scenario 4: Multi-Platform Deployment
```
┌─────────────────────────────────────────────────┐
│              Backend Services                   │
│         (Can be anywhere - cloud/on-prem)       │
└────────┬────────────────────────────────────────┘
         │
    ┌────┴────┐
    │   API   │
    │ Gateway │
    └────┬────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
┌───┴────┐  ┌──────┐  ┌──────┐  ┌───┴────┐
│  Web   │  │Mobile│  │Mobile│  │Desktop │
│Portals │  │ iOS  │  │Android│  │  App   │
└────────┘  └──────┘  └──────┘  └────────┘
```

## Service-Specific Deployment Guides

### Identity Service (Core - Deploy First)
**Can run on**: Any server, cloud, on-premise
**Dependencies**: PostgreSQL, Redis
**Ports**: 8000
**Critical**: Yes - Required by all other services

**Standalone Mode**:
```env
SERVICE_MODE=standalone
DB_HOST=localhost
REDIS_HOST=localhost
# Other services optional
BIOMETRIC_SERVICE_URL=http://localhost:8001  # Optional
TRANSACTION_SERVICE_URL=http://localhost:8002  # Optional
```

### Transaction Service
**Can run on**: Separate server, cloud
**Dependencies**: PostgreSQL, Redis, RabbitMQ (optional)
**Ports**: 8002
**Critical**: Yes

**Standalone Mode**:
```env
SERVICE_MODE=standalone
IDENTITY_SERVICE_URL=https://identity.eazepay.com  # Remote
WALLET_SERVICE_URL=https://wallet.eazepay.com  # Remote
```

### Wallet Service
**Can run on**: Separate server, cloud
**Dependencies**: PostgreSQL, Redis
**Ports**: 8003

### Biometric Service
**Can run on**: On-premise (security requirement)
**Dependencies**: PostgreSQL, Redis
**Ports**: 8001
**Note**: Should be on-premise for data security

### USSD Service
**Can run on**: Telecom provider network or cloud
**Dependencies**: Redis (for session management)
**Ports**: 8004

### Agent Service
**Can run on**: Any server, cloud
**Dependencies**: PostgreSQL, MongoDB, Redis
**Ports**: 8005

### Portals (Frontend)

#### Customer Portal
**Deploy to**: CDN, Static hosting (Netlify, Vercel, S3)
**Configuration**: API Gateway URL via environment variable
```env
VITE_API_URL=https://api.eazepay.com
```

#### Agent Portal
**Deploy to**: CDN, Static hosting
**Configuration**: API Gateway URL

#### Admin Portal
**Deploy to**: Secure server, VPN-protected
**Configuration**: Direct service URLs or API Gateway

#### Superuser Portal
**Deploy to**: Highly secure server, VPN-only
**Configuration**: Direct service URLs

## Mobile App Architecture

### React Native / Flutter App Structure
```
┌─────────────────────────────────────┐
│         Mobile App                  │
│  ┌──────────────────────────────┐  │
│  │   Presentation Layer         │  │
│  │  - Screens                   │  │
│  │  - Components                │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │   Business Logic Layer       │  │
│  │  - State Management          │  │
│  │  - Local Storage             │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │   API Layer                  │  │
│  │  - HTTP Client               │  │
│  │  - Offline Queue             │  │
│  │  - Biometric Integration     │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
              │
              ▼
    ┌─────────────────┐
    │   API Gateway   │
    │ api.eazepay.com │
    └─────────────────┘
```

### Mobile App Features
- **Offline Mode**: Local SQLite database for offline transactions
- **Biometric Auth**: Fingerprint/Face ID integration
- **Push Notifications**: Firebase/APNs for transaction alerts
- **QR Code**: Payment and agent identification
- **USSD Fallback**: When internet is unavailable

## Database Strategy

### Option 1: Shared Database (Current)
- Single PostgreSQL instance
- All services connect to same database
- Different schemas per service
- **Pros**: Simple, ACID transactions
- **Cons**: Single point of failure, scaling limitations

### Option 2: Database Per Service
- Each service has its own database
- Can be on different servers
- **Pros**: True independence, better scaling
- **Cons**: Distributed transactions complexity

### Option 3: Hybrid
- Critical services (Identity, Transaction) share database
- Other services have separate databases
- **Pros**: Balance of consistency and independence

## API Gateway Configuration

### Single Entry Point
```
https://api.eazepay.com
  ├── /auth/*          → Identity Service
  ├── /transactions/*  → Transaction Service
  ├── /wallet/*        → Wallet Service
  ├── /biometric/*     → Biometric Service
  ├── /ussd/*          → USSD Service
  ├── /agent/*         → Agent Service
  ├── /admin/*         → Admin endpoints
  └── /superuser/*     → Superuser endpoints
```

### Multiple Domain Strategy
```
identity.eazepay.com    → Identity Service
transactions.eazepay.com → Transaction Service
wallet.eazepay.com      → Wallet Service
admin.eazepay.com       → Admin Portal
app.eazepay.com         → Customer Portal
agents.eazepay.com      → Agent Portal
```

## Security Considerations

### Service-to-Service Authentication
- JWT tokens for service authentication
- API keys for service-to-service calls
- mTLS for production environments

### Network Security
- VPN for sensitive services (Identity, Biometric)
- Firewall rules per service
- Rate limiting per service
- DDoS protection at API Gateway

### Data Security
- Encryption at rest (database level)
- Encryption in transit (TLS/SSL)
- Biometric data stays on-premise
- PII data encryption

## Monitoring & Observability

### Distributed Tracing
- Correlation IDs across all services
- Centralized logging (ELK stack)
- Distributed tracing (Jaeger/Zipkin)

### Health Checks
Each service exposes:
- `/health` - Basic health check
- `/health/ready` - Ready to accept traffic
- `/health/live` - Service is alive

### Metrics
- Prometheus metrics per service
- Grafana dashboards
- Alerts for service failures

## Deployment Checklist

### Pre-Deployment
- [ ] Update all service URLs in environment variables
- [ ] Configure database connections
- [ ] Set up SSL certificates
- [ ] Configure API Gateway
- [ ] Set up monitoring
- [ ] Test service-to-service communication
- [ ] Configure backup strategy

### Per Service Deployment
- [ ] Build Docker image
- [ ] Push to container registry
- [ ] Deploy to target server/cloud
- [ ] Run database migrations
- [ ] Verify health checks
- [ ] Test API endpoints
- [ ] Monitor logs

### Post-Deployment
- [ ] Verify all services are communicating
- [ ] Test end-to-end workflows
- [ ] Monitor performance metrics
- [ ] Set up alerts
- [ ] Document deployment

## Next Steps

1. **Create service-specific deployment configs** for each platform
2. **Implement API Gateway** (Nginx, Kong, or AWS API Gateway)
3. **Set up CI/CD pipelines** for automated deployments
4. **Create mobile app** (React Native or Flutter)
5. **Implement offline capabilities** in mobile app
6. **Set up monitoring** and alerting
7. **Create deployment scripts** for each scenario
8. **Document API contracts** for each service

## Support for Future Platforms

The architecture supports:
- **Web Apps**: Current React portals
- **Mobile Apps**: iOS and Android (to be developed)
- **Desktop Apps**: Electron-based apps
- **USSD**: Feature phone support
- **API Integration**: Third-party integrations
- **Webhooks**: Event notifications to external systems
