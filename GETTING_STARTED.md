# Getting Started with AfriPay Cloud Deployment

## Overview

AfriPay is now a complete, production-ready fintech platform with customer-facing interfaces for both AWS and Google Cloud Platform.

## What You Have

### ✅ Frontend Applications (Customer Interaction)

1. **Customer Portal** - For end users
   - Location: `services/customer-portal/`
   - Features: Registration, login, wallet, transfers, transactions
   - Port: 3001

2. **Agent Portal** - For agents
   - Location: `services/agent-portal/`
   - Features: Customer management, transactions, commissions, analytics
   - Port: 3002

3. **Admin Portal** - For administrators
   - Location: `services/web-portal/`
   - Port: 8080

### ✅ Backend Microservices

All your existing services with proper Docker configurations:
- Identity Service (Node.js) - Port 8000
- Biometric Service (Python) - Port 8001
- Transaction Service (Java) - Port 8002
- Wallet Service (Go) - Port 8003
- USSD Service (Node.js) - Port 8004
- Agent Service (Node.js) - Port 8005

### ✅ Cloud Infrastructure

**AWS Setup:**
- Terraform configurations in `infrastructure/terraform/aws/`
- ECS Fargate, RDS, ElastiCache, ALB, CloudFront
- GitHub Actions workflow: `.github/workflows/deploy-aws.yml`
- Deployment script: `scripts/deploy-aws.sh`

**GCP Setup:**
- Terraform configurations in `infrastructure/terraform/gcp/`
- GKE, Cloud SQL, Memorystore, Load Balancing, CDN
- Kubernetes manifests in `infrastructure/kubernetes/`
- GitHub Actions workflow: `.github/workflows/deploy-gcp.yml`
- Deployment script: `scripts/deploy-gcp.sh`

## Quick Start

### Option 1: Test Locally (Recommended First Step)

```bash
# On Windows (Git Bash or WSL)
bash scripts/deploy-local.sh

# Or manually
docker-compose up -d
```

Access your applications:
- **Customer Portal**: http://localhost:3001
- **Agent Portal**: http://localhost:3002
- **Admin Portal**: http://localhost:8080
- **API Gateway**: http://localhost:80
- **Grafana Monitoring**: http://localhost:3000

### Option 2: Deploy to AWS

**Prerequisites:**
- AWS account with appropriate permissions
- AWS CLI configured
- Terraform installed
- Docker installed

**Steps:**

1. Create ECR repositories:
```bash
aws ecr create-repository --repository-name customer-portal
aws ecr create-repository --repository-name agent-portal
# ... repeat for other services
```

2. Configure Terraform variables:
```bash
cd infrastructure/terraform/aws
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

3. Deploy:
```bash
export AWS_REGION=us-east-1
bash scripts/deploy-aws.sh
```

**Detailed Guide**: See `docs/deployment/AWS_DEPLOYMENT.md`

### Option 3: Deploy to GCP

**Prerequisites:**
- GCP account with billing enabled
- gcloud CLI configured
- Terraform installed
- Docker installed

**Steps:**

1. Enable required APIs:
```bash
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
```

2. Configure Terraform:
```bash
cd infrastructure/terraform/gcp
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project ID
```

3. Deploy:
```bash
export GCP_PROJECT_ID=your-project-id
bash scripts/deploy-gcp.sh
```

**Detailed Guide**: See `docs/deployment/GCP_DEPLOYMENT.md`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Load Balancer / CDN (CloudFront/Cloud CDN) │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│ Customer Portal│  │Agent Portal │  │  Admin Portal   │
│   React App    │  │  React App  │  │  Static Site    │
│   Port 3001    │  │  Port 3002  │  │   Port 8080     │
└────────────────┘  └─────────────┘  └─────────────────┘
                            │
                    ┌───────▼────────┐
                    │  API Gateway   │
                    │     (Nginx)    │
                    └───────┬────────┘
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│Identity Service│  │Transaction  │  │ Wallet Service  │
│  Node.js:8000  │  │  Java:8002  │  │    Go:8003      │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│Biometric Svc   │  │  USSD Svc   │  │  Agent Service  │
│ Python:8001    │  │  Node:8004  │  │  Node.js:8005   │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   PostgreSQL   │  │    Redis    │  │    RabbitMQ     │
│   (Primary DB) │  │   (Cache)   │  │  (Message Queue)│
└────────────────┘  └─────────────┘  └─────────────────┘
```

## Customer Interaction Flow

### For End Users (Customer Portal)
1. User visits `app.afripay.com`
2. Registers/logs in via Identity Service
3. Views wallet balance via Wallet Service
4. Initiates transfer via Transaction Service
5. Views transaction history

### For Agents (Agent Portal)
1. Agent visits `agent.afripay.com`
2. Logs in with agent credentials
3. Registers new customers
4. Processes transactions
5. Views commission earnings
6. Accesses analytics dashboard

## Cost Estimates

### AWS (Production)
- **Small Scale** (2-3 instances): ~$500/month
- **Medium Scale** (5-10 instances): ~$800/month
- **Large Scale** (10+ instances): ~$1,500+/month

### GCP (Production)
- **Small Scale** (2-3 nodes): ~$450/month
- **Medium Scale** (5-10 nodes): ~$750/month
- **Large Scale** (10+ nodes): ~$1,400+/month

## Security Checklist

Before going to production:

- [ ] Change all default passwords in `.env` files
- [ ] Set up SSL/TLS certificates (ACM for AWS, Certificate Manager for GCP)
- [ ] Configure VPC/network isolation
- [ ] Enable database encryption
- [ ] Set up secrets management
- [ ] Configure WAF rules
- [ ] Enable audit logging
- [ ] Set up automated backups
- [ ] Configure monitoring alerts
- [ ] Review and restrict IAM policies
- [ ] Enable DDoS protection
- [ ] Set up rate limiting

## Monitoring & Observability

Both deployments include:
- **Logs**: Centralized logging (CloudWatch/Cloud Logging)
- **Metrics**: Prometheus + Grafana dashboards
- **Tracing**: Distributed tracing support
- **Alerts**: Configurable alerts for errors and performance
- **Uptime**: Health check monitoring

## Next Steps

1. **Test Locally**: Run `bash scripts/deploy-local.sh` to verify everything works
2. **Choose Cloud**: Decide between AWS or GCP based on your needs
3. **Configure**: Update Terraform variables with your settings
4. **Deploy Infrastructure**: Run Terraform to create cloud resources
5. **Deploy Applications**: Use deployment scripts to push containers
6. **Configure DNS**: Point your domains to the load balancers
7. **Set Up SSL**: Configure certificates for HTTPS
8. **Monitor**: Set up alerts and dashboards
9. **Load Test**: Test with expected traffic patterns
10. **Go Live**: Switch DNS to production

## Documentation

- **Quick Start**: This file
- **Cloud Overview**: `docs/CLOUD_DEPLOYMENT_OVERVIEW.md`
- **AWS Guide**: `docs/deployment/AWS_DEPLOYMENT.md`
- **GCP Guide**: `docs/deployment/GCP_DEPLOYMENT.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Summary**: `CLOUD_READY_SUMMARY.md`

## Support

For issues or questions:
1. Check the relevant documentation
2. Review logs in Grafana (local) or CloudWatch/Cloud Logging (cloud)
3. Verify all services are healthy
4. Check GitHub Actions for CI/CD issues

---

**Your platform is ready to ship! 🚀**
