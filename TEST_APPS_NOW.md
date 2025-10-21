# 🚀 Test Eazepay Apps RIGHT NOW!

## Easiest Way to Test (5 Minutes)

### Step 1: Start Backend (1 minute)

```bash
docker-compose up -d identity-service
```

Wait for it to start, then verify:
```bash
curl http://localhost:8000/health
```

### Step 2: Test Web App (1 minute)

**Windows - Just double-click**:
```
test-apps/test-web-app.bat
```

**Or manually**:
1. Open `test-apps/web-app/index.html` in your browser
2. Login with any email/password (for testing)

**What you'll see**:
- ✅ Login form
- ✅ Dashboard with balance
- ✅ Transaction list
- ✅ Action buttons

---

## Want to Test Desktop App? (10 Minutes)

### Prerequisites
- Node.js 18+ (Download: https://nodejs.org/)

### Setup

**Windows - Double-click**:
```
test-apps/setup-desktop-app.bat
```

**Or manually**:
```bash
cd desktop-app
npm install
npm run dev
```

**What you'll see**:
- ✅ Native desktop window
- ✅ Login screen
- ✅ Dashboard
- ✅ Send money form
- ✅ Transaction history

---

## Want to Test Mobile App? (30+ Minutes)

### Prerequisites
- Node.js 18+
- **Android**: Android Studio + Android SDK
- **iOS**: Xcode (Mac only) + CocoaPods

### Setup

**Windows - Double-click**:
```
test-apps/setup-mobile-app.bat
```

**Then run**:
```bash
cd mobile-app

# Android
npm run android

# iOS (Mac only)
cd ios && pod install && cd ..
npm run ios
```

---

## 🎯 What to Test

### Web App (Easiest)
1. Open in browser
2. Login
3. View dashboard
4. Check balance
5. View transactions
6. Logout

### Desktop App
1. Install dependencies
2. Run app
3. Login
4. View dashboard
5. Try send money form
6. View transactions

### Mobile App
1. Install dependencies
2. Set up emulator/device
3. Run app
4. Test biometric auth
5. Test offline mode
6. Test push notifications

---

## 🔧 Troubleshooting

### Backend Issues

**Backend won't start**:
```bash
docker-compose down
docker-compose up -d identity-service
docker-compose logs -f identity-service
```

**Can't connect to backend**:
```bash
# Check if running
docker-compose ps

# Check health
curl http://localhost:8000/health

# Check logs
docker-compose logs identity-service
```

### Web App Issues

**"Cannot connect to API"**:
- Make sure backend is running
- Check: http://localhost:8000/health
- Open browser console (F12) for errors

**Login fails**:
- Check backend logs
- Try different credentials
- Check CORS settings

### Desktop App Issues

**"npm install" fails**:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

**App won't start**:
```bash
# Try rebuilding
npm run build
npm run dev
```

### Mobile App Issues

**Build fails**:
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

**Metro bundler issues**:
```bash
npm start -- --reset-cache
```

---

## 📊 Testing Checklist

### Basic Testing (Web App)
- [ ] Backend is running
- [ ] Can access http://localhost:8000/health
- [ ] Web app opens in browser
- [ ] Can see login form
- [ ] Can login (even if it fails, UI should work)
- [ ] Can see dashboard
- [ ] Can logout

### Advanced Testing (Desktop App)
- [ ] Node.js installed
- [ ] Dependencies installed
- [ ] App starts successfully
- [ ] Login screen appears
- [ ] Can navigate between screens
- [ ] Forms work correctly

### Full Testing (Mobile App)
- [ ] Development environment set up
- [ ] App builds successfully
- [ ] App runs on emulator/device
- [ ] All features work
- [ ] Biometric auth works
- [ ] Offline mode works

---

## 🎉 Success!

Once you can:
1. ✅ Start the backend
2. ✅ Open the web app
3. ✅ See the login screen
4. ✅ See the dashboard

**You're ready to customize and deploy!**

---

## 📝 Next Steps

### After Testing Works

1. **Customize Branding**
   - Update colors
   - Add your logo
   - Change app name

2. **Add Features**
   - Complete send money
   - Add request money
   - Add QR scanning

3. **Deploy**
   - Build production versions
   - Deploy to servers
   - Submit to app stores

---

## 🆘 Still Stuck?

### Quick Fixes

1. **Restart everything**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **Check ports**:
   ```bash
   netstat -ano | findstr :8000
   ```

3. **Clear cache**:
   ```bash
   npm cache clean --force
   ```

4. **Check logs**:
   ```bash
   docker-compose logs -f identity-service
   ```

### Get More Help

- Check [test-apps/QUICK_TEST_GUIDE.md](./test-apps/QUICK_TEST_GUIDE.md)
- Check [APPS_SETUP_GUIDE.md](./APPS_SETUP_GUIDE.md)
- Check [COMPLETE_PLATFORM_GUIDE.md](./COMPLETE_PLATFORM_GUIDE.md)

---

## 🎯 Recommended Path

**Day 1**: Test web app (easiest)
**Day 2**: Test desktop app (medium)
**Day 3**: Set up mobile environment
**Day 4**: Test mobile app
**Day 5**: Customize and deploy

---

**Start with the web app - it's the easiest way to see everything working!**

Just double-click: `test-apps/test-web-app.bat`
