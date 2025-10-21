# AfriPay Universal

A comprehensive fintech platform providing seamless payment solutions across Africa with support for mobile money, biometric authentication, and agent networks.

## 🎯 Production Ready

AfriPay is now **cloud-ready** with complete customer-facing interfaces for AWS and Google Cloud Platform deployment.

## 🏗️ Architecture

### Customer-Facing Applications
- **Customer Portal** (Port 3001) - React - User wallet and transactions
- **Agent Portal** (Port 3002) - React - Agent operations and analytics
- **Admin Portal** (Port 8080) - Static - System administration

### Backend Microservices
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
- **Nginx** - API Gateway & Load Balancer

## 🚀 Quick Start

### Local Development

```bash
# Quick deploy all services locally
chmod +x scripts/deploy-local.sh
./scripts/deploy-local.sh
```

Access your applications:
- **Customer Portal**: http://localhost:3001
- **Agent Portal**: http://localhost:3002
- **Admin Portal**: http://localhost:8080
- **API Gateway**: http://localhost:80

### Cloud Deployment

#### Deploy to AWS
```bash
export AWS_REGION=us-east-1
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh
```

#### Deploy to GCP
```bash
export GCP_PROJECT_ID=your-project-id
chmod +x scripts/deploy-gcp.sh
./scripts/deploy-gcp.sh
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📚 Documentation

- [Cloud Deployment Overview](docs/CLOUD_DEPLOYMENT_OVERVIEW.md)
- [AWS Deployment Guide](docs/deployment/AWS_DEPLOYMENT.md)
- [GCP Deployment Guide](docs/deployment/GCP_DEPLOYMENT.md)
- [API Documentation](docs/api/README.md)
- [Architecture Overview](docs/architecture/README.md)

## 🛠️ Development

### Frontend Applications
- Customer Portal: http://localhost:3001
- Agent Portal: http://localhost:3002
- Admin Portal: http://localhost:8080

### Backend Services
- Identity Service: http://localhost:8000
- Biometric Service: http://localhost:8001
- Transaction Service: http://localhost:8002
- Wallet Service: http://localhost:8003
- USSD Gateway: http://localhost:8004
- Agent Service: http://localhost:8005

### Infrastructure
- PostgreSQL: `localhost:5433` (user: developer)
- Redis: `localhost:6379`
- MongoDB: `localhost:27017`
- RabbitMQ: http://localhost:15673
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

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

**Status:** ✅ Production Ready - Cloud Deployment Available

See [GETTING_STARTED.md](./GETTING_STARTED.md) for deployment instructions.