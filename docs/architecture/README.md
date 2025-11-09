Eazepay Universal - Architecture Overview
System Architecture
Eazepay Universal is built using a microservices architecture designed for high availability, scalability, and security.
Core Principles

Microservices Architecture: Independent, loosely coupled services
Event-Driven Communication: Asynchronous messaging for resilience
Security-First: Zero-trust architecture with encryption at rest and in transit
Multi-Channel Support: USSD, Mobile App, Agent Terminals
Offline-First: Local processing with eventual consistency

Service Overview
ServiceTechnologyPurposePortIdentity ServiceNode.js/TypeScriptUser management, authentication8000Biometric ServicePython/FastAPIFingerprint, face, voice processing8001Transaction ServiceJava/Spring BootPayment processing, ledger8002Wallet ServiceGoAccount balances, limits8003USSD GatewayNode.jsUSSD menu system8004Agent ServiceNode.jsAgent management, terminals8005
Data Flow
User Request → API Gateway → Service → Database
     ↓
Event Published → Message Queue → Other Services
     ↓
Notifications → SMS/Push → User
Security Architecture

API Gateway: Rate limiting, authentication, routing
Service-to-Service: mTLS, JWT tokens
Data Encryption: AES-256 for sensitive data
Biometric Templates: Zero-knowledge storage
Audit Logging: All transactions logged immutably

Deployment Architecture

Development: Docker Compose
Production: Kubernetes on AWS/Azure
Database: PostgreSQL primary, Redis cache, MongoDB analytics
Message Queue: RabbitMQ for event streaming
Monitoring: Prometheus, Grafana, ELK Stack

Scalability Design

Horizontal Scaling: Auto-scaling pods in Kubernetes
Database Sharding: User-based partitioning
Caching Strategy: Multi-layer (L1: Memory, L2: Redis, L3: CDN)
Load Balancing: Round-robin with health checks

Infrastructure Architecture
----------------------

Our infrastructure is designed for high availability, security, and scalability. Please refer to our detailed infrastructure documentation:

- [Infrastructure Architecture](./diagrams/infrastructure-architecture.md)
  - Cloud Infrastructure Overview
  - Kubernetes Infrastructure
  - Network Architecture
  - Disaster Recovery Setup
  - Security Infrastructure
  - Monitoring Infrastructure
  - CI/CD Infrastructure

Experience Visuals
------------------

Refer to [Service Experience and System Visuals](service-visuals.md) for user-facing and backend diagrams, including the superuser governance model.

For an interactive POS-terminal rendering of those experiences, open the [Eazepay POS Service Visuals](pos-terminal/index.html) prototype in a browser. The companion [stylesheet](pos-terminal/styles.css) can be reused within POS deployments that require the same look and feel.
