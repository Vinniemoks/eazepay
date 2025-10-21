#!/bin/bash
set -e

echo "🚀 Deploying AfriPay to AWS..."

# Variables
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push services
services=("customer-portal" "agent-portal" "identity-service" "biometric-service" "transaction-service" "wallet-service" "ussd-service" "agent-service")

for service in "${services[@]}"; do
  echo "📦 Building and pushing $service..."
  cd services/$service
  docker build -t $ECR_REGISTRY/$service:latest .
  docker push $ECR_REGISTRY/$service:latest
  cd ../..
done

# Deploy infrastructure with Terraform
echo "🏗️ Deploying infrastructure..."
cd infrastructure/terraform/aws
terraform init
terraform apply -auto-approve

echo "✅ Deployment to AWS complete!"
