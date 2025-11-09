# Cloud Deployment Overview

Eazepay is now production-ready for deployment to AWS or Google Cloud Platform with complete customer-facing interfaces.

## Architecture Components

### Frontend Applications (Customer-Facing)

1. **Customer Portal** (Port 3001)
   - User registration and authentication
   - Wallet management
   - Money transfers
   - Transaction history
   - Profile management

2. **Agent Portal** (Port 3002)
   - Agent authentication
   - Customer registration
   - Transaction processing
   - Commission tracking
   - Analytics dashboard

3. **Admin Portal** (Port 8080)
   - System administration
   - Monitoring and reporting

### Backend Microservices

- **Identity Service** (8000) - Node.js/TypeScript
- **Biometric Service** (8001) - Python/FastAPI
- **Transaction Service** (8002) - Java/Spring Boot
- **Wallet Service** (8003) - Go
- **USSD Service** (8004) - Node.js
- **Agent Service** (8005) - Node.js/TypeScript

### Infrastructure

- PostgreSQL, Redis, MongoDB, RabbitMQ
- API Gateway (Nginx)
- Monitoring (Prometheus, Grafana, ELK)

## Deployment Options

### Option 1: AWS Deployment

**Services Used:**
- ECS Fargate for containers
- RDS PostgreSQL
- ElastiCache Redis
- Application Load Balancer
- CloudFront CDN
- Route 53 DNS

**Cost Estimate:** ~$500-800/month for production

See [AWS_DEPLOYMENT.md](./deployment/AWS_DEPLOYMENT.md)

### Option 2: GCP Deployment

**Services Used:**
- Google Kubernetes Engine (GKE)
- Cloud SQL PostgreSQL
- Cloud Memorystore Redis
- Cloud Load Balancing
- Cloud CDN
- Cloud DNS

**Cost Estimate:** ~$450-750/month for production

See [GCP_DEPLOYMENT.md](./deployment/GCP_DEPLOYMENT.md)

## Quick Start

### Local Development

```bash
# Start all services
docker-compose up -d

# Access applications
# Customer Portal: http://localhost:3001
# Agent Portal: http://localhost:3002
# Admin Portal: http://localhost:8080
# API Gateway: http://localhost:80
```

### Production Deployment

1. Choose your cloud provider (AWS or GCP)
2. Follow the respective deployment guide
3. Configure DNS and SSL certificates
4. Set up monitoring and alerts
5. Configure auto-scaling policies

## Security Checklist

- [ ] Change all default passwords
- [ ] Configure SSL/TLS certificates
- [ ] Set up VPC/network isolation
- [ ] Enable database encryption
- [ ] Configure WAF rules
- [ ] Set up secrets management
- [ ] Enable audit logging
- [ ] Configure backup policies

## Monitoring

All deployments include:
- Application logs (centralized)
- Performance metrics
- Error tracking
- Uptime monitoring
- Cost tracking

## Support

For deployment assistance, contact the DevOps team.
