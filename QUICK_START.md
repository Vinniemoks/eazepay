# Eazepay MVP - Quick Start Card

## ⚡ 60-Second Setup

```bash
# 1. Copy environment
cp .env.mvp.example .env.mvp

# 2. Edit M-Pesa credentials
nano .env.mvp

# 3. Start everything
./scripts/setup-mvp.sh  # Linux/Mac
# OR
.\scripts\setup-mvp.bat  # Windows

# 4. Test
./scripts/test-mvp.sh  # Linux/Mac
```

## 🎯 Essential Commands

### Start Services
```bash
docker-compose -f docker-compose.mvp.yml up -d
```

### Stop Services
```bash
docker-compose -f docker-compose.mvp.yml down
```

### View Logs
```bash
docker-compose -f docker-compose.mvp.yml logs -f
```

### Check Status
```bash
docker-compose -f docker-compose.mvp.yml ps
```

## 🧪 Quick API Test

```bash
# 1. Register
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"254712345678","fullName":"Test User","password":"Pass123"}'

# 2. Login (copy token from response)
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"254712345678","password":"Pass123"}'

# 3. Create Wallet
curl -X POST http://localhost/api/wallet/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currency":"KES"}'

# 4. Check Balance
curl http://localhost/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📍 Service URLs

- **API Gateway**: http://localhost
- **User Service**: http://localhost:8000
- **Wallet Service**: http://localhost:8003
- **M-Pesa Service**: http://localhost:8004
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔑 Default Credentials

- **PostgreSQL**: postgres / postgres_secure_2024
- **Redis**: redis_secure_2024

## 📚 Full Documentation

- **Quick Start**: README_MVP.md
- **Complete Guide**: MVP_GUIDE.md
- **Implementation Details**: MVP_IMPLEMENTATION_SUMMARY.md

## 🐛 Troubleshooting

**Services won't start?**
```bash
docker-compose -f docker-compose.mvp.yml logs
```

**Reset everything?**
```bash
docker-compose -f docker-compose.mvp.yml down -v
docker-compose -f docker-compose.mvp.yml up -d
```

**Database issues?**
```bash
docker-compose -f docker-compose.mvp.yml exec postgres psql -U postgres
```

## ✅ Success Checklist

- [ ] All services show "healthy"
- [ ] Can register user
- [ ] Can login
- [ ] Can create wallet
- [ ] Can check balance
- [ ] M-Pesa STK push works

## 🚀 What You Have

✅ User authentication (JWT)  
✅ Wallet management  
✅ M-Pesa integration  
✅ PostgreSQL database  
✅ Redis cache  
✅ API Gateway  
✅ Docker deployment  

**You're ready to build!** 🎉
