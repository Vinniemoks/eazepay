# Eazepay Test Apps

Quick and easy way to test Eazepay applications.

## 🚀 Quick Start (Easiest)

### 1. Test Web App (No Installation!)

```bash
# Windows - Just double-click:
test-web-app.bat

# Or manually open:
test-apps/web-app/index.html
```

**Requirements**: None! Just a web browser.

### 2. Test Desktop App

```bash
# Windows - Run setup:
setup-desktop-app.bat

# Then run the app:
cd desktop-app
npm run dev
```

**Requirements**: Node.js 18+

### 3. Test Mobile App

```bash
# Windows - Run setup:
setup-mobile-app.bat

# Then run:
cd mobile-app
npm run android  # or npm run ios
```

**Requirements**: Node.js 18+, Android Studio or Xcode

## 📚 Documentation

- [QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md) - Detailed testing guide
- [../APPS_SETUP_GUIDE.md](../APPS_SETUP_GUIDE.md) - Complete setup guide

## ✅ What to Test

### Web App
- ✅ Login
- ✅ View balance
- ✅ View transactions
- ✅ Logout

### Desktop App
- ✅ Login
- ✅ Dashboard
- ✅ Send money
- ✅ Transaction history

### Mobile App
- ✅ Login
- ✅ Biometric auth
- ✅ Send money
- ✅ Offline mode
- ✅ Push notifications

## 🆘 Troubleshooting

**Backend not running?**
```bash
docker-compose up -d identity-service
```

**Can't connect to API?**
- Check: http://localhost:8000/health
- Check backend logs: `docker-compose logs identity-service`

**Installation fails?**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

## 🎯 Recommended Order

1. **Start with Web App** - Easiest, no installation
2. **Try Desktop App** - Quick setup, native feel
3. **Test Mobile App** - Full mobile experience

---

**Need help?** Check [QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md)
