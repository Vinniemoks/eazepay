# 🚀 Render.com Deployment Guide - Eazepay Platform
## Deploy Your Entire Platform for FREE in 30 Minutes!

**Last Updated**: October 22, 2025  
**Cost**: $0 (Free for 90 days)  
**Time Required**: 30-45 minutes  
**Credit Card**: Not required

---

## 📋 What You'll Deploy

✅ **10+ Microservices** - All your services online  
✅ **PostgreSQL Database** - Free for 90 days  
✅ **Redis Cache** - Free for 30 days  
✅ **Automatic HTTPS** - SSL certificates included  
✅ **Custom Domains** - Optional  
✅ **Auto-Deploy** - Push to GitHub = Auto deploy

---

## 🎯 Prerequisites

1. **GitHub Account** - [Sign up here](https://github.com/signup) (free)
2. **Render Account** - [Sign up here](https://render.com/signup) (free, no credit card)
3. **Your Code on GitHub** - We'll push your code first

---

## 📦 Step 1: Push Your Code to GitHub (5 minutes)

### 1.1 Initialize Git Repository

```bash
# Navigate to your project
cd ~/Desktop/eazepay

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Eazepay platform with advanced tech"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `eazepay-platform`
3. Description: `Eazepay - Mobile Money Platform with AI, IoT, Blockchain & Robotics`
4. **Keep it Private** (recommended for now)
5. Click **"Create repository"**

### 1.3 Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/eazepay-platform.git

# Push code
git branch -M main
git push -u origin main
```

✅ **Your code is now on GitHub!**

---

## 🌐 Step 2: Sign Up for Render (2 minutes)

1. Go to [render.com/signup](https://render.com/signup)
2. Click **"Sign up with GitHub"**
3. Authorize Render to access your repositories
4. ✅ **No credit card required!**

---

## 🗄️ Step 3: Create PostgreSQL Database (3 minutes)

### 3.1 Create Database

1. In Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Fill in details:
   - **Name**: `eazepay-postgres`
   - **Database**: `eazepay_dev`
   - **User**: `developer` (auto-generated)
   - **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
   - **Plan**: **Free** (90 days)
4. Click **"Create Database"**

### 3.2 Save Database Credentials

Render will show you:
- **Internal Database URL**: `postgresql://...` (use this for services)
- **External Database URL**: `postgresql://...` (use for local testing)

**Copy the Internal Database URL** - you'll need it!

Example:
```
postgresql://developer:password@dpg-xxxxx-a.oregon-postgres.render.com/eazepay_dev
```

---

## 🔴 Step 4: Create Redis Cache (2 minutes)

### 4.1 Create Redis

1. Click **"New +"**
2. Select **"Redis"**
3. Fill in details:
   - **Name**: `eazepay-redis`
   - **Region**: Same as PostgreSQL
   - **Plan**: **Free** (30 days)
4. Click **"Create Redis"**

### 4.2 Save Redis URL

Copy the **Internal Redis URL**:
```
redis://red-xxxxx:6379
```

---

## 🚀 Step 5: Deploy Services (20 minutes)

Now we'll deploy each service. I'll show you the first one in detail, then you can repeat for others.

### 5.1 Deploy Identity Service

#### A. Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `eazepay-platform`
3. Fill in details:

**Basic Settings:**
- **Name**: `eazepay-identity`
- **Region**: Same as database
- **Branch**: `main`
- **Root Directory**: `services/identity-service`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Instance Type:**
- **Plan**: **Free** (512 MB RAM, shared CPU)

#### B. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```env
NODE_ENV=production
PORT=8000

# Database (use your Internal Database URL from Step 3)
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=eazepay_dev
DB_USER=developer
DB_PASS=your_password_from_render

# Redis (use your Internal Redis URL from Step 4)
REDIS_HOST=red-xxxxx
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string

# Service URLs (we'll update these after deploying other services)
BIOMETRIC_SERVICE_URL=https://eazepay-biometric.onrender.com
TRANSACTION_SERVICE_URL=https://eazepay-transaction.onrender.com
```

#### C. Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build and deployment
3. ✅ Your Identity Service is live at: `https://eazepay-identity.onrender.com`

#### D. Test It

```bash
curl https://eazepay-identity.onrender.com/health
```

---

### 5.2 Deploy AI/ML Service

Repeat the process:

1. **New +** → **Web Service**
2. **Repository**: `eazepay-platform`
3. **Settings**:
   - **Name**: `eazepay-ai-ml`
   - **Root Directory**: `services/ai-ml-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables**:
```env
PORT=8010
LOG_LEVEL=INFO
POSTGRES_HOST=dpg-xxxxx-a.oregon-postgres.render.com
POSTGRES_PORT=5432
POSTGRES_DB=eazepay_dev
POSTGRES_USER=developer
POSTGRES_PASSWORD=your_password
REDIS_HOST=red-xxxxx
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

5. **Deploy** → Wait 5-10 minutes

✅ Live at: `https://eazepay-ai-ml.onrender.com`

---

### 5.3 Deploy IoT Service

1. **New +** → **Web Service**
2. **Settings**:
   - **Name**: `eazepay-iot`
   - **Root Directory**: `services/iot-service`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Environment Variables**:
```env
NODE_ENV=production
PORT=8020
POSTGRES_HOST=dpg-xxxxx-a.oregon-postgres.render.com
POSTGRES_PORT=5432
POSTGRES_DB=eazepay_dev
POSTGRES_USER=developer
POSTGRES_PASSWORD=your_password
REDIS_HOST=red-xxxxx
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
MQTT_BROKER_URL=mqtt://test.mosquitto.org:1883
AGENT_SERVICE_URL=https://eazepay-agent.onrender.com
```

✅ Live at: `https://eazepay-iot.onrender.com`

---

### 5.4 Deploy Blockchain Service

1. **New +** → **Web Service**
2. **Settings**:
   - **Name**: `eazepay-blockchain`
   - **Root Directory**: `services/blockchain-service`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Environment Variables**:
```env
NODE_ENV=production
PORT=8030
TRANSACTION_SERVICE_URL=https://eazepay-transaction.onrender.com
IDENTITY_SERVICE_URL=https://eazepay-identity.onrender.com
```

✅ Live at: `https://eazepay-blockchain.onrender.com`

---

### 5.5 Deploy Robotics Service

1. **New +** → **Web Service**
2. **Settings**:
   - **Name**: `eazepay-robotics`
   - **Root Directory**: `services/robotics-service`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Environment Variables**:
```env
NODE_ENV=production
PORT=8040
TRANSACTION_SERVICE_URL=https://eazepay-transaction.onrender.com
IDENTITY_SERVICE_URL=https://eazepay-identity.onrender.com
BIOMETRIC_SERVICE_URL=https://eazepay-biometric.onrender.com
POSTGRES_HOST=dpg-xxxxx-a.oregon-postgres.render.com
POSTGRES_PORT=5432
POSTGRES_DB=eazepay_dev
POSTGRES_USER=developer
POSTGRES_PASSWORD=your_password
REDIS_HOST=red-xxxxx
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

✅ Live at: `https://eazepay-robotics.onrender.com`

---

### 5.6 Deploy Transaction Service (Java/Spring Boot)

1. **New +** → **Web Service**
2. **Settings**:
   - **Name**: `eazepay-transaction`
   - **Root Directory**: `services/transaction-service`
   - **Runtime**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/transaction-service-1.0.0.jar`

3. **Environment Variables**:
```env
SPRING_PROFILES_ACTIVE=production
SERVER_PORT=8002
SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-xxxxx-a.oregon-postgres.render.com:5432/eazepay_dev
SPRING_DATASOURCE_USERNAME=developer
SPRING_DATASOURCE_PASSWORD=your_password
SPRING_REDIS_HOST=red-xxxxx
SPRING_REDIS_PORT=6379
SPRING_REDIS_PASSWORD=your_redis_password
IDENTITY_SERVICE_URL=https://eazepay-identity.onrender.com
WALLET_SERVICE_URL=https://eazepay-wallet.onrender.com
AIML_SERVICE_URL=https://eazepay-ai-ml.onrender.com
BLOCKCHAIN_SERVICE_URL=https://eazepay-blockchain.onrender.com
```

✅ Live at: `https://eazepay-transaction.onrender.com`

---

### 5.7 Deploy Remaining Services

Repeat the same process for:

**Biometric Service** (Python):
- Name: `eazepay-biometric`
- Root: `services/biometric-service`
- Runtime: Python 3
- Start: `python main.py`

**Wallet Service** (Go):
- Name: `eazepay-wallet`
- Root: `services/wallet-service`
- Runtime: Go
- Build: `go build -o wallet-service`
- Start: `./wallet-service`

**Agent Service** (Node):
- Name: `eazepay-agent`
- Root: `services/agent-service`

**USSD Service** (Node):
- Name: `eazepay-ussd`
- Root: `services/ussd-service`

---

## 🌐 Step 6: Deploy Web Portals (5 minutes)

### 6.1 Deploy Admin Portal

1. **New +** → **Static Site**
2. **Settings**:
   - **Name**: `eazepay-admin-portal`
   - **Root Directory**: `services/admin-portal`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**:
```env
VITE_API_GATEWAY_URL=https://eazepay-identity.onrender.com
VITE_IDENTITY_SERVICE_URL=https://eazepay-identity.onrender.com
```

✅ Live at: `https://eazepay-admin-portal.onrender.com`

### 6.2 Deploy Customer Portal

Same process:
- Name: `eazepay-customer-portal`
- Root: `services/customer-portal`

### 6.3 Deploy Agent Portal

- Name: `eazepay-agent-portal`
- Root: `services/agent-portal`

---

## ✅ Step 7: Verify All Services (5 minutes)

### 7.1 Check Service Health

Test each service:

```bash
# AI/ML Service
curl https://eazepay-ai-ml.onrender.com/health

# IoT Service
curl https://eazepay-iot.onrender.com/health

# Blockchain Service
curl https://eazepay-blockchain.onrender.com/health

# Robotics Service
curl https://eazepay-robotics.onrender.com/health

# Identity Service
curl https://eazepay-identity.onrender.com/health
```

### 7.2 Your Live URLs

```
Admin Portal:      https://eazepay-admin-portal.onrender.com
Customer Portal:   https://eazepay-customer-portal.onrender.com
Agent Portal:      https://eazepay-agent-portal.onrender.com

Identity Service:  https://eazepay-identity.onrender.com
Transaction:       https://eazepay-transaction.onrender.com
AI/ML:             https://eazepay-ai-ml.onrender.com
IoT:               https://eazepay-iot.onrender.com
Blockchain:        https://eazepay-blockchain.onrender.com
Robotics:          https://eazepay-robotics.onrender.com
```

---

## 🎯 Step 8: Update Service URLs (5 minutes)

Now that all services are deployed, update the environment variables with actual URLs.

### 8.1 Update Identity Service

Go to Identity Service → **Environment** → Edit:

```env
BIOMETRIC_SERVICE_URL=https://eazepay-biometric.onrender.com
TRANSACTION_SERVICE_URL=https://eazepay-transaction.onrender.com
BLOCKCHAIN_SERVICE_URL=https://eazepay-blockchain.onrender.com
```

Click **Save Changes** → Service will auto-redeploy

### 8.2 Update All Other Services

Repeat for each service, updating their service URLs to point to the actual Render URLs.

---

## 🔧 Step 9: Configure Custom Domain (Optional)

### 9.1 Add Custom Domain

1. Go to any service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain: `api.eazepay.com`
4. Follow DNS instructions
5. Render provides free SSL certificate

---

## 📊 Step 10: Monitor Your Services

### 10.1 View Logs

1. Click on any service
2. Go to **"Logs"** tab
3. See real-time logs

### 10.2 View Metrics

1. Go to **"Metrics"** tab
2. See:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## ⚠️ Important Notes

### Free Tier Limitations

1. **Services Sleep After 15 Minutes**
   - First request after sleep takes 30-60 seconds (cold start)
   - Solution: Use a service like [UptimeRobot](https://uptimerobot.com) to ping every 10 minutes

2. **PostgreSQL Free for 90 Days**
   - After 90 days, upgrade to paid ($7/month) or migrate to another provider
   - Export your data before expiry

3. **Redis Free for 30 Days**
   - After 30 days, upgrade to paid ($10/month) or use alternative

4. **512 MB RAM Per Service**
   - Sufficient for most services
   - Java services might be tight (consider optimization)

---

## 🚀 Auto-Deploy Setup

### Enable Auto-Deploy

1. Go to any service
2. **Settings** → **"Build & Deploy"**
3. Enable **"Auto-Deploy"**
4. Now every push to `main` branch auto-deploys!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Render automatically deploys! 🎉
```

---

## 🧪 Testing Your Deployment

### Test AI/ML Fraud Detection

```bash
curl -X POST https://eazepay-ai-ml.onrender.com/api/fraud/check \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "userId": "user_123",
    "location": "Nairobi",
    "timeOfDay": 14
  }'
```

### Test IoT Device Registration

```bash
curl -X POST https://eazepay-iot.onrender.com/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device_001",
    "deviceType": "AGENT_PHONE",
    "agentId": "agent_123"
  }'
```

### Test Blockchain Transaction

```bash
curl -X POST https://eazepay-blockchain.onrender.com/api/blockchain/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "txn_123",
    "amount": 1000,
    "fromAccount": "ACC001",
    "toAccount": "ACC002"
  }'
```

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Redis cache created
- [ ] Identity Service deployed
- [ ] AI/ML Service deployed
- [ ] IoT Service deployed
- [ ] Blockchain Service deployed
- [ ] Robotics Service deployed
- [ ] Transaction Service deployed
- [ ] All portals deployed
- [ ] Service URLs updated
- [ ] Health checks passing
- [ ] Test API calls working

---

## 🔧 Troubleshooting

### Service Won't Start

**Check Logs:**
1. Go to service → **Logs** tab
2. Look for errors

**Common Issues:**
- Missing environment variables
- Wrong build/start commands
- Port conflicts (use `$PORT` environment variable)

### Database Connection Failed

**Check:**
1. Database URL is correct (Internal URL, not External)
2. Database is running (green status)
3. Credentials are correct

### Service is Slow

**Reason:** Cold start after 15 min inactivity

**Solutions:**
1. Use [UptimeRobot](https://uptimerobot.com) to ping every 10 minutes
2. Upgrade to paid plan ($7/month) - no cold starts

---

## 💰 Cost Breakdown

### Free Tier (90 days)

```
PostgreSQL:        $0 (90 days free)
Redis:             $0 (30 days free)
10+ Web Services:  $0 (free tier)
Static Sites:      $0 (unlimited free)
SSL Certificates:  $0 (included)
Bandwidth:         $0 (100 GB/month free)

Total: $0 for 30-90 days
```

### After Free Tier

```
PostgreSQL:        $7/month
Redis:             $10/month
Web Services:      $7/month each (or keep free with cold starts)

Minimum: $17/month (database + redis, keep services on free tier)
Recommended: $87/month (upgrade 3-4 critical services)
```

---

## 📈 Next Steps

### After Deployment

1. **Share Your URLs** with team/investors
2. **Monitor Performance** in Render dashboard
3. **Set Up Alerts** for downtime
4. **Add Custom Domains** for professional look
5. **Plan Migration** to paid tier or other platform before free tier expires

### Before Free Tier Expires

**Option 1:** Upgrade Render services ($17-100/month)  
**Option 2:** Migrate to Oracle Cloud (free forever)  
**Option 3:** Migrate to DigitalOcean ($100-300/month)

---

## 🎯 Summary

You now have:
- ✅ **10+ microservices** deployed and running
- ✅ **AI/ML fraud detection** live
- ✅ **IoT device tracking** operational
- ✅ **Blockchain ledger** functional
- ✅ **Robotics automation** ready
- ✅ **All portals** accessible online
- ✅ **Automatic HTTPS** enabled
- ✅ **Auto-deploy** from GitHub

**Total Cost:** $0  
**Total Time:** 30-45 minutes  
**Status:** 🟢 LIVE AND OPERATIONAL

---

## 📞 Support

### Render Support
- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

### Need Help?
- Check service logs in Render dashboard
- Review environment variables
- Test locally first with Docker Compose

---

**🎉 Congratulations! Your Eazepay platform is now live online!**

Share your URLs and start testing! 🚀

---

**Last Updated**: October 22, 2025  
**Version**: 1.0  
**Platform**: Render.com Free Tier
