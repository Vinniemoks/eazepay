# Eazepay Mobile & Desktop Apps - Setup Guide

## 📱 Mobile App (React Native)

### Prerequisites
- Node.js 18+
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

### Setup Instructions

#### 1. Install Dependencies
```bash
cd mobile-app
npm install

# iOS only
cd ios && pod install && cd ..
```

#### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API URL
```

#### 3. Configure Firebase
1. Create Firebase project at https://console.firebase.google.com
2. Add iOS and Android apps
3. Download `google-services.json` (Android) → `android/app/`
4. Download `GoogleService-Info.plist` (iOS) → `ios/`

#### 4. Run Development

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

### Build for Production

**Android APK:**
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

**iOS:**
```bash
# Open Xcode
open ios/Eazepay.xcworkspace

# Select Product > Archive
# Follow App Store submission process
```

### Features Implemented

✅ **Authentication**
- Email/Password login
- Biometric authentication (Face ID/Touch ID)
- 2FA support
- Auto token refresh

✅ **Wallet**
- View balance
- Send money
- Request money
- Transaction history

✅ **Offline Mode**
- Queue transactions when offline
- Auto-sync when back online
- Local data persistence

✅ **Push Notifications**
- Transaction alerts
- Firebase Cloud Messaging
- Local notifications

✅ **Security**
- Biometric authentication
- Secure storage
- PIN protection
- Session management

---

## 💻 Desktop App (Electron)

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup Instructions

#### 1. Install Dependencies
```bash
cd desktop-app
npm install
```

#### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API URL
```

#### 3. Run Development
```bash
npm run dev
```

### Build for Production

**Windows:**
```bash
npm run build:win
# Output: release/Eazepay Setup.exe
```

**macOS:**
```bash
npm run build:mac
# Output: release/Eazepay.dmg
```

**Linux:**
```bash
npm run build:linux
# Output: release/Eazepay.AppImage
```

### Features Implemented

✅ **Authentication**
- Email/Password login
- Secure token storage
- Auto logout

✅ **Wallet Management**
- View balance
- Send money
- Transaction history
- Real-time updates

✅ **Desktop Features**
- Native menus
- System tray integration
- Auto-updates (configurable)
- Offline support

---

## 🔧 Configuration

### Mobile App Configuration

**API Endpoints** (`mobile-app/.env`):
```env
API_URL=https://api.eazepay.com
API_TIMEOUT=30000
ENABLE_BIOMETRIC=true
ENABLE_OFFLINE=true
```

**Firebase** (`mobile-app/firebase.json`):
```json
{
  "project_id": "your-project-id",
  "api_key": "your-api-key"
}
```

### Desktop App Configuration

**API Endpoints** (`desktop-app/.env`):
```env
API_URL=http://localhost:8000
NODE_ENV=production
```

---

## 📦 Project Structure

### Mobile App
```
mobile-app/
├── src/
│   ├── api/              # API clients
│   ├── components/       # Reusable components
│   ├── screens/          # App screens
│   ├── services/         # Business logic
│   ├── store/            # State management
│   └── config/           # Configuration
├── android/              # Android native code
├── ios/                  # iOS native code
└── App.tsx               # Root component
```

### Desktop App
```
desktop-app/
├── src/
│   ├── main/             # Electron main process
│   │   ├── main.ts       # Main entry point
│   │   └── preload.ts    # Preload script
│   └── renderer/         # React UI
│       ├── components/   # UI components
│       ├── App.tsx       # Main app
│       └── App.css       # Styles
└── package.json
```

---

## 🚀 Deployment

### Mobile App Deployment

#### iOS App Store
1. Create App Store Connect account
2. Create app listing
3. Archive app in Xcode
4. Upload to App Store Connect
5. Submit for review

#### Google Play Store
1. Create Google Play Console account
2. Create app listing
3. Generate signed APK/AAB
4. Upload to Play Console
5. Submit for review

### Desktop App Deployment

#### Auto-Updates
Configure `electron-builder` for auto-updates:
```json
{
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "eazepay"
  }
}
```

#### Distribution
- **Windows**: Distribute `.exe` installer
- **macOS**: Distribute `.dmg` or via Mac App Store
- **Linux**: Distribute `.AppImage` or `.deb`

---

## 🔐 Security Best Practices

### Mobile App
- ✅ Use biometric authentication
- ✅ Encrypt sensitive data
- ✅ Implement certificate pinning
- ✅ Use secure storage (Keychain/Keystore)
- ✅ Obfuscate code in production

### Desktop App
- ✅ Use electron-store for secure storage
- ✅ Implement CSP (Content Security Policy)
- ✅ Disable Node integration in renderer
- ✅ Use context isolation
- ✅ Validate all user inputs

---

## 🧪 Testing

### Mobile App Testing
```bash
# Unit tests
npm test

# E2E tests (Detox)
npm run test:e2e
```

### Desktop App Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

---

## 📊 Monitoring

### Mobile App
- **Sentry**: Error tracking
- **Firebase Analytics**: User analytics
- **Firebase Crashlytics**: Crash reporting

### Desktop App
- **Sentry**: Error tracking
- **Custom analytics**: Usage tracking

---

## 🆘 Troubleshooting

### Mobile App Issues

**Build Failures:**
```bash
# Clean build
cd android && ./gradlew clean
cd ios && pod deintegrate && pod install
```

**Metro Bundler Issues:**
```bash
npm start -- --reset-cache
```

### Desktop App Issues

**Build Failures:**
```bash
# Clean install
rm -rf node_modules dist
npm install
```

**Electron Issues:**
```bash
# Rebuild native modules
npm rebuild
```

---

## 📝 Next Steps

1. **Customize branding** - Update logos, colors, app names
2. **Configure API endpoints** - Point to your production API
3. **Set up Firebase** - Configure push notifications
4. **Test thoroughly** - Test on real devices
5. **Submit to stores** - Follow app store guidelines
6. **Monitor performance** - Set up analytics and error tracking

---

## 🤝 Support

For issues or questions:
- Check documentation
- Review error logs
- Contact development team

---

**Eazepay** - Secure Mobile & Desktop Payments
