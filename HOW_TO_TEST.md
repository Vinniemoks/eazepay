# How to Test Eazepay Apps - Simple Guide

## 🚀 Absolute Easiest Way (Right Now!)

### Just Double-Click This File:
```
START_TESTING.bat
```

**What it does**:
1. Starts backend services
2. Waits for them to be ready
3. Opens web app in your browser

**That's it!** You'll see the Eazepay web app running.

---

## 📱 What Apps Can You Test?

### 1. Web App (✅ Ready Now!)
**File**: `test-apps/web-app/index.html`
**How**: Double-click `START_TESTING.bat`
**Time**: 2 minutes
**Requirements**: None!

**Features**:
- Login screen
- Dashboard
- Balance display
- Transaction list
- Logout

### 2. Desktop App (⚙️ Needs Setup)
**Location**: `desktop-app/`
**How**: Run `test-apps/setup-desktop-app.bat`
**Time**: 10 minutes
**Requirements**: Node.js 18+

**Features**:
- Native desktop window
- Full dashboard
- Send money form
- Transaction history
- Native menus

### 3. Mobile App (⚙️ Needs More Setup)
**Location**: `mobile-app/`
**How**: Run `test-apps/setup-mobile-app.bat`
**Time**: 30+ minutes
**Requirements**: Node.js + Android Studio or Xcode

**Features**:
- Biometric authentication
- Offline mode
- Push notifications
- QR code scanning
- Full mobile experience

---

## 🎯 Step-by-Step Testing

### Test 1: Web App (Start Here!)

**Step 1**: Start everything
```bash
START_TESTING.bat
```

**Step 2**: Wait for browser to open

**Step 3**: You'll see the login screen

**Step 4**: Try logging in (UI will work even if backend isn't ready)

**What to check**:
- ✅ Login form appears
- ✅ Can type in fields
- ✅ Button works
- ✅ Dashboard appears (if backend is ready)

---

### Test 2: Desktop App

**Step 1**: Install Node.js
- Download from: https://nodejs.org/
- Install the LTS version
- Restart your terminal

**Step 2**: Run setup
```bash
test-apps\setup-desktop-app.bat
```

**Step 3**: Start the app
```bash
cd desktop-app
npm run dev
```

**Step 4**: Test features
- Login screen
- Dashboard
- Send money
- Transactions

---

### Test 3: Mobile App (Advanced)

**For Android**:

1. Install Android Studio
2. Set up Android SDK
3. Create virtual device (emulator)
4. Run setup:
   ```bash
   test-apps\setup-mobile-app.bat
   ```
5. Start app:
   ```bash
   cd mobile-app
   npm run android
   ```

**For iOS** (Mac only):

1. Install Xcode from App Store
2. Install CocoaPods: `sudo gem install cocoapods`
3. Run setup:
   ```bash
   test-apps/setup-mobile-app.bat
   ```
4. Install pods:
   ```bash
   cd mobile-app/ios
   pod install
   cd ../..
   ```
5. Start app:
   ```bash
   cd mobile-app
   npm run ios
   ```

---

## 🔧 Common Issues & Fixes

### Issue: "Backend not running"

**Fix**:
```bash
docker-compose up -d identity-service
```

**Check**:
```bash
docker-compose ps
curl http://localhost:8000/health
```

### Issue: "Port already in use"

**Fix**:
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue: "npm install fails"

**Fix**:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Issue: "Docker not found"

**Fix**:
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/
- Restart your computer
- Run `docker --version` to verify

### Issue: "Node not found"

**Fix**:
- Install Node.js: https://nodejs.org/
- Choose LTS version
- Restart terminal
- Run `node --version` to verify

---

## 📊 Testing Checklist

### Web App Testing
- [ ] Run `START_TESTING.bat`
- [ ] Browser opens automatically
- [ ] Login screen appears
- [ ] Can type in fields
- [ ] Dashboard loads (if backend ready)
- [ ] Can see balance
- [ ] Can see transactions
- [ ] Can logout

### Desktop App Testing
- [ ] Node.js installed
- [ ] Run setup script
- [ ] Dependencies install successfully
- [ ] App starts with `npm run dev`
- [ ] Login screen appears
- [ ] Can navigate between screens
- [ ] Forms work
- [ ] Can logout

### Mobile App Testing
- [ ] Development environment set up
- [ ] Dependencies installed
- [ ] App builds successfully
- [ ] App runs on emulator/device
- [ ] Login works
- [ ] Biometric prompt appears
- [ ] Can send money
- [ ] Offline mode works

---

## 🎉 Success Criteria

### Minimum (Web App)
✅ Backend starts
✅ Web app opens
✅ Login screen visible
✅ UI is responsive

### Good (Desktop App)
✅ All of above
✅ Desktop app installs
✅ Desktop app runs
✅ All screens work

### Excellent (Mobile App)
✅ All of above
✅ Mobile app builds
✅ Mobile app runs
✅ All features work
✅ Biometric works

---

## 📝 What to Do After Testing

### If Web App Works:
1. ✅ You have a working platform!
2. Customize the branding
3. Add more features
4. Deploy to production

### If Desktop App Works:
1. ✅ You can distribute to users!
2. Build executable: `npm run build:win`
3. Share the installer
4. Get feedback

### If Mobile App Works:
1. ✅ You're ready for app stores!
2. Build release version
3. Submit to App Store / Play Store
4. Launch to users

---

## 🆘 Still Having Issues?

### Quick Diagnostics

**Check Docker**:
```bash
docker --version
docker-compose ps
```

**Check Node**:
```bash
node --version
npm --version
```

**Check Backend**:
```bash
curl http://localhost:8000/health
docker-compose logs identity-service
```

**Check Ports**:
```bash
netstat -ano | findstr :8000
netstat -ano | findstr :8080
```

### Get Help

1. Check error messages carefully
2. Look at logs: `docker-compose logs -f`
3. Check browser console (F12)
4. Review documentation:
   - [TEST_APPS_NOW.md](./TEST_APPS_NOW.md)
   - [test-apps/QUICK_TEST_GUIDE.md](./test-apps/QUICK_TEST_GUIDE.md)
   - [APPS_SETUP_GUIDE.md](./APPS_SETUP_GUIDE.md)

---

## 🎯 Recommended Testing Order

**Day 1**: 
- Run `START_TESTING.bat`
- Test web app
- Verify backend works

**Day 2**:
- Install Node.js
- Set up desktop app
- Test desktop features

**Day 3**:
- Install mobile dev tools
- Set up mobile app
- Test on emulator

**Day 4**:
- Test on real device
- Test all features
- Fix any issues

**Day 5**:
- Customize branding
- Add features
- Prepare for deployment

---

## ✅ You're Ready When...

- [ ] Web app opens and shows UI
- [ ] Backend responds to requests
- [ ] Can see login screen
- [ ] Can see dashboard
- [ ] No major errors in console

**Once these work, you have a functional platform!**

---

**Start now**: Just double-click `START_TESTING.bat`!
