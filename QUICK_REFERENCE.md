# 🚀 Eazepay Quick Reference Guide

Quick commands and endpoints for daily operations.

---

## 🎯 Service Ports

| Service | Port | Health Check |
|---------|------|--------------|
| Identity Service | 8000 | http://localhost:8000/health |
| Biometric Service | 8001 | http://localhost:8001/health |
| Transaction Service | 8002 | http://localhost:8002/actuator/health |
| Wallet Service | 8003 | http://localhost:8003/health |
| USSD Service | 8004 | http://localhost:8004/health |
| Agent Service | 8005 | http://localhost:8005/health |
| AI/ML Service | 8010 | http://localhost:8010/health |
| IoT Service | 8020 | http://localhost:8020/health |
| Blockchain Service | 8030 | http://localhost:8030/health |
| Robotics Service | 8040 | http://localhost:8040/health |

---

## 🌐 Portal URLs

| Portal | URL | Default Credentials |
|--------|-----|---------------------|
| Admin Portal | http://localhost:8080 | admin@eazepay.com / Admin@123 |
| Superuser Portal | http://localhost:8090 | superuser@eazepay.com / Super@123 |
| Customer Portal | http://localhost:3001 | - |
| Agent Portal | http://localhost:3002 | - |

---

## 📊 Monitoring & Tools

| Tool | URL | Credentials |
|------|-----|-------------|
| Grafana | http://localhost:3000 | admin / grafana_admin_2024! |
| Prometheus | http://localhost:9090 | - |
| Kibana | http://localhost:5601 | - |
| RabbitMQ | http://localhost:15673 | admin / rabbitmq_password_2024! |
| Adminer | http://localhost:8081 | - |

---

## 🐳 Docker Commands

### Start/Stop Services

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d identity-service

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Restart service
docker compose restart transaction-service
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f identity-service

# Last 100 lines
docker compose logs --tail=100 identity-service

# Since timestamp
docker compose logs --since 2024-10-22T10:00:00 identity-service
```

### Service Management

```bash
# Check status
docker compose ps

# Scale service
docker compose up -d --scale transaction-service=3

# Rebuild service
docker compose build --no-cache identity-service

# Execute command in container
docker compose exec identity-service sh

# View resource usage
docker stats
```

---

## 🔍 Health Checks

### Automated Check

```bash
# Run health check script
./scripts/health-check.sh
```

### Manual Checks

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
```

---

## 💾 Database Operations

### PostgreSQL

```bash
# Connect to database
docker compose exec postgresql psql -U developer -d afripay_dev

# Backup database
docker compose exec postgresql pg_dump -U developer afripay_dev > backup.sql

# Restore database
docker compose exec -T postgresql psql -U developer afripay_dev < backup.sql

# List databases
docker compose exec postgresql psql -U developer -c "\l"

# List tables
docker compose exec postgresql psql -U developer -d afripay_dev -c "\dt"
```

### MongoDB

```bash
# Connect to MongoDB
docker compose exec mongodb mongosh -u admin -p mongo_password_2024!

# Backup MongoDB
docker compose exec mongodb mongodump --username admin --password mongo_password_2024! --out /backup

# Restore MongoDB
docker compose exec mongodb mongorestore --username admin --password mongo_password_2024! /backup
```

### Redis

```bash
# Connect to Redis
docker compose exec redis redis-cli -a redis_password_2024!

# Check keys
docker compose exec redis redis-cli -a redis_password_2024! KEYS "*"

# Flush all data (CAUTION!)
docker compose exec redis redis-cli -a redis_password_2024! FLUSHALL
```

---

## 🔧 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs <service-name>

# Rebuild and restart
docker compose build --no-cache <service-name>
docker compose up -d <service-name>

# Check environment variables
docker compose exec <service-name> env
```

### Port Conflicts

```bash
# Find process using port (Linux/Mac)
lsof -i :8000

# Find process using port (Windows)
netstat -ano | findstr :8000

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### Database Connection Issues

```bash
# Check if database is running
docker compose ps postgresql

# Restart database
docker compose restart postgresql

# Check database logs
docker compose logs postgresql
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase Docker memory
# Docker Desktop: Settings > Resources > Memory

# Restart Docker
sudo systemctl restart docker  # Linux
```

---

## 📡 API Testing

### Identity Service

```bash
# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "+254712345678"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### Transaction Service

```bash
# Create transaction
curl -X POST http://localhost:8002/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "type": "TRANSFER",
    "amount": 1000,
    "fromAccount": "ACC001",
    "toAccount": "ACC002",
    "description": "Test transfer"
  }'

