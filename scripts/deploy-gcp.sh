#!/bin/bash
set -e

echo "🚀 Deploying AfriPay to GCP..."

# Variables
PROJECT_ID=${GCP_PROJECT_ID}
REGION=${GCP_REGION:-us-central1}

# Configure Docker for GCR
echo "🔐 Configuring Docker for GCR..."
gcloud auth configure-docker

# Build and push services
services=("customer-portal" "agent-portal" "identity-service" "biometric-service" "transaction-service" "wallet-service" "ussd-service" "agent-service")

for service in "${services[@]}"; do
  echo "📦 Building and pushing $service..."
  cd services/$service
  docker build -t gcr.io/$PROJECT_ID/$service:latest .
  docker push gcr.io/$PROJECT_ID/$service:latest
  cd ../..
done

# Deploy infrastructure with Terraform
echo "🏗️ Deploying infrastructure..."
cd infrastructure/terraform/gcp
terraform init
terraform apply -auto-approve

# Deploy to GKE
echo "☸️ Deploying to GKE..."
gcloud container clusters get-credentials afripay-production --zone $REGION
kubectl apply -f ../../kubernetes/

echo "✅ Deployment to GCP complete!"
