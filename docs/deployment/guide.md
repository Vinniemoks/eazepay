# 🚀 Eazepay Deployment Guide
## Complete Deployment Instructions for All Services

This guide provides step-by-step instructions for deploying the complete Eazepay platform with all advanced technology integrations.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Service-by-Service Deployment](#service-by-service-deployment)
4. [Docker Compose Deployment](#docker-compose-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Configuration](#configuration)
7. [Health Checks](#health-checks)
8. [Troubleshooting](#troubleshooting)
9. [Monitoring](#monitoring)
10. [Backup & Recovery](#backup--recovery)

---

## 🔧 Prerequisites

### System Requirements

**Minimum Requirements:**
- CPU: 8 cores
- RAM: 16 GB
- Storage: 100 GB SSD
- OS: Ubuntu 20.04+ / Windows 10+ / macOS 11+

**Recommended for Production:**
- CPU: 16+ cores
- RAM: 32+ GB
- Storage: 500 GB SSD
- OS: Ubuntu 22.04 LTS

### Software Requirements

```bash
# Docker & Docker Compose
Docker: 24.0+
Docker Compose: 2.20+

# For Kubernetes deployment
Kubernetes: 1.27+
kubectl: 1.27+
Helm: 3.12+

# For local development
Node.js: 20.x
Python: 3.11+
Go: 1.21+
Java: 17+
```

### Installation

#### Install Docker (Ubuntu)

```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

#### Install Docker (Windows)

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Run the installer
3. Enable WSL 2 backend
4. Restart your computer
5. Verify: `docker --version`

#### Install Docker (macOS)

```bash
# Using Homebrew
brew install --cask docker

# Or download from https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker compose version
```

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/eazepay.git
cd eazepay
```

### 2. Set Up Environment Variables

```bash
# Copy example environment files
cp .env.example .env

# Update with your configuration
nano .env
```

### 3. Start All Services

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

### 4. Verify Deployment

```bash
# Check all services are healthy
./scripts/health-check.sh

# Or manually check each service
curl http://localhost:8000/health  # Identity Service
curl http://localhost:8001/health  # Biometric Service
curl http://localhost:8002/actuator/health  # Transaction Service
curl http://localhost:8003/health  # Wallet Service
curl http://localhost:8010/health  # AI/ML Service
curl http://localhost:8020/health  # IoT Service
curl http://localhost:8030/health  # Blockchain Service
curl http://localhost:8040/health  # Robotics Service
```

### 5. Access the Portals

```
Admin Portal:      http://localhost:8080
Superuser Portal:  http://localhost:8090
Customer Portal:   http://localhost:3001
Agent Portal:      http://localhost:3002

Monitoring:
Grafana:          http://localhost:3000 (admin/grafana_admin_2024!)
Prometheus:       http://localhost:9090
Kibana:           http://localhost:5601
RabbitMQ:         http://localhost:15673 (admin/rabbitmq_password_2024!)
```

---

## 🔨 Service-by-Service Deployment

### Core Services

#### 1. Identity Service (Port 8000)

```bash
cd services/identity-service

# Install dependencies
npm install

# Build
npm run build

# Run migrations
npm run migration:run

# Start service
npm start

# Or with Docker
docker build -t eazepay-identity .
docker run -p 8000:8000 \
  -e DB_HOST=postgresql \
  -e DB_PORT=5432 \
  -e DB_NAME=afripay_dev \
  -e DB_USER=developer \
  -e DB_PASS=dev_password_2024! \
  eazepay-identity
```

#### 2. Transaction Service (Port 8002)

```bash
cd services/transaction-service

# Build with Maven
./mvnw clean package -DskipTests

# Run
java -jar target/transaction-service-1.0.0.jar

# Or with Docker
docker build -t eazepay-transaction .
docker run -p 8002:8002 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgresql:5432/afripay_dev \
  -e SPRING_DATASOURCE_USERNAME=developer \
  -e SPRING_DATASOURCE_PASSWORD=dev_password_2024! \
  eazepay-transaction
```

#### 3. Wallet Service (Port 8003)

```bash
cd services/wallet-service

# Build
go build -o wallet-service

# Run
./wallet-service

# Or with Docker
docker build -t eazepay-wallet .
docker run -p 8003:8003 \
  -e DB_HOST=postgresql \
  -e DB_PORT=5432 \
  -e DB_NAME=afripay_dev \
  eazepay-wallet
```

### Advanced Technology Services

#### 4. AI/ML Service (Port 8010)

```bash
cd services/ai-ml-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn app.main:app --host 0.0.0.0 --port 8010

# Or with Docker
docker build -t eazepay-ai-ml .
docker run -p 8010:8010 eazepay-ai-ml
```

#### 5. IoT Service (Port 8020)

```bash
cd services/iot-service

# Install dependencies
npm install

# Build
npm run build

# Start service
npm start

# Or with Docker
docker build -t eazepay-iot .
docker run -p 8020:8020 \
  -e MQTT_BROKER_URL=mqtt://mosquitto:1883 \
  eazepay-iot
```

#### 6. Blockchain Service (Port 8030)

```bash
cd services/blockchain-service

# Install dependencies
npm install

# Build
npm run build

# Start Hyperledger Fabric network (first time only)
cd fabric-network
./network.sh up createChannel -c eazepay-channel
./network.sh deployCC -ccn transaction-ledger -ccp ../chaincode -ccl go

# Start service
cd ..
npm start

# Or with Docker
docker build -t eazepay-blockchain .
docker run -p 8030:8030 eazepay-blockchain
```

#### 7. Robotics Service (Port 8040)

```bash
cd services/robotics-service

# Install dependencies
npm install

# Build
npm run build

# Start service
npm start

# Or with Docker
docker build -t eazepay-robotics .
docker run -p 8040:8040 \
  -e TRANSACTION_SERVICE_URL=http://transaction-service:8002 \
  -e IDENTITY_SERVICE_URL=http://identity-service:8000 \
  eazepay-robotics
```

---

## 🐳 Docker Compose Deployment

### Full Stack Deployment

```bash
# Start all services
docker compose up -d

# Start specific services
docker compose up -d identity-service transaction-service wallet-service

# Start with build
docker compose up -d --build

# Scale services
docker compose up -d --scale transaction-service=3

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f transaction-service

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Restart a service
docker compose restart transaction-service
```

### Production Deployment

```bash
# Use production compose file
docker compose -f docker-compose.prod.yml up -d

# With environment file
docker compose --env-file .env.production up -d

# Build without cache
docker compose build --no-cache

# Pull latest images
docker compose pull
```

---

## ☸️ Kubernetes Deployment

### Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installation
kubectl version --client
helm version
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace eazepay

# Create secrets
kubectl create secret generic eazepay-secrets \
  --from-literal=db-password=dev_password_2024! \
  --from-literal=redis-password=redis_password_2024! \
  --from-literal=rabbitmq-password=rabbitmq_password_2024! \
  -n eazepay

# Deploy using Helm
cd infrastructure/kubernetes
helm install eazepay ./eazepay-chart -n eazepay

# Or apply manifests directly
kubectl apply -f infrastructure/kubernetes/manifests/ -n eazepay

# Check deployment status
kubectl get pods -n eazepay
kubectl get services -n eazepay

# View logs
kubectl logs -f deployment/identity-service -n eazepay

# Scale deployment
kubectl scale deployment transaction-service --replicas=5 -n eazepay

# Update deployment
helm upgrade eazepay ./eazepay-chart -n eazepay

# Rollback
helm rollback eazepay -n eazepay
```

### Kubernetes Service Ports

```yaml
# Service endpoints in Kubernetes
identity-service:      http://identity-service.eazepay.svc.cluster.local:8000
biometric-service:     http://biometric-service.eazepay.svc.cluster.local:8001
transaction-service:   http://transaction-service.eazepay.svc.cluster.local:8002
wallet-service:        http://wallet-service.eazepay.svc.cluster.local:8003
ai-ml-service:         http://ai-ml-service.eazepay.svc.cluster.local:8010
iot-service:           http://iot-service.eazepay.svc.cluster.local:8020
blockchain-service:    http://blockchain-service.eazepay.svc.cluster.local:8030
robotics-service:      http://robotics-service.eazepay.svc.cluster.local:8040
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in the root directory:

```env
# Database Configuration
POSTGRES_HOST=postgresql
POSTGRES_PORT=5432
POSTGRES_DB=afripay_dev
POSTGRES_USER=developer
POSTGRES_PASSWORD=dev_password_2024!

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_2024!

# RabbitMQ Configuration
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=rabbitmq_password_2024!
RABBITMQ_VHOST=afripay

# Service URLs
IDENTITY_SERVICE_URL=http://identity-service:8000
BIOMETRIC_SERVICE_URL=http://biometric-service:8001
TRANSACTION_SERVICE_URL=http://transaction-service:8002
WALLET_SERVICE_URL=http://wallet-service:8003
AIML_SERVICE_URL=http://ai-ml-service:8010
IOT_SERVICE_URL=http://iot-service:8020
BLOCKCHAIN_SERVICE_URL=http://blockchain-service:8030
ROBOTICS_SERVICE_URL=http://robotics-service:8040

# Security
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
ENCRYPTION_KEY=your_32_character_encryption_key_here

# AI/ML Configuration
FRAUD_DETECTION_THRESHOLD=0.7
RISK_SCORING_MODEL=xgboost_v2

# IoT Configuration
MQTT_BROKER_URL=mqtt://mosquitto:1883
GEOFENCE_RADIUS_METERS=100

# Blockchain Configuration
FABRIC_CHANNEL_NAME=eazepay-channel
FABRIC_CHAINCODE_NAME=transaction-ledger

# Robotics Configuration
BIOMETRIC_MATCH_THRESHOLD=80
OCR_CONFIDENCE_THRESHOLD=70
KIOSK_MAX_CASH_CAPACITY=1000000
KIOSK_LOW_CASH_THRESHOLD=50000

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
ENABLE_TRACING=true
```

### Service-Specific Configuration

Each service has its own `.env.example` file. Copy and customize:

```bash
# Identity Service
cp services/identity-service/.env.example services/identity-service/.env

# Transaction Service
cp services/transaction-service/.env.example services/transaction-service/.env

# AI/ML Service
cp services/ai-ml-service/.env.example services/ai-ml-service/.env

# IoT Service
cp services/iot-service/.env.example services/iot-service/.env

# Blockchain Service
cp services/blockchain-service/.env.example services/blockchain-service/.env

# Robotics Service
cp services/robotics-service/.env.example services/robotics-service/.env
```

---

## 🏥 Health Checks

### Automated Health Check Script

Create `scripts/health-check.sh`:

```bash
#!/bin/bash

echo "🏥 Checking Eazepay Services Health..."
echo ""

services=(
  "Identity:8000"
  "Biometric:8001"
  "Transaction:8002"
  "Wallet:8003"
  "USSD:8004"
  "Agent:8005"
  "AI/ML:8010"
  "IoT:8020"
  "Blockchain:8030"
  "Robotics:8040"
)

all_healthy=true

for service in "${services[@]}"; do
  name="${service%%:*}"
  port="${service##*:}"
  
  if [ "$name" == "Transaction" ]; then
    url="http://localhost:$port/actuator/health"
  else
    url="http://localhost:$port/health"
  fi
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  
  if [ "$response" == "200" ]; then
    echo "✅ $name Service (Port $port): HEALTHY"
  else
    echo "❌ $name Service (Port $port): UNHEALTHY (HTTP $response)"
    all_healthy=false
  fi
done

echo ""
if [ "$all_healthy" = true ]; then
  echo "🎉 All services are healthy!"
  exit 0
else
  echo "⚠️  Some services are unhealthy. Check logs for details."
  exit 1
fi
```

Make it executable:

```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

### Manual Health Checks

```bash
# Core Services
curl http://localhost:8000/health  # Identity
curl http://localhost:8001/health  # Biometric
curl http://localhost:8002/actuator/health  # Transaction
curl http://localhost:8003/health  # Wallet

# Advanced Services
curl http://localhost:8010/health  # AI/ML
curl http://localhost:8020/health  # IoT
curl http://localhost:8030/health  # Blockchain
curl http://localhost:8040/health  # Robotics

# Infrastructure
curl http://localhost:9090/-/healthy  # Prometheus
curl http://localhost:9200/_cluster/health  # Elasticsearch
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :8000  # On Linux/Mac
netstat -ano | findstr :8000  # On Windows

# Kill process
kill -9 <PID>  # On Linux/Mac
taskkill /PID <PID> /F  # On Windows

# Or change port in docker-compose.yml
```

#### 2. Database Connection Failed

```bash
# Check if PostgreSQL is running
docker compose ps postgresql

# Check logs
docker compose logs postgresql

# Restart database
docker compose restart postgresql

# Connect to database
docker compose exec postgresql psql -U developer -d afripay_dev
```

#### 3. Service Won't Start

```bash
# Check logs
docker compose logs <service-name>

# Rebuild service
docker compose build --no-cache <service-name>
docker compose up -d <service-name>

# Check environment variables
docker compose exec <service-name> env
```

#### 4. Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory

# Check memory usage
docker stats

# Restart Docker
sudo systemctl restart docker  # Linux
# Or restart Docker Desktop
```

#### 5. Blockchain Network Issues

```bash
# Check Hyperledger Fabric network
cd services/blockchain-service/fabric-network
./network.sh down
./network.sh up createChannel -c eazepay-channel
./network.sh deployCC -ccn transaction-ledger -ccp ../chaincode -ccl go

# Check peer logs
docker logs peer0.org1.example.com
```

### Debug Mode

```bash
# Run service in debug mode
docker compose run --rm -e LOG_LEVEL=debug identity-service

# Attach to running container
docker compose exec identity-service sh

# View real-time logs
docker compose logs -f --tail=100 identity-service
```

---

## 📊 Monitoring

### Access Monitoring Tools

```bash
# Grafana (Dashboards)
http://localhost:3000
Username: admin
Password: grafana_admin_2024!

# Prometheus (Metrics)
http://localhost:9090

# Kibana (Logs)
http://localhost:5601

# RabbitMQ Management
http://localhost:15673
Username: admin
Password: rabbitmq_password_2024!
```

### Key Metrics to Monitor

```yaml
# Service Health
- Service uptime
- Response time
- Error rate
- Request rate

# Database
- Connection pool usage
- Query performance
- Disk usage

# Message Queue
- Queue depth
- Message rate
- Consumer lag

# AI/ML
- Model inference latency
- Fraud detection rate
- False positive rate

# IoT
- Connected devices
- Message throughput
- Location updates

# Blockchain
- Transaction throughput
- Block creation time
- Peer health

# Robotics
- Kiosk uptime
- RPA job success rate
- Document processing time
```

---

## 💾 Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
docker compose exec postgresql pg_dump -U developer afripay_dev > backup_$(date +%Y%m%d).sql

# Restore PostgreSQL
docker compose exec -T postgresql psql -U developer afripay_dev < backup_20251022.sql

# Backup MongoDB
docker compose exec mongodb mongodump --username admin --password mongo_password_2024! --out /backup

# Restore MongoDB
docker compose exec mongodb mongorestore --username admin --password mongo_password_2024! /backup
```

### Volume Backup

```bash
# Backup all volumes
docker run --rm \
  -v eazepay_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz /data

# Restore volume
docker run --rm \
  -v eazepay_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/postgres_data_20251022.tar.gz -C /
```

### Automated Backup Script

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="./backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Backup databases
docker compose exec -T postgresql pg_dump -U developer afripay_dev > "$BACKUP_DIR/postgres.sql"
docker compose exec mongodb mongodump --username admin --password mongo_password_2024! --out "$BACKUP_DIR/mongodb"

# Backup volumes
docker run --rm -v eazepay_postgres_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/postgres_data.tar.gz /data

echo "Backup completed: $BACKUP_DIR"
```

---

## 🚀 Production Deployment Checklist

### Pre-Deployment

- [ ] Update all environment variables with production values
- [ ] Change all default passwords
- [ ] Configure SSL/TLS certificates
- [ ] Set up domain names and DNS
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Review security settings
- [ ] Load test all services
- [ ] Prepare rollback plan

### Deployment

- [ ] Deploy infrastructure (databases, message queues)
- [ ] Deploy core services (identity, transaction, wallet)
- [ ] Deploy advanced services (AI/ML, IoT, blockchain, robotics)
- [ ] Deploy web portals
- [ ] Configure API gateway
- [ ] Run health checks
- [ ] Verify integrations
- [ ] Test critical flows
- [ ] Monitor logs and metrics

### Post-Deployment

- [ ] Verify all services are running
- [ ] Check monitoring dashboards
- [ ] Test user flows
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Verify backup jobs
- [ ] Document any issues
- [ ] Update runbooks

---

## 📞 Support

### Getting Help

- **Documentation**: Check service-specific README files
- **Logs**: `docker compose logs -f <service-name>`
- **Health Checks**: `./scripts/health-check.sh`
- **Monitoring**: http://localhost:3000 (Grafana)

### Reporting Issues

When reporting issues, include:
1. Service name and version
2. Error message and stack trace
3. Steps to reproduce
4. Environment details
5. Relevant logs

---

## 📚 Additional Resources

- [Complete Integration Guide](./COMPLETE_INTEGRATION_GUIDE.md)
- [Blockchain Setup Guide](./BLOCKCHAIN_SETUP_GUIDE.md)
- [AI/ML Integration](./AI_ML_INTEGRATION_COMPLETE.md)
- [IoT Integration](./IOT_INTEGRATION_COMPLETE.md)
- [Robotics Integration](./ROBOTICS_RPA_INTEGRATION_COMPLETE.md)

---

**Last Updated**: October 22, 2025
**Version**: 1.0
**Status**: Production Ready ✅
