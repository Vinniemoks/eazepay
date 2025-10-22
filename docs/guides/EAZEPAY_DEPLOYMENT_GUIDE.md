# Eazepay - Complete Deployment Guide

## 🎯 Overview

Eazepay is a distributed microservices payment platform that can be deployed across multiple servers, clouds, and platforms. Each service is independent and can communicate with others via REST APIs.

## 📋 Quick Reference

### Current Ports (Local Development)
- **Admin Portal**: http://localhost:8080 ✅
- **Superuser Portal**: http://localhost:8090 ✅
- **Customer Portal**: http://localhost:3001
- **Agent Portal**: http://localhost:3002
- **Identity Service**: http://localhost:8000
- **Biometric Service**: http://localhost:8001
- **Transaction Service**: http://localhost:8002
- **Wallet Service**: http://localhost:8003
- **USSD Service**: http://localhost:8004
- **Agent Service**: http://localhost:8005

### Production Domains (Example)
```
https://app.eazepay.com          → Customer Portal
https://agents.eazepay.com       → Agent Portal
https://admin.eazepay.com        → Admin Portal
https://superuser.eazepay.com    → Superuser Portal
https://api.eazepay.com          → API Gateway
https://identity.eazepay.com     → Identity Service
https://transactions.eazepay.com → Transaction Service
https://wallet.eazepay.com       → Wallet Service
```

## 🚀 Deployment Scenarios

### Scenario 1: All-in-One Server (Current Setup)
**Best for**: Development, small deployments, testing

```bash
# Start all services
docker-compose up -d

# Access portals
# Admin: http://localhost:8080
# Superuser: http://localhost:8090
# Customer: http://localhost:3001
# Agent: http://localhost:3002
```

**Pros**: Simple, easy to manage
**Cons**: Single point of failure, limited scaling

---

### Scenario 2: Separate Backend & Frontend
**Best for**: Medium deployments, better security

```
┌─────────────────────────┐
│   Frontend Server       │
│   (Static Hosting)      │
│   - Customer Portal     │
│   - Agent Portal        │
│   - Admin Portal        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Backend Server        │
│   (Your Server/Cloud)   │
│   - All Services        │
│   - Database            │
│   - Redis               │
└─────────────────────────┘
```

**Setup**:
1. Deploy portals to Netlify/Vercel/S3
2. Deploy backend services to your server
3. Update portal environment variables:
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```

---

### Scenario 3: Distributed Services
**Best for**: Large deployments, high availability

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Server 1   │  │   Server 2   │  │   Server 3   │
│              │  │              │  │              │
│  Identity    │  │ Transaction  │  │   Wallet     │
│  Biometric   │  │   Agent      │  │   USSD       │
│  (On-Prem)   │  │  (Cloud)     │  │  (Cloud)     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
              API Gateway / Load Balancer
```

**Setup**:
1. Deploy each service to separate servers
2. Configure service URLs in environment variables
3. Set up API Gateway (Nginx/Kong/AWS API Gateway)
4. Configure SSL certificates
5. Set up monitoring

---

### Scenario 4: Hybrid (Recommended for Security)
**Best for**: Sensitive data on-premise, scalability in cloud

```
┌─────────────────────────────────────┐
│         Cloud (AWS/Azure)           │
│  - Customer Portal                  │
│  - Agent Portal                     │
│  - Transaction Service              │
│  - Wallet Service                   │
│  - USSD Service                     │
└──────────────┬──────────────────────┘
               │ VPN/Secure API
┌──────────────┴──────────────────────┐
│      On-Premise (Your Server)       │
│  - Identity Service                 │
│  - Biometric Service                │
│  - Admin Portal (VPN only)          │
│  - Superuser Portal (VPN only)      │
│  - Database (sensitive data)        │
└─────────────────────────────────────┘
```

**Why This Works**:
- Sensitive data (biometrics, identity) stays on-premise
- Scalable services (transactions, wallet) in cloud
- Admin access restricted to VPN
- Best of both worlds

---

## 📦 Service-by-Service Deployment

### 1. Identity Service (Deploy First - Critical)
**Location**: On-premise or secure cloud
**Dependencies**: PostgreSQL, Redis
**Port**: 8000

```bash
# Configure
cd services/identity-service
cp .env.example .env
# Edit .env with your settings

# Build
docker build -t eazepay-identity .

# Run
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name eazepay-identity \
  eazepay-identity

# Or deploy to cloud
# AWS: Use ECS/EKS
# Azure: Use Container Instances
# Google Cloud: Use Cloud Run
```

**Environment Variables**:
```env
SERVICE_MODE=standalone
DB_HOST=your-db-host
DB_NAME=eazepay_identity
REDIS_HOST=your-redis-host
JWT_SECRET=your-secret-key
```

---

### 2. Transaction Service
**Location**: Cloud (high traffic)
**Dependencies**: PostgreSQL, Redis, Identity Service
**Port**: 8002

