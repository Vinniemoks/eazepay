# AfriPay Universal

A comprehensive fintech platform providing seamless payment solutions across Africa with support for mobile money, biometric authentication, and agent networks.

## 🏗️ Architecture

### Microservices
- **Identity Service** (Port 8000) - Node.js/TypeScript - Authentication & Authorization
- **Biometric Service** (Port 8001) - Python/FastAPI - Biometric Authentication
- **Transaction Service** (Port 8002) - Java/Spring Boot - Payment Processing  
- **Wallet Service** (Port 8003) - Go - Digital Wallet Management
- **USSD Gateway** (Port 8004) - Node.js - USSD Integration
- **Agent Service** (Port 8005) - Node.js - Agent Network Management

### Infrastructure
- **PostgreSQL** - Primary database
- **Redis** - Caching & sessions
- **MongoDB** - Document storage
- **RabbitMQ** - Message queue

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Java 17+
- Go 1.19+
- Docker & Docker Compose

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/afripay-universal.git
cd afripay-universal

# Run setup script
chmod +x scripts/setup/dev-setup.sh
./scripts/setup/dev-setup.sh

# Start services individually
cd services/identity-service && npm install && npm run dev
cd services/biometric-service && pip install -r requirements.txt && python main.py
```

### Using Docker Compose

```bash
# Start infrastructure services
docker-compose up -d postgresql redis mongodb rabbitmq

# Start all services (when ready)
docker-compose up -d
```

If you run into transient TLS handshake timeouts while pulling images (for example, `net/http: TLS handshake timeout`), you can
use the helper script below to retry `docker compose up` automatically until it succeeds:

```bash
chmod +x scripts/docker-compose-up-retry.sh
./scripts/docker-compose-up-retry.sh
```

Set the `MAX_RETRIES` and `RETRY_DELAY` environment variables to customise the retry behaviour if needed.

## 📚 Documentation

- [API Documentation](docs/api/README.md)
- [Architecture Overview](docs/architecture/README.md)
- [Deployment Guide](docs/deployment/README.md)
- [Hardware Specifications](docs/hardware/README.md)

## 🛠️ Development

### Service Endpoints
- Identity Service: http://localhost:8000
- Biometric Service: http://localhost:8001
- Transaction Service: http://localhost:8002
- Wallet Service: http://localhost:8003
- USSD Gateway: http://localhost:8004
- Agent Service: http://localhost:8005

### Database Access
- PostgreSQL: `localhost:5432` (user: developer)
- Redis: `localhost:6379`
- MongoDB: `localhost:27017`
- RabbitMQ Management: http://localhost:15672

## 🔒 Security

⚠️ **Important Security Notes:**
- Never commit `.env` files to version control
- Change default passwords in production
- Use proper SSL/TLS certificates in production
- Follow security best practices for each service

## 🤝 Contributing

This is a private project. For access and contribution guidelines, contact the development team.

## 📄 License

Proprietary - All rights reserved

---

**Status:** 🚧 Development Phase