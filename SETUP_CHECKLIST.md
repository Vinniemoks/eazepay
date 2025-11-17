# ✅ React Native Setup Checklist

## 📋 Complete This Checklist to See Your App!

Track your progress as you set up your development environment.

## 🎯 Phase 1: Install Core Software

### Node.js & npm
- [ ] Download Node.js 18+ from https://nodejs.org/
- [ ] Run installer
- [ ] Verify: `node --version` shows v18+
- [ ] Verify: `npm --version` shows 9+

### Java Development Kit (JDK)
- [ ] Download JDK 11+ from https://adoptium.net/
- [ ] Run installer
- [ ] Check "Set JAVA_HOME" during installation
- [ ] Verify: `java -version` shows version 11+

### Android Studio
- [ ] Download from https://developer.android.com/studio
- [ ] Run installer (takes 10-15 minutes)
- [ ] Complete setup wizard
- [ ] Install Android SDK
- [ ] Install Android SDK Platform-Tools
- [ ] Install Android Emulator

## 🎯 Phase 2: Configure Android Studio

### SDK Manager Setup
- [ ] Open Android Studio
- [ ] Click "More Actions" → "SDK Manager"
- [ ] Go to "SDK Platforms" tab
- [ ] Check "Android 13.0 (Tiramisu)" - API Level 33
- [ ] Check "Android 12.0 (S)" - API Level 31
- [ ] Go to "SDK Tools" tab
- [ ] Check "Android SDK Build-Tools"
- [ ] Check "Android Emulator"
- [ ] Check "Android SDK Platform-Tools"
- [ ] Click "Apply" and wait for installation

### Environment Variables
- [ ] Open System Environment Variables (Win + X → System)
- [ ] Click "Environment Variables"
- [ ] Add new System variable:
  - Name: `ANDROID_HOME`
  - Value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
- [ ] Edit "Path" variable, add:
  - `%ANDROID_HOME%\platform-tools`
  - `%ANDROID_HOME%\emulator`
  - `%ANDROID_HOME%\tools`
  - `%ANDROID_HOME%\tools\bin`
- [ ] Click OK to save
- [ ] Close and reopen terminal
- [ ] Verify: `adb --version` works

## 🎯 Phase 3: Create Android Emulator

### Virtual Device Setup
- [ ] Open Android Studio
- [ ] Click "More Actions" → "Virtual Device Manager"
- [ ] Click "Create Device"
- [ ] Select "Pixel 5" or "Pixel 6"
- [ ] Click "Next"
- [ ] Select "Tiramisu" (API Level 33)
- [ ] Download system image if needed
- [ ] Click "Next"
- [ ] Name it "Pixel_5_API_33"
- [ ] Click "Finish"

### Test Emulator
- [ ] Click ▶️ (Play) button next to device
- [ ] Wait for emulator to boot (2-3 minutes first time)
- [ ] See Android home screen
- [ ] Emulator is working!

## 🎯 Phase 4: Install React Native

### React Native CLI
- [ ] Run: `npm install -g react-native-cli`
- [ ] Verify: `npx react-native --version`

## 🎯 Phase 5: Setup EazePay Project

### Navigate to Project
- [ ] Open terminal
- [ ] Run: `cd C:\Users\Window\Desktop\eazepay\mobile-app`

### Install Dependencies
- [ ] Run: `npm install`
- [ ] Wait for installation (5-10 minutes)
- [ ] No errors in terminal

### Install Additional Packages
- [ ] Run: `npm install @react-navigation/native`
- [ ] Run: `npm install @react-navigation/bottom-tabs`
- [ ] Run: `npm install @react-navigation/stack`
- [ ] Run: `npm install react-native-screens`
- [ ] Run: `npm install react-native-safe-area-context`
- [ ] Run: `npm install react-native-vector-icons`
- [ ] Run: `npm install zustand`
- [ ] Run: `npm install axios`
- [ ] Run: `npm install @react-native-async-storage/async-storage`
- [ ] Run: `npm install react-native-biometrics`
- [ ] Run: `npm install react-native-linear-gradient`

### Link Native Dependencies
- [ ] Run: `npx react-native link react-native-vector-icons`

## 🎯 Phase 6: VS Code Extensions

### Essential Extensions
- [ ] Install "React Native Tools" (msjsdiag.vscode-react-native)
- [ ] Install "ES7+ React/Redux/React-Native snippets"
- [ ] Install "Prettier - Code formatter"
- [ ] Install "ESLint"