```env
SERVICE_MODE=integrated
IDENTITY_SERVICE_URL=https://identity.yourdomain.com
WALLET_SERVICE_URL=https://wallet.yourdomain.com
DB_HOST=your-db-host
```

---

### 3. Wallet Service
**Location**: Cloud
**Dependencies**: PostgreSQL, Redis, Identity Service
**Port**: 8003

```env
SERVICE_MODE=integrated
IDENTITY_SERVICE_URL=https://identity.yourdomain.com
TRANSACTION_SERVICE_URL=https://transactions.yourdomain.com
```

---

### 4. Biometric Service
**Location**: On-premise (security requirement)
**Dependencies**: PostgreSQL, Redis, Identity Service
**Port**: 8001

```env
SERVICE_MODE=integrated
IDENTITY_SERVICE_URL=https://identity.yourdomain.com
ENCRYPTION_KEY=your-encryption-key
```

**Important**: Keep biometric data on-premise for compliance

---

### 5. USSD Service
**Location**: Cloud or telecom network
**Dependencies**: Redis, Identity Service
**Port**: 8004

```env
SERVICE_MODE=integrated
IDENTITY_SERVICE_URL=https://identity.yourdomain.com
TRANSACTION_SERVICE_URL=https://transactions.yourdomain.com
SAFARICOM_USSD_ENDPOINT=https://api.safaricom.co.ke/ussd/v1/
```

---

### 6. Agent Service
**Location**: Cloud
**Dependencies**: PostgreSQL, MongoDB, Redis
**Port**: 8005

```env
SERVICE_MODE=integrated
IDENTITY_SERVICE_URL=https://identity.yourdomain.com
TRANSACTION_SERVICE_URL=https://transactions.yourdomain.com
```

---

## 🌐 Frontend Deployment

### Customer Portal
**Deploy to**: Netlify, Vercel, AWS S3 + CloudFront

```bash
cd services/customer-portal

# Build
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Or deploy to Vercel
vercel --prod

# Or deploy to S3
aws s3 sync dist/ s3://your-bucket-name
```

**Environment Variables**:
```env
VITE_API_URL=https://api.eazepay.com
VITE_APP_NAME=Eazepay
```

---

### Agent Portal
**Deploy to**: Same as customer portal

```env
VITE_API_URL=https://api.eazepay.com
VITE_APP_NAME=Eazepay Agent Portal
```

---

### Admin Portal
**Deploy to**: Secure server with VPN access

```bash
# Build
cd services/admin-portal
npm run build

# Deploy to secure server
scp -r dist/* user@your-server:/var/www/admin
```

**Security**:
- Restrict access via VPN
- Use IP whitelisting
- Require 2FA for access

---

### Superuser Portal
**Deploy to**: Highly secure server, VPN-only

```bash
# Same as admin portal but with stricter security
# Consider deploying on separate server
# Require hardware security keys for access
```

---

## 🗄️ Database Setup

### Option 1: Shared Database (Current)
```sql
-- Single PostgreSQL instance
CREATE DATABASE eazepay_dev;

-- All services connect to same database
-- Different schemas per service
CREATE SCHEMA identity;
CREATE SCHEMA transactions;
CREATE SCHEMA wallet;
```

### Option 2: Separate Databases (Recommended for Production)
```sql
-- Identity Service
CREATE DATABASE eazepay_identity;

-- Transaction Service
CREATE DATABASE eazepay_transactions;

-- Wallet Service
CREATE DATABASE eazepay_wallet;

-- Agent Service
CREATE DATABASE eazepay_agents;
```

**Benefits**:
- True service independence
- Better security isolation
- Easier to scale
- Can be on different servers

---

## 🔐 Security Checklist

### SSL/TLS
- [ ] Install SSL certificates for all domains
- [ ] Use Let's Encrypt for free certificates
- [ ] Configure HTTPS redirect
- [ ] Enable HSTS headers

### API Security
- [ ] Implement rate limiting
- [ ] Use API keys for service-to-service calls
- [ ] Enable CORS with specific origins
- [ ] Implement request signing
- [ ] Use JWT with short expiration

### Network Security
- [ ] Set up VPN for admin access
- [ ] Configure firewall rules
- [ ] Use private networks for service communication
- [ ] Implement DDoS protection
- [ ] Enable intrusion detection

### Data Security
- [ ] Encrypt database at rest
- [ ] Encrypt sensitive fields (biometric data)
- [ ] Implement data retention policies
- [ ] Regular security audits
- [ ] Backup encryption

---

## 📊 Monitoring Setup

### Health Checks
Each service exposes:
```
GET /health          → Basic health check
GET /health/ready    → Ready to accept traffic
GET /health/live     → Service is alive
```

