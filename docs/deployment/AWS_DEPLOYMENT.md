# AWS Deployment Guide

## Prerequisites

- AWS CLI configured
- Terraform >= 1.0
- Docker
- kubectl

## Architecture

Eazepay on AWS uses:
- **ECS Fargate** for container orchestration
- **RDS PostgreSQL** for relational data
- **ElastiCache Redis** for caching
- **Application Load Balancer** for traffic distribution
- **CloudFront** for CDN
- **Route 53** for DNS
- **ACM** for SSL certificates

## Initial Setup

### 1. Create S3 Bucket for Terraform State

```bash
aws s3 mb s3://eazepay-terraform-state --region us-east-1
aws s3api put-bucket-versioning \
  --bucket eazepay-terraform-state \
  --versioning-configuration Status=Enabled
```

### 2. Create ECR Repositories

```bash
for service in identity-service biometric-service transaction-service wallet-service ussd-service agent-service customer-portal agent-portal; do
  aws ecr create-repository --repository-name $service --region us-east-1
done
```

### 3. Configure Terraform Variables

Create `infrastructure/terraform/aws/terraform.tfvars`:

```hcl
aws_region              = "us-east-1"
environment             = "production"
db_master_username      = "eazepay_admin"
db_master_password      = "CHANGE_ME_SECURE_PASSWORD"
ssl_certificate_arn     = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
cloudfront_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
```

### 4. Deploy Infrastructure

```bash
cd infrastructure/terraform/aws
terraform init
terraform plan
terraform apply
```

### 5. Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push each service
for service in customer-portal agent-portal; do
  cd services/$service
  docker build -t ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/$service:latest .
  docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/$service:latest
  cd ../..
done
```

### 6. Configure DNS

Point your domain to the CloudFront distribution or ALB:

```bash
# Get ALB DNS name
terraform output alb_dns_name

# Create Route 53 records
aws route53 change-resource-record-sets --hosted-zone-id ZONE_ID --change-batch file://dns-records.json
```

## Monitoring

- **CloudWatch Logs**: All service logs
- **CloudWatch Metrics**: CPU, memory, request counts
- **X-Ray**: Distributed tracing

## Scaling

ECS services auto-scale based on CPU/memory:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/eazepay-production/customer-portal \
  --min-capacity 2 \
  --max-capacity 10
```

## Cost Optimization

- Use Fargate Spot for non-critical workloads
- Enable RDS auto-scaling
- Use CloudFront caching aggressively
- Set up AWS Budgets alerts

## Disaster Recovery

- RDS automated backups (7-day retention)
- Cross-region replication for critical data
- Infrastructure as Code for quick rebuild
