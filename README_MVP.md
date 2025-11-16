# Eazepay MVP Core

## 🎯 What is This?

This is the **Minimum Viable Product (MVP)** of Eazepay - a complete, working payment platform with:

- ✅ User registration and authentication
- ✅ Wallet management with transaction history
- ✅ M-Pesa integration (sandbox)
- ✅ PostgreSQL database with proper schemas
- ✅ Redis for session management
- ✅ Nginx API Gateway with rate limiting
- ✅ Docker deployment
- ✅ Complete API documentation

## 🚀 Quick Start (5 Minutes)

### 1. Prerequisites
- Docker & Docker Compose installed
- M-Pesa Sandbox credentials (free from https://developer.safaricom.co.ke)

### 2. Setup
```bash
# Clone and navigate to project
cd eazepay

# Copy environment file
cp .env.mvp.example .env.mvp

# Edit with your M-Pesa credentials
nano .env.mvp
```

### 3. Start
**Windows:**
```bash
.\scripts\setup-mvp.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-mvp.sh
./scripts/setup-mvp.sh
```

### 4. Test
```bash
# Run automated tests
chmod +x scripts/test-mvp.sh
./scripts/test-mvp.sh
```

## 📚 What You Get

### Services Running
- **API Gateway** (Port 80) - Nginx reverse proxy
- **User Service** (Port 8000) - Authentication & user management
- **Wallet Service** (Port 8003) - Balance & transactions
- **M-Pesa Service** (Port 8004) - Payment integration
- **PostgreSQL** (Port 5432) - Database
- **Redis** (Port 6379) - Cache & sessions

### Complete Features
1. **User Management**
   - Register with phone number
   - Login with JWT tokens
   - Session management
   - Profile management

2. **Wallet System**
   - Create wallet
   - Check balance
   - Transaction history
   - Atomic operations (no double-spending)

3. **M-Pesa Integration**
   - STK Push (Lipa Na M-Pesa)
   - Transaction status query
   - Callback handling
   - Sandbox testing

## 🧪 API Examples

### Register User
```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "fullName": "John Doe",
    "password": "SecurePass123"
  }'
```

### Create Wallet
```bash
curl -X POST http://localhost/api/wallet/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currency": "KES"}'
```

### Top Up with M-Pesa
```bash
curl -X POST http://localhost/api/mpesa/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100
  }'
```

## 📖 Full Documentation

See [MVP_GUIDE.md](MVP_GUIDE.md) for:
- Complete API documentation
- Database schemas
- Development guide
- Troubleshooting
- Next steps

## 🏗️ Architecture

```
┌─────────────┐
│   Nginx     │  Port 80 (API Gateway)
│  Gateway    │
└──────┬──────┘
       │
   ┌───┴────┬─────────┬──────────┐
   │        │         │          │
┌──▼──┐  ┌─▼──┐  ┌──▼───┐  ┌───▼────┐
│User │  │Wallet│ │M-Pesa│  │Redis   │
│:8000│  │:8003 │ │:8004 │  │:6379   │
└──┬──┘  └──┬───┘ └──────┘  └────────┘
   │        │
   └────┬───┘
        │
   ┌────▼────┐
   │PostgreSQL│
   │  :5432   │
   └──────────┘
```

## 🔧 Development

### View Logs
```bash
docker-compose -f docker-compose.mvp.yml logs -f
```

### Stop Services
```bash
docker-compose -f docker-compose.mvp.yml down
```

### Restart Services
```bash
docker-compose -f docker-compose.mvp.yml restart
```

### Access Database
```bash
docker-compose -f docker-compose.mvp.yml exec postgres psql -U postgres
```

## ✅ What's Next?

This MVP provides the foundation. Next phases:

### Phase 2: Biometric Payment
- Integrate fingerprint SDK
- Implement enrollment flow
- Add payment authorization
- Agent portal integration

### Phase 3: Virtual Cards
- Partner with card issuer
- Card generation API
- Transaction processing
- Merchant integration

### Phase 4: Production
- SSL/TLS certificates
- Production M-Pesa account
- Monitoring & alerts
- Load balancing
- Security audit

## 🐛 Troubleshooting

**Services won't start?**
```bash
docker-compose -f docker-compose.mvp.yml logs
```

**Database errors?**
```bash
docker-compose -f docker-compose.mvp.yml down -v
docker-compose -f docker-compose.mvp.yml up -d
```

**M-Pesa not working?**
- Check credentials in `.env.mvp`
- Verify sandbox environment
- Check callback URL is accessible

## 📞 Support

- Full Guide: [MVP_GUIDE.md](MVP_GUIDE.md)
- M-Pesa Docs: https://developer.safaricom.co.ke
- Docker Docs: https://docs.docker.com

---

**You now have a working payment platform!** 🎉

Start building your tier-one financial solution from this solid foundation.
