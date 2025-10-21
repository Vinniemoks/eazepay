# Eazepay - Universal Payment Platform

> A distributed microservices payment platform for mobile money, biometric payments, and agent banking.

## 🚀 Quick Start

### Local Development
```bash
# Clone repository
git clone https://github.com/yourusername/eazepay.git
cd eazepay

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Access portals
# Admin: http://localhost:8080
# Superuser: http://localhost:8090
# Customer: http://localhost:3001
# Agent: http://localhost:3002
```

### Check Service Status
```bash
# View running services
docker-compose ps

# View logs
docker-compose logs -f identity-service

# Test admin portal
curl http://localhost:8080/health
```

## 📋 What's Working

✅ **Admin Portal** - http://localhost:8080
✅ **Superuser Portal** - http://localhost:8090
✅ **Customer Portal** - http://localhost:3001
✅ **Agent Portal** - http://localhost:3002
✅ **Superuser API Routes** - Created and configured
✅ **Docker Configuration** - Fixed and updated

⚠️ **Identity Service** - Needs TypeScript errors fixed (see `ADMIN_SUPERUSER_STATUS.md`)

## 🏗️ Architecture

Eazepay is built as a microservices architecture that can be deployed:
- **Monolithic**: All services on one server (current docker-compose)
- **Distributed**: Services across multiple servers/clouds
- **Hybrid**: Critical services on-premise, others in cloud
- **Multi-platform**: Web, mobile apps, desktop apps

### Services

| Service | Port | Description | Status |
|---------|------|-------------|--------|
| Identity Service | 8000 | Authentication & user management | ⚠️ Needs fixes |
| Biometric Service | 8001 | Biometric verification | ✅ Running |
| Transaction Service | 8002 | Payment processing | ✅ Running |
| Wallet Service | 8003 | Wallet management | ✅ Running |
| USSD Service | 8004 | USSD integration | ✅ Running |
| Agent Service | 8005 | Agent management | ✅ Running |
| Admin Portal | 8080 | Admin interface | ✅ Running |
| Superuser Portal | 8090 | Superuser interface | ✅ Running |
| Customer Portal | 3001 | Customer interface | ✅ Running |
| Agent Portal | 3002 | Agent interface | ✅ Running |

## 📚 Documentation

### Getting Started
- **[Deployment Guide](EAZEPAY_DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Architecture](DEPLOYMENT_ARCHITECTURE.md)** - System architecture and design
- **[Mobile App Guide](MOBILE_APP_GUIDE.md)** - Build iOS/Android apps
- **[Admin/Superuser Status](ADMIN_SUPERUSER_STATUS.md)** - Current status and fixes

### Configuration
- **[Environment Variables](.env.example)** - All configuration options
- **[Service Config](services/identity-service/.env.example)** - Service-specific config

## 🎯 Deployment Scenarios

### 1. All-in-One (Current)
Perfect for development and testing.
```bash
docker-compose up -d
```

### 2. Distributed Services
Deploy services on separate servers:
```env
IDENTITY_SERVICE_URL=https://identity.eazepay.com
TRANSACTION_SERVICE_URL=https://transactions.eazepay.com
WALLET_SERVICE_URL=https://wallet.eazepay.com
```

### 3. Hybrid (Recommended)
Sensitive services on-premise, scalable services in cloud:
- **On-Premise**: Identity, Biometric, Admin portals
- **Cloud**: Transaction, Wallet, USSD, Customer/Agent portals

See [Deployment Guide](EAZEPAY_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📱 Mobile App

Build native iOS and Android apps using React Native:

```bash
# Initialize project
npx react-native init EazepayMobile --template react-native-template-typescript

# Configure API
echo "API_URL=https://api.eazepay.com" > .env

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

See [Mobile App Guide](MOBILE_APP_GUIDE.md) for complete instructions.

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **2FA Support** - SMS, Biometric, or both
- **Role-Based Access** - Superuser, Admin, Manager, Employee
- **Permission System** - Granular permissions per user
- **Audit Logging** - All actions logged
- **Biometric Encryption** - Biometric data encrypted at rest
- **Rate Limiting** - API rate limiting per user/IP
- **Session Management** - Secure session handling

## 🛠️ Technology Stack

### Backend
- **Node.js/TypeScript** - Identity, USSD, Agent services
- **Python/FastAPI** - Biometric service
- **Java/Spring Boot** - Transaction service
- **Go** - Wallet service

### Frontend
- **React 18** - All web portals
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Zustand** - State management
- **Recharts** - Data visualization

### Infrastructure
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **MongoDB** - Analytics data
- **RabbitMQ** - Message queue
- **Docker** - Containerization
- **Nginx** - Reverse proxy

### Monitoring
- **Prometheus** - Metrics collection
- **Grafana** - Dashboards
- **Elasticsearch** - Log aggregation
- **Kibana** - Log visualization

## 🧪 Testing

### Run Tests
```bash
# Identity service tests
cd services/identity-service
npm test

# Transaction service tests
cd services/transaction-service
./gradlew test

# Biometric service tests
cd services/biometric-service
pytest
```

### Test Portals
```bash
# Run test script
bash test-admin-superuser-ports.sh

# Or manually
curl http://localhost:8080/health
curl http://localhost:8090/health
```

## 📊 Monitoring

### Access Monitoring Tools
- **Grafana**: http://localhost:3000 (admin/grafana_admin_2024!)
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601
- **RabbitMQ**: http://localhost:15673 (admin/rabbitmq_password_2024!)

### Health Checks
```bash
# Check all services
docker-compose ps

# Check specific service
curl http://localhost:8000/health
```

## 🔄 CI/CD

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy services
        run: ./deploy.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Deployment Guide](EAZEPAY_DEPLOYMENT_GUIDE.md)
- [Architecture](DEPLOYMENT_ARCHITECTURE.md)
- [Mobile App Guide](MOBILE_APP_GUIDE.md)

### Troubleshooting
See [Deployment Guide - Troubleshooting](EAZEPAY_DEPLOYMENT_GUIDE.md#-troubleshooting)

### Contact
- Email: support@eazepay.com
- Website: https://eazepay.com
- Documentation: https://docs.eazepay.com

## 🗺️ Roadmap

### Phase 1: Core Services ✅
- [x] Identity & Authentication
- [x] Transaction Processing
- [x] Wallet Management
- [x] Biometric Verification
- [x] Admin & Superuser Portals

### Phase 2: Enhanced Features (In Progress)
- [ ] Fix TypeScript compilation errors
- [ ] Mobile App Development
- [ ] USSD Integration
- [ ] Agent Network
- [ ] Government Verification

### Phase 3: Scale & Optimize
- [ ] Distributed Deployment
- [ ] Load Balancing
- [ ] Auto-scaling
- [ ] Advanced Analytics
- [ ] Machine Learning Fraud Detection

### Phase 4: Expansion
- [ ] International Payments
- [ ] Cryptocurrency Support
- [ ] Merchant Integration
- [ ] API Marketplace
- [ ] White-label Solutions

## 🎉 Acknowledgments

- Built with modern microservices architecture
- Designed for distributed deployment
- Ready for mobile app integration
- Scalable and secure by design

---

**Eazepay** - Making payments easy, everywhere.
