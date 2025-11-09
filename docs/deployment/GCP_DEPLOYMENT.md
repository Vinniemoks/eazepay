# GCP Deployment Guide

## Prerequisites

- gcloud CLI configured
- Terraform >= 1.0
- Docker
- kubectl

## Architecture

Eazepay on GCP uses:
- **GKE (Google Kubernetes Engine)** for container orchestration
- **Cloud SQL PostgreSQL** for relational data
- **Cloud Memorystore Redis** for caching
- **Cloud Load Balancing** for traffic distribution
- **Cloud CDN** for content delivery
- **Cloud DNS** for domain management

## Initial Setup

### 1. Create GCS Bucket for Terraform State

```bash
gsutil mb gs://eazepay-terraform-state
gsutil versioning set on gs://eazepay-terraform-state
```

### 2. Enable Required APIs

```bash
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable compute.googleapis.com
```

### 3. Configure Terraform

Create `infrastructure/terraform/gcp/terraform.tfvars`:

```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
environment = "production"
```

### 4. Deploy Infrastructure

```bash
cd infrastructure/terraform/gcp
terraform init
terraform plan
terraform apply
```

### 5. Build and Push Images

```bash
gcloud auth configure-docker

for service in customer-portal agent-portal; do
  cd services/$service
  docker build -t gcr.io/PROJECT_ID/$service:latest .
  docker push gcr.io/PROJECT_ID/$service:latest
  cd ../..
done
```

### 6. Deploy to GKE

```bash
gcloud container clusters get-credentials eazepay-production --zone us-central1

kubectl create namespace eazepay
kubectl apply -f infrastructure/kubernetes/
```

## Monitoring

- **Cloud Logging**: Centralized logs
- **Cloud Monitoring**: Metrics and alerts
- **Cloud Trace**: Distributed tracing

## Scaling

GKE auto-scales based on load:

```bash
kubectl autoscale deployment customer-portal --cpu-percent=70 --min=2 --max=10 -n eazepay
```
