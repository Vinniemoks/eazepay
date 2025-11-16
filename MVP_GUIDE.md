# Eazepay MVP Core - Complete Guide

## 🎯 What's Included

The MVP Core provides a complete, working payment platform with:

1. **User Service** - Registration, authentication, JWT tokens
2. **Wallet Service** - Balance management, transactions, ledger
3. **M-Pesa Integration** - Sandbox top-up flow
4. **API Gateway** - Nginx reverse proxy with rate limiting
5. **PostgreSQL** - Persistent data storage
6. **Redis** - Session management and caching

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- M-Pesa Sandbox credentials (get from https://developer.safaricom.co.ke)

### 1. Setup Environment

```bash
# Copy environment template
cp .env.mvp.example .env.mvp

# Edit with your M-Pesa credentials
nano .env.mvp
```

Required M-Pesa credentials:
- `MPESA_CONSUMER_KEY` - From Daraja portal
- `MPESA_CONSUMER_SECRET` - From Daraja portal
- `MPESA_PASSKEY` - From Daraja portal
- `MPESA_CALLBACK_URL` - Your public URL for callbacks

### 2. Start Services

**Windows:**
```bash
.\scripts\setup-mvp.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-mvp.sh
./scripts/setup-mvp.sh
```

### 3. Verify Services

```bash
# Check all services are running
docker-compose -f docker-compose.mvp.yml ps

# Test API Gateway
curl http://localhost/health

# Test User Service
curl http://localhost:8000/health

# Test Wallet Service
curl http://localhost:8003/health

# Test M-Pesa Service
curl http://localhost:8004/health
```

## 📚 API Documentation

### Base URL
- **API Gateway**: `http://localhost`
- **Direct Services**: `http://localhost:800X`

### Authentication Flow

#### 1. Register User
```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phoneNumber": "254712345678",
      "fullName": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 86400
    }
  }
}
```

#### 2. Login
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "password": "SecurePass123"
  }'
```

#### 3. Get Profile
```bash
curl http://localhost/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Wallet Operations

#### 1. Create Wallet
```bash
curl -X POST http://localhost/api/wallet/create \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "KES"
  }'
```

#### 2. Check Balance
```bash
curl http://localhost/api/wallet/balance \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "balance": 1000.00,
    "currency": "KES",
    "status": "active"
  }
}
```

#### 3. Get Transactions
```bash
curl http://localhost/api/wallet/transactions?limit=10&offset=0 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### M-Pesa Integration

#### 1. Initiate Top-up
```bash
curl -X POST http://localhost/api/mpesa/initiate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "accountReference": "TOPUP-001",
    "transactionDesc": "Wallet Top-up"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "checkoutRequestId": "ws_CO_123456789",
    "merchantRequestId": "12345-67890-1",
    "responseCode": "0",
    "responseDescription": "Success",
    "customerMessage": "Success. Request accepted for processing"
  },
  "message": "Payment initiated. Please check your phone to complete the transaction."
}
```

#### 2. Query Transaction Status
```bash
curl http://localhost/api/mpesa/query/ws_CO_123456789 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 Complete Test Flow

Here's a complete end-to-end test:

```bash
# 1. Register user
REGISTER_RESPONSE=$(curl -s -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "TestPass123"
  }')

# Extract access token
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.tokens.accessToken')
echo "Access Token: $ACCESS_TOKEN"

# 2. Create wallet
curl -X POST http://localhost/api/wallet/create \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currency": "KES"}'

# 3. Check balance (should be 0)
curl http://localhost/api/wallet/balance \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Initiate M-Pesa top-up
curl -X POST http://localhost/api/mpesa/initiate \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "accountReference": "TOPUP-TEST",
    "transactionDesc": "Test Top-up"
  }'

# 5. Check transactions
curl http://localhost/api/wallet/transactions \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## 🗄️ Database Schema

### Users Database (`eazepay_users`)

**Tables:**
- `users` - User accounts
- `user_profiles` - Extended user information
- `sessions` - Active sessions
- `biometric_enrollments` - Biometric templates
- `audit_logs` - Audit trail

### Wallets Database (`eazepay_wallets`)

**Tables:**
- `wallets` - User wallets
- `transactions` - Transaction history
- `pending_transactions` - Two-phase commits

## 🔧 Development

### Run Services Locally

```bash
# User Service
cd services/user-service
npm install
npm run dev

# Wallet Service
cd services/wallet-service
npm install
npm run dev

# M-Pesa Service
cd services/mpesa-service
npm install
npm run dev
```

### Run Migrations

```bash
# User Service
cd services/user-service
npm run migrate

# Wallet Service
cd services/wallet-service
npm run migrate
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.mvp.yml logs -f

# Specific service
docker-compose -f docker-compose.mvp.yml logs -f user-service
```

## 🐛 Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker ps

# Check logs
docker-compose -f docker-compose.mvp.yml logs

# Restart services
docker-compose -f docker-compose.mvp.yml restart
```

### Database connection errors
```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.mvp.yml ps postgres

# Check database exists
docker-compose -f docker-compose.mvp.yml exec postgres psql -U postgres -l

# Recreate databases
docker-compose -f docker-compose.mvp.yml down -v
docker-compose -f docker-compose.mvp.yml up -d
```

### M-Pesa integration not working
1. Verify credentials in `.env.mvp`
2. Check you're using sandbox environment
3. Ensure callback URL is publicly accessible
4. Check M-Pesa service logs

## 📊 Monitoring

### Health Checks
```bash
# Check all services
curl http://localhost/health
curl http://localhost:8000/health
curl http://localhost:8003/health
curl http://localhost:8004/health
```

### Database Queries
```bash
# Connect to PostgreSQL
docker-compose -f docker-compose.mvp.yml exec postgres psql -U postgres

# Check users
\c eazepay_users
SELECT * FROM users;

# Check wallets
\c eazepay_wallets
SELECT * FROM wallets;
SELECT * FROM transactions;
```

### Redis Cache
```bash
# Connect to Redis
docker-compose -f docker-compose.mvp.yml exec redis redis-cli -a redis_secure_2024

# Check sessions
KEYS session:*
```

## 🚀 Next Steps

### Phase 2: Add Biometric Payment
1. Integrate biometric hardware SDK
2. Implement enrollment flow
3. Add payment authorization
4. Test with real devices

### Phase 3: Add Virtual Cards
1. Partner with card issuer (Railsr, Marqeta)
2. Implement card generation
3. Add transaction processing
4. Test with merchants

### Phase 4: Production Deployment
1. Set up production M-Pesa account
2. Configure SSL/TLS certificates
3. Set up monitoring (Prometheus, Grafana)
4. Implement backup strategy
5. Security audit
6. Load testing

## 📞 Support

- **Documentation**: This file
- **Issues**: Check logs first
- **M-Pesa**: https://developer.safaricom.co.ke
- **Docker**: https://docs.docker.com

## ✅ Success Criteria

Your MVP is working when:
- ✅ All services show "healthy" status
- ✅ User can register and login
- ✅ User can create wallet
- ✅ User can check balance
- ✅ M-Pesa STK push is initiated
- ✅ Transactions are recorded

---

**Congratulations! You now have a working payment platform MVP!** 🎉
