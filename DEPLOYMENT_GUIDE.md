# AfriPay Cloud Deployment Guide

Your AfriPay platform is now ready for production deployment with complete customer-facing interfaces.

## What's New

### Customer-Facing Frontends

1. **Customer Portal** - Full-featured web app for end users
   - Registration and login
   - Wallet management
   - Money transfers
   - Transaction history
   - Profile management

2. **Agent Portal** - Dedicated interface for agents
   - Agent authentication
   - Customer onboarding
   - Transaction processing
   - Commission tracking
   - Analytics dashboard

3. **Admin Portal** - System administration interface

### Cloud Infrastructure

- **AWS**: ECS, RDS, ElastiCache, ALB, CloudFront
- **GCP**: GKE, Cloud SQL, Memorystore, Load Balancing, CDN
- **CI/CD**: GitHub Actions workflows for both clouds
- **IaC**: Terraform configurations for reproducible deployments

## Quick Start

### Local Development

```bash
chmod +x scripts/deploy-local.sh
./scripts/deploy-local.sh
```

Access:
- Customer Portal: http://localhost:3001
- Agent Portal: http://localhost:3002
- Admin Portal: http://localhost:8080

### Deploy to AWS

```bash
# Set environment variables
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret

# Deploy
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh
```

### Deploy to GCP

```bash
# Set environment variables
export GCP_PROJECT_ID=your-project-id
export GCP_REGION=us-central1

# Deploy
chmod +x scripts/deploy-gcp.sh
./scripts/deploy-gcp.sh
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer / CDN                   │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│ Customer Portal│  │Agent Portal │  │  Admin Portal   │
│   (React)      │  │  (React)    │  │    (Static)     │
└────────────────┘  └─────────────┘  └─────────────────┘
                            │
                    ┌───────▼────────┐
                    │  API Gateway   │
                    └───────┬────────┘
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│Identity Service│  │Transaction  │  │ Wallet Service  │
│  (Node.js)     │  │  (Java)     │  │     (Go)        │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   PostgreSQL   │  │    Redis    │  │    RabbitMQ     │
└────────────────┘  └─────────────┘  └─────────────────┘
```

## Cost Estimates

### AWS (Monthly)
- ECS Fargate: $200-300
- RDS PostgreSQL: $150-200
- ElastiCache: $50-100
- Load Balancer: $20-30
- CloudFront: $30-50
- **Total: ~$500-800/month**

### GCP (Monthly)
- GKE: $180-250
- Cloud SQL: $140-180
- Memorystore: $50-90
- Load Balancing: $20-30
- Cloud CDN: $25-45
- **Total: ~$450-750/month**

## Security Checklist

Before going to production:

- [ ] Change all default passwords in `.env` files
- [ ] Configure SSL/TLS certificates
- [ ] Set up VPC/network isolation
- [ ] Enable database encryption at rest
- [ ] Configure WAF rules
- [ ] Set up secrets management (AWS Secrets Manager / GCP Secret Manager)
- [ ] Enable audit logging
- [ ] Configure automated backups
- [ ] Set up monitoring alerts
- [ ] Review IAM policies

## Monitoring

Both deployments include:
- Centralized logging (CloudWatch / Cloud Logging)
- Metrics and dashboards (Prometheus + Grafana)
- Distributed tracing
- Uptime monitoring
- Cost tracking

## Next Steps

1. Review and customize Terraform variables
2. Set up domain names and DNS
3. Configure SSL certificates
4. Run security audit
5. Set up CI/CD pipelines
6. Configure monitoring alerts
7. Perform load testing
8. Create disaster recovery plan

## Support

For detailed deployment instructions:
- AWS: See `docs/deployment/AWS_DEPLOYMENT.md`
- GCP: See `docs/deployment/GCP_DEPLOYMENT.md`
- Overview: See `docs/CLOUD_DEPLOYMENT_OVERVIEW.md`
