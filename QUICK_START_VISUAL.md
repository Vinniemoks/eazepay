# 🚀 Quick Start - See Your App in 10 Minutes!

## ⚡ Fast Track to Visual Preview

Follow these steps to see your EazePay app running visually!

## ✅ Prerequisites Check

```bash
# Check if you have these installed:
node --version    # Need 18+
npm --version     # Need 9+
java -version     # Need 11+
```

**Don't have them?** See [REACT_NATIVE_SETUP_GUIDE.md](./REACT_NATIVE_SETUP_GUIDE.md)

## 🎯 5-Step Quick Start

### Step 1: Install Android Studio (15 min)
```
1. Download: https://developer.android.com/studio
2. Run installer
3. Follow setup wizard
4. Install Android SDK
```

### Step 2: Create Emulator (5 min)
```
1. Open Android Studio
2. More Actions → Virtual Device Manager
3. Create Device → Pixel 5
4. Download System Image (API 33)
5. Finish
```

### Step 3: Install Dependencies (5 min)
```bash
cd mobile-app
npm install
```

### Step 4: Start Emulator (2 min)
```
1. Open Android Studio
2. Virtual Device Manager
3. Click ▶️ next to your device
4. Wait for Android to boot
```

### Step 5: Run App! (5 min)
```bash
# Terminal 1
npm start

# Terminal 2 (new terminal)
npx react-native run-android
```

## 🎉 You Should See:

1. ✅ Metro bundler running in terminal 1
2. ✅ Build progress in terminal 2
3. ✅ Emulator showing Android
4. ✅ **Your EazePay app launches!** 🎊

## 🎨 What You'll See

### Splash Screen
- EazePay logo
- "Pay with a fingerprint"

### Login Screen
- Email/password inputs
- "Login" button
- "Use Biometric" button

### Home Screen (After Login)
- Wallet balance card (gradient)
- 4 quick action buttons
- Virtual cards preview
- Notifications bell

### Bottom Navigation
- 🏠 Home
- 💰 Wallet
- 📊 Transactions
- 👤 Profile

## 🔥 Enable Live Editing

In emulator:
1. Press `Ctrl + M`
2. Select "Enable Fast Refresh"

Now edit any file and save - app updates instantly!

## 🎨 Try This Now!

1. Open `mobile-app/src/screens/HomeScreen.tsx`
2. Find line with "Hello! 👋"
3. Change to "Welcome! 🎉"
4. Save file (`Ctrl + S`)
5. **Watch app update instantly!** ⚡

## 📱 Navigate Through App

### Test These Screens:
- ✅ Home → Tap "Create Card"
- ✅ Home → Tap "Top Up"
- ✅ Wallet → View balance
- ✅ Transactions → See history
- ✅ Profile → View settings

## 🐛 Quick Fixes

### App Won't Build?
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Metro Won't Start?
```bash
npm start -- --reset-cache
```

### Emulator Slow?
```
Android Studio → AVD Manager → 
Edit Device → Show Advanced Settings →
RAM: 4096 MB
```

## 🎯 VS Code Extensions (Optional but Recommended)

Install these for better experience:

```bash
# In VS Code, press Ctrl+P and paste:
ext install msjsdiag.vscode-react-native
ext install dsznajder.es7-react-js-snippets
ext install esbenp.prettier-vscode
```

## 📊 See Component Hierarchy

In emulator:
1. Press `Ctrl + M`
2. Select "Show Element Inspector"
3. Tap any element to see its props!

## 🎨 Change Colors Live

Try this:
1. Open `mobile-app/src/config/theme.ts`
2. Change primary color:
   ```typescript
   primary: '#FF6B6B',  // Red instead of blue
   ```
3. Save and watch all buttons change color!

## 🚀 Next Steps

1. ✅ Explore all screens
2. ✅ Edit components
3. ✅ See changes live
4. ✅ Test on real device
5. ✅ Build for production

## 📚 Full Setup Guide

For complete setup with iOS, debugging tools, and more:
👉 See [REACT_NATIVE_SETUP_GUIDE.md](./REACT_NATIVE_SETUP_GUIDE.md)

## 🎉 Congratulations!

You're now seeing your EazePay app running visually! 

**Time to build something amazing! 🚀📱**

---

**Stuck?** Check [REACT_NATIVE_SETUP_GUIDE.md](./REACT_NATIVE_SETUP_GUIDE.md) for detailed troubleshooting.
