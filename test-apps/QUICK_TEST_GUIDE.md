# Quick Test Guide - Eazepay Apps

## 🚀 Easiest Way to Test (Right Now!)

### Option 1: Web App (No Installation Required)

**Steps**:
1. Make sure your backend is running:
   ```bash
   docker-compose up -d identity-service
   ```

2. Open the web app:
   ```bash
   # Windows
   start test-apps/web-app/index.html
   
   # Or just double-click the file in File Explorer
   ```

3. Login with test credentials:
   - Email: `admin@eazepay.com`
   - Password: `your_password`

**Features**:
- ✅ Login/Logout
- ✅ View balance
- ✅ View transactions
- ✅ Works in any browser
- ✅ No installation needed

---

## 📱 Mobile App (React Native)

### Prerequisites
You need to install these first:

**For Android**:
1. Install Node.js: https://nodejs.org/
2. Install Android Studio: https://developer.android.com/studio
3. Set up Android SDK

**For iOS** (Mac only):
1. Install Node.js
2. Install Xcode from App Store
3. Install CocoaPods: `sudo gem install cocoapods`

### Setup & Run

```bash
# Navigate to mobile app
cd mobile-app

# Install dependencies
npm install

# For Android
npm run android

# For iOS (Mac only)
cd ios && pod install && cd ..
npm run ios
```

### Common Issues

**"Command not found: react-native"**
```bash
npm install -g react-native-cli
```

**Android build fails**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**iOS build fails**
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

---

## 💻 Desktop App (Electron)

### Prerequisites
- Node.js 18+ (https://nodejs.org/)

### Setup & Run

```bash
# Navigate to desktop app
cd desktop-app

# Install dependencies
npm install

# Run development mode
npm run dev
```

### Build Executable

```bash
# Windows
npm run build:win
# Output: release/Eazepay Setup.exe

# Mac
npm run build:mac
# Output: release/Eazepay.dmg

# Linux
npm run build:linux
# Output: release/Eazepay.AppImage
```

---

## 🔧 Troubleshooting

### Backend Not Running

**Check if services are running**:
```bash
docker-compose ps
```

**Start identity service**:
```bash
docker-compose up -d identity-service
```

**Check logs**:
```bash
docker-compose logs -f identity-service
```

### Port Already in Use

**Find what's using the port**:
```bash
# Windows
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <PID> /F
```

### CORS Errors

Make sure your backend allows requests from your app:
```env
# In services/identity-service/.env
CORS_ORIGIN=*
```

---

## 🎯 Recommended Testing Order

### 1. Start with Web App (Easiest)
- No installation required
- Works immediately
- Test basic functionality

### 2. Try Desktop App (Medium)
- Requires Node.js
- Quick to set up
- Native experience

### 3. Mobile App (Advanced)
- Requires more setup
- Need Android Studio or Xcode
- Full mobile experience

---

## 📝 Test Scenarios

### Basic Flow
1. ✅ Login with credentials
2. ✅ View wallet balance
3. ✅ View transaction history
4. ✅ Logout

### Advanced Flow (When backend is fully working)
1. Register new user
2. Verify with 2FA
3. Send money to another user
4. Request money
5. View detailed transaction

---

## 🆘 Still Having Issues?

### Quick Fixes

**"Cannot connect to API"**
- Check if backend is running: `docker-compose ps`
- Check API URL in app configuration
- Try: `http://localhost:8000` instead of `https://`

**"Login fails"**
- Check backend logs: `docker-compose logs identity-service`
- Verify database is running: `docker-compose ps postgresql`
- Try creating a test user first

**"App won't start"**
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Clear cache: `npm cache clean --force`

### Get Help

1. Check backend logs
2. Check browser console (F12)
3. Check app logs
4. Review error messages

---

## ✅ Success Checklist

- [ ] Backend services running
- [ ] Can access http://localhost:8000/health
- [ ] Web app opens in browser
- [ ] Can login successfully
- [ ] Can see dashboard
- [ ] Can logout

Once these work, you're ready to test the full apps!

---

## 🎉 Next Steps

Once basic testing works:

1. **Customize the apps**
   - Update branding
   - Change colors
   - Add your logo

2. **Add features**
   - Send money form
   - Request money
   - QR code scanning

3. **Deploy**
   - Build production versions
   - Deploy to app stores
   - Distribute to users

---

**Need more help?** Check the full guides:
- [APPS_SETUP_GUIDE.md](../APPS_SETUP_GUIDE.md)
- [COMPLETE_PLATFORM_GUIDE.md](../COMPLETE_PLATFORM_GUIDE.md)