### Metrics (Prometheus)
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'identity-service'
    static_configs:
      - targets: ['identity.eazepay.com:8000']
  
  - job_name: 'transaction-service'
    static_configs:
      - targets: ['transactions.eazepay.com:8002']
```

### Logging (ELK Stack)
```bash
# Centralized logging
docker-compose up -d elasticsearch kibana

# Configure services to send logs
LOG_LEVEL=info
ELASTICSEARCH_URL=http://elasticsearch:9200
```

### Alerts
```yaml
# alertmanager.yml
route:
  receiver: 'slack'
  
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK'
        channel: '#alerts'
```

---

## 📱 Mobile App Deployment

### React Native Setup
```bash
# Initialize project
npx react-native init EazepayMobile --template react-native-template-typescript

# Install dependencies
cd EazepayMobile
npm install @react-navigation/native axios react-native-biometrics

# Configure API URL
# .env.production
API_URL=https://api.eazepay.com
```

### Build for iOS
```bash
cd ios
pod install
cd ..

# Build
npx react-native run-ios --configuration Release

# Or open in Xcode and build
open ios/EazepayMobile.xcworkspace
```

### Build for Android
```bash
cd android
./gradlew assembleRelease

# APK location
# android/app/build/outputs/apk/release/app-release.apk
```

### App Store Submission
1. **iOS**: Upload to App Store Connect via Xcode
2. **Android**: Upload to Google Play Console

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy Services

on:
  push:
    branches: [main]

jobs:
  deploy-identity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: |
          cd services/identity-service
          docker build -t eazepay-identity .
      
      - name: Push to registry
        run: |
          docker tag eazepay-identity registry.yourdomain.com/eazepay-identity
          docker push registry.yourdomain.com/eazepay-identity
      
      - name: Deploy to server
        run: |
          ssh user@your-server "docker pull registry.yourdomain.com/eazepay-identity"
          ssh user@your-server "docker-compose up -d identity-service"
```

---

## 🧪 Testing Distributed Setup

### Test Service Communication
```bash
# Test identity service
curl https://identity.eazepay.com/health

# Test transaction service can reach identity
curl https://transactions.eazepay.com/health

# Test end-to-end flow
curl -X POST https://api.eazepay.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Load Testing
```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js
```

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Update all service URLs in environment variables
- [ ] Configure SSL certificates
- [ ] Set up databases
- [ ] Configure Redis
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test service-to-service communication
- [ ] Run security scan
- [ ] Update DNS records

### Deployment
- [ ] Deploy identity service first
- [ ] Deploy other backend services
- [ ] Deploy frontend portals
- [ ] Run database migrations
- [ ] Verify health checks
- [ ] Test API endpoints
- [ ] Monitor logs

### Post-Deployment
- [ ] Verify all services are running
- [ ] Test end-to-end workflows
- [ ] Monitor performance metrics
- [ ] Set up alerts
- [ ] Document deployment
- [ ] Train team on new setup

---

## 🆘 Troubleshooting

### Service Can't Connect to Another Service
```bash
# Check if service is reachable
curl https://identity.eazepay.com/health

# Check environment variables
docker exec eazepay-transaction env | grep IDENTITY_SERVICE_URL

# Check logs
docker logs eazepay-transaction
```

### Database Connection Issues
```bash
# Test database connection
psql -h your-db-host -U developer -d eazepay_dev

# Check service logs
docker logs eazepay-identity | grep database
```

### SSL Certificate Issues
```bash
# Test SSL
curl -v https://api.eazepay.com

# Renew Let's Encrypt certificate
certbot renew
```

---

## 📚 Additional Resources

- **Architecture**: See `DEPLOYMENT_ARCHITECTURE.md`
- **Mobile App**: See `MOBILE_APP_GUIDE.md`
- **Environment Config**: See `.env.example`
- **API Documentation**: Generate with Swagger/OpenAPI

---

## 🎯 Next Steps

1. **Choose your deployment scenario** (All-in-one, Distributed, or Hybrid)
2. **Set up infrastructure** (servers, databases, SSL)
3. **Configure environment variables** for each service
4. **Deploy services** one by one, starting with Identity
5. **Deploy frontend portals** to static hosting
6. **Set up monitoring** and alerts
7. **Test thoroughly** before going live
8. **Start mobile app development** using the guide

---

## 💡 Pro Tips

1. **Start Simple**: Begin with all-in-one deployment, then distribute as you scale
2. **Monitor Everything**: Set up monitoring from day one
3. **Automate Deployments**: Use CI/CD to reduce human error
4. **Test Failover**: Regularly test what happens when services go down
5. **Document Everything**: Keep deployment docs up to date
6. **Security First**: Never compromise on security for convenience
7. **Backup Regularly**: Automate database backups
8. **Use Staging**: Always test in staging before production

---

**Need Help?** Check the troubleshooting section or review the architecture documentation.

**Ready to Deploy?** Follow the checklist and deploy step by step!