### Optional but Helpful
- [ ] Install "Auto Rename Tag"
- [ ] Install "Path Intellisense"
- [ ] Install "Material Icon Theme"

## 🎯 Phase 7: Run Your App!

### Start Metro Bundler
- [ ] Open terminal 1
- [ ] Run: `cd mobile-app`
- [ ] Run: `npm start`
- [ ] Metro bundler starts successfully

### Start Emulator
- [ ] Open Android Studio
- [ ] Virtual Device Manager
- [ ] Click ▶️ next to your device
- [ ] Emulator boots up

### Run App on Emulator
- [ ] Open terminal 2
- [ ] Run: `cd mobile-app`
- [ ] Run: `npx react-native run-android`
- [ ] Wait for build (5-10 minutes first time)
- [ ] App installs on emulator
- [ ] **App launches successfully!** 🎉

## 🎯 Phase 8: Enable Hot Reload

### In Emulator
- [ ] Press `Ctrl + M` (or shake device)
- [ ] Select "Enable Hot Reloading"
- [ ] Select "Enable Fast Refresh"

### Test Hot Reload
- [ ] Open `src/screens/HomeScreen.tsx`
- [ ] Change some text
- [ ] Save file (`Ctrl + S`)
- [ ] See app update instantly!

## 🎯 Phase 9: Explore Your App

### Navigate Through Screens
- [ ] See Splash Screen
- [ ] See Login Screen
- [ ] Login (or skip to home)
- [ ] See Home Screen with wallet balance
- [ ] Tap "Create Card" button
- [ ] See Create Card Screen
- [ ] Go back to Home
- [ ] Tap bottom navigation tabs:
  - [ ] Home tab
  - [ ] Wallet tab
  - [ ] Transactions tab
  - [ ] Profile tab

### Test Features
- [ ] View wallet balance
- [ ] See virtual cards
- [ ] View transactions
- [ ] Open settings
- [ ] See biometric options

## 🎯 Phase 10: Debugging Tools (Optional)

### React Native Debugger
- [ ] Download from GitHub releases
- [ ] Install and run
- [ ] In emulator: Ctrl + M → Debug

### Flipper
- [ ] Download from https://fbflipper.com/
- [ ] Install and run
- [ ] Connect to app
- [ ] Explore layout inspector

## ✅ Success Criteria

You've successfully completed setup when:

✅ Emulator runs smoothly
✅ App builds without errors
✅ App launches and shows screens
✅ Hot reload works (changes appear instantly)
✅ You can navigate between screens
✅ No red error screens

## 🎉 Congratulations!

If you've checked all boxes, you now have:

✅ Complete React Native development environment
✅ Android emulator running
✅ EazePay app running visually
✅ Hot reload enabled
✅ Ready to develop!

## 📊 Time Estimate

- **Phase 1-2**: 30 minutes (installations)
- **Phase 3**: 10 minutes (emulator setup)
- **Phase 4-5**: 20 minutes (project setup)
- **Phase 6**: 5 minutes (extensions)
- **Phase 7**: 10 minutes (first run)
- **Phase 8-10**: 10 minutes (testing)

**Total**: ~90 minutes for complete setup

## 🐛 Common Issues

### ❌ "adb not found"
**Solution**: Check environment variables, restart terminal

### ❌ "SDK location not found"
**Solution**: Set ANDROID_HOME correctly

### ❌ "Build failed"
**Solution**: Run `cd android && ./gradlew clean && cd ..`

### ❌ "Metro bundler won't start"
**Solution**: Run `npm start -- --reset-cache`

### ❌ "Emulator is slow"
**Solution**: Increase RAM in AVD settings to 4096 MB

## 📚 Resources

- **Full Guide**: [REACT_NATIVE_SETUP_GUIDE.md](./REACT_NATIVE_SETUP_GUIDE.md)
- **Quick Start**: [QUICK_START_VISUAL.md](./QUICK_START_VISUAL.md)
- **React Native Docs**: https://reactnative.dev/
- **Troubleshooting**: https://reactnative.dev/docs/troubleshooting

## 🎯 Next Steps After Setup

1. [ ] Read [QUICK_REFERENCE.md](./mobile-app/QUICK_REFERENCE.md)
2. [ ] Explore all screens
3. [ ] Make your first code change
4. [ ] Test on real device
5. [ ] Start building features!

---

**Happy Coding! 🚀📱**

**Current Progress**: _____ / 100 checkboxes completed