# Get transaction
curl http://localhost:8002/api/transactions/<transaction-id> \
  -H "Authorization: Bearer <token>"
```

### AI/ML Service

```bash
# Check fraud
curl -X POST http://localhost:8010/api/fraud/check \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "userId": "user_123",
    "location": "Nairobi",
    "timeOfDay": 14
  }'

# Assess risk
curl -X POST http://localhost:8010/api/risk/assess \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "transactionHistory": []
  }'
```

### IoT Service

```bash
# Register device
curl -X POST http://localhost:8020/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device_001",
    "deviceType": "AGENT_PHONE",
    "agentId": "agent_123"
  }'

# Get device location
curl http://localhost:8020/api/devices/device_001/location
```

### Blockchain Service

```bash
# Record transaction
curl -X POST http://localhost:8030/api/blockchain/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "txn_123",
    "amount": 1000,
    "fromAccount": "ACC001",
    "toAccount": "ACC002"
  }'

# Verify transaction
curl http://localhost:8030/api/blockchain/transactions/txn_123/verify
```

### Robotics Service

```bash
# Register kiosk
curl -X POST http://localhost:8040/api/kiosks/register \
  -H "Content-Type: application/json" \
  -d '{
    "kioskId": "kiosk_001",
    "location": "Nairobi CBD",
    "type": "ATM",
    "capabilities": ["CASH_WITHDRAWAL", "DEPOSIT"]
  }'

# Process KYC document
curl -X POST http://localhost:8040/api/documents/kyc/process \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "NATIONAL_ID",
    "imageBase64": "data:image/jpeg;base64,...",
    "userId": "user_123"
  }'
```

---

## 🔐 Security

### Change Default Passwords

```bash
# Update .env file
nano .env

# Update these values:
POSTGRES_PASSWORD=<new-password>
REDIS_PASSWORD=<new-password>
RABBITMQ_PASSWORD=<new-password>
JWT_SECRET=<new-secret>
ENCRYPTION_KEY=<new-key>

# Restart services
docker compose down
docker compose up -d
```

### SSL/TLS Setup

```bash
# Generate self-signed certificate (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/docker/nginx/ssl/key.pem \
  -out infrastructure/docker/nginx/ssl/cert.pem

# Update nginx configuration
nano infrastructure/docker/nginx/nginx.conf

# Restart nginx
docker compose restart api-gateway
```

---

## 📊 Monitoring Queries

### Prometheus Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Response time (95th percentile)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Service uptime
up{job="identity-service"}

# Database connections
pg_stat_database_numbackends
```

### Grafana Dashboards

- **System Overview**: Service health, request rates, error rates
- **Database Performance**: Query performance, connection pools
- **AI/ML Metrics**: Fraud detection rate, model latency
- **IoT Metrics**: Device connectivity, location updates
- **Blockchain Metrics**: Transaction throughput, block time

---

## 🚨 Emergency Procedures

### Service Down

```bash
# 1. Check logs
docker compose logs <service-name>

# 2. Restart service
docker compose restart <service-name>

# 3. If still down, rebuild
docker compose build --no-cache <service-name>
docker compose up -d <service-name>
```

### Database Corruption

```bash
# 1. Stop all services
docker compose down

# 2. Restore from backup
docker compose exec -T postgresql psql -U developer afripay_dev < backup.sql

# 3. Restart services
docker compose up -d
```

### High Memory Usage

```bash
# 1. Check memory usage
docker stats

# 2. Restart high-memory services
docker compose restart <service-name>

# 3. Scale down if needed
docker compose up -d --scale <service-name>=1
```

---

## 📞 Support Contacts

- **Technical Lead**: tech-lead@eazepay.com
- **DevOps Team**: devops@eazepay.com
- **On-Call**: +254-XXX-XXXXXX

---

## 📚 Documentation Links

- [Complete Integration Guide](./COMPLETE_INTEGRATION_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Blockchain Setup](./BLOCKCHAIN_SETUP_GUIDE.md)
- [AI/ML Integration](./AI_ML_INTEGRATION_COMPLETE.md)
- [IoT Integration](./IOT_INTEGRATION_COMPLETE.md)
- [Robotics Integration](./ROBOTICS_RPA_INTEGRATION_COMPLETE.md)

---

**Last Updated**: October 22, 2025
**Version**: 1.0
