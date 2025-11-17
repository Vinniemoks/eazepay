# 📱 React Native Development Setup Guide

## 🎯 Complete Setup to See Your App Visually

This guide will help you install everything needed to build and run your EazePay mobile app with live preview!

## 🖥️ System Requirements

### Windows (Your System)
- Windows 10 or later (64-bit)
- At least 8GB RAM (16GB recommended)
- 20GB free disk space

## 📦 Step 1: Install Required Software

### 1.1 Install Node.js
```bash
# Download and install Node.js 18 LTS or later
# Visit: https://nodejs.org/
# Download the Windows Installer (.msi)
# Run installer and follow prompts
```

**Verify installation:**
```bash
node --version  # Should show v18.x.x or later
npm --version   # Should show 9.x.x or later
```

### 1.2 Install Java Development Kit (JDK)
```bash
# Download JDK 11 or later
# Visit: https://adoptium.net/
# Download Windows x64 installer
# Run installer, check "Set JAVA_HOME" option
```

**Verify installation:**
```bash
java -version  # Should show version 11 or later
```

### 1.3 Install Android Studio
```bash
# Download Android Studio
# Visit: https://developer.android.com/studio
# Download Windows installer
# Run installer with default settings
```

**During installation:**
- ✅ Install Android SDK
- ✅ Install Android SDK Platform
- ✅ Install Android Virtual Device (AVD)

### 1.4 Configure Android Studio

**Open Android Studio:**
1. Click "More Actions" → "SDK Manager"
2. Go to "SDK Platforms" tab
3. Check:
   - ✅ Android 13.0 (Tiramisu) - API Level 33
   - ✅ Android 12.0 (S) - API Level 31
4. Go to "SDK Tools" tab
5. Check:
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ Intel x86 Emulator Accelerator (HAXM)
6. Click "Apply" and wait for installation

### 1.5 Set Environment Variables

**Add to System Environment Variables:**

1. Open "Environment Variables":
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"

2. Add `ANDROID_HOME`:
   - Click "New" under System variables
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`

3. Add to `Path`:
   - Select "Path" → Click "Edit"
   - Add these entries:
     ```
     %ANDROID_HOME%\platform-tools
     %ANDROID_HOME%\emulator
     %ANDROID_HOME%\tools
     %ANDROID_HOME%\tools\bin
     ```

4. Click "OK" to save

**Verify:**
```bash
# Close and reopen terminal
adb --version  # Should show Android Debug Bridge version
```

## 📱 Step 2: Create Android Virtual Device (Emulator)

### 2.1 Open AVD Manager
1. Open Android Studio
2. Click "More Actions" → "Virtual Device Manager"
3. Click "Create Device"

### 2.2 Configure Device
1. **Select Hardware:**
   - Choose "Pixel 5" or "Pixel 6"
   - Click "Next"

2. **Select System Image:**
   - Choose "Tiramisu" (API Level 33)
   - Click "Download" if needed
   - Click "Next"

3. **Verify Configuration:**
   - Name: "Pixel_5_API_33"
   - Click "Finish"

### 2.3 Test Emulator
1. Click ▶️ (Play) button next to your device
2. Wait for emulator to boot (first time takes 2-3 minutes)
3. You should see Android home screen

## 🚀 Step 3: Install React Native CLI

```bash
npm install -g react-native-cli
```

**Verify:**
```bash
npx react-native --version
```

## 📱 Step 4: Setup Your EazePay Project

### 4.1 Navigate to Project
```bash
cd C:\Users\Window\Desktop\eazepay\mobile-app
```

### 4.2 Install Dependencies
```bash
# Install all npm packages
npm install

# Install specific packages for your app
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npm install @react-navigation/stack
npm install react-native-screens
npm install react-native-safe-area-context
npm install react-native-vector-icons
npm install zustand
npm install axios
npm install @react-native-async-storage/async-storage
npm install react-native-biometrics
npm install react-native-linear-gradient
```

### 4.3 Link Native Dependencies
```bash
npx react-native link react-native-vector-icons
```

## 🎨 Step 5: VS Code Extensions (Recommended)

Install these extensions in VS Code for better development experience:

### Essential Extensions
1. **React Native Tools** (by Microsoft)
   - Debugging and IntelliSense
   - Command: `ext install msjsdiag.vscode-react-native`

2. **ES7+ React/Redux/React-Native snippets**
   - Code snippets
   - Command: `ext install dsznajder.es7-react-js-snippets`

3. **Prettier - Code formatter**
   - Auto-formatting
   - Command: `ext install esbenp.prettier-vscode`

4. **ESLint**
   - Linting
   - Command: `ext install dbaeumer.vscode-eslint`

5. **React Native Snippet**
   - More snippets
   - Command: `ext install jundat95.react-native-snippet`

### Helpful Extensions
6. **Auto Rename Tag**
   - Command: `ext install formulahendry.auto-rename-tag`

7. **Bracket Pair Colorizer 2**
   - Command: `ext install coenraads.bracket-pair-colorizer-2`

8. **Path Intellisense**
   - Command: `ext install christian-kohler.path-intellisense`

9. **GitLens**
   - Command: `ext install eamodio.gitlens`

10. **Material Icon Theme**
    - Command: `ext install pkief.material-icon-theme`

## 🏃 Step 6: Run Your App!

### 6.1 Start Metro Bundler
Open first terminal:
```bash
cd mobile-app
npm start
```

### 6.2 Run on Android Emulator
Open second terminal:
```bash
cd mobile-app
npx react-native run-android
```

**First build takes 5-10 minutes!**

### 6.3 What You'll See
1. Metro bundler starts in terminal 1
2. App builds in terminal 2
3. Emulator opens automatically
4. App installs and launches
5. You see your EazePay app! 🎉

## 🔥 Step 7: Enable Hot Reload

### In the Emulator:
1. Press `Ctrl + M` (or shake device)
2. Select "Enable Hot Reloading"
3. Select "Enable Fast Refresh"

**Now when you save files, the app updates instantly!**

## 🎨 Step 8: Visual Development Tools

### React Native Debugger
```bash
# Download from:
# https://github.com/jhen0409/react-native-debugger/releases

# Install and run
# In emulator: Ctrl + M → Debug
```

### Flipper (Facebook's Debugging Tool)
```bash
# Download from:
# https://fbflipper.com/

# Features:
# - Layout inspector
# - Network inspector
# - Logs viewer
# - Redux DevTools
```

## 📱 Step 9: Preview on Real Device

### Enable Developer Mode on Android Phone:
1. Go to Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back → Developer Options
4. Enable "USB Debugging"

### Connect and Run:
```bash
# Connect phone via USB
adb devices  # Should show your device

# Run app
npx react-native run-android
```

## 🎯 Quick Commands Reference

### Start Development
```bash
# Terminal 1: Start Metro
npm start

# Terminal 2: Run Android
npx react-native run-android
```

### Debugging
```bash
# Open dev menu in emulator
Ctrl + M

# Reload app
R R (press R twice)

# Clear cache and restart
npm start -- --reset-cache
```

### Build Issues
```bash
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
npx react-native run-android
```

## 🎨 VS Code Settings for React Native

Create `.vscode/settings.json` in your project:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

## 🚀 Step 10: See Your Screens!

Once the app is running, you can navigate through:

### Home Tab
- Dashboard with wallet balance
- Quick actions
- Virtual cards preview

### Wallet Tab
- Balance overview
- Top-up button
- Send money

### Transactions Tab
- Transaction history
- Filters

### Profile Tab
- User profile
- Settings
- Biometric enrollment

## 🎨 Live Editing

1. Open any screen file (e.g., `src/screens/HomeScreen.tsx`)
2. Make changes (e.g., change text color)
3. Save file (`Ctrl + S`)
4. Watch app update instantly! ⚡

## 📊 Performance Monitoring

### In VS Code:
1. Install "React Native Tools"
2. Press `F5` to start debugging
3. Set breakpoints
4. Inspect variables

### In Emulator:
1. Press `Ctrl + M`
2. Select "Show Perf Monitor"
3. See FPS, memory usage

## 🎯 Troubleshooting

### Metro Bundler Won't Start
```bash
# Kill existing processes
npx react-native start --reset-cache
```

### Build Fails
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Emulator Won't Start
```bash
# List emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_33
```

### App Crashes
```bash
# Check logs
npx react-native log-android
```

## 🎉 You're Ready!

You now have:
✅ Complete development environment
✅ Android emulator running
✅ VS Code with extensions
✅ Hot reload enabled
✅ Debugging tools
✅ Your EazePay app running visually!

## 📚 Next Steps

1. **Explore the app** - Navigate through all screens
2. **Make changes** - Edit colors, text, layouts
3. **See updates live** - Save and watch changes
4. **Debug** - Use React Native Debugger
5. **Test features** - Try all functionality

## 🔥 Pro Tips

1. **Use Snippets**: Type `rnf` + Tab for functional component
2. **Quick Reload**: Press `R` twice in emulator
3. **Element Inspector**: Shake device → "Show Element Inspector"
4. **Network Requests**: Use Flipper to see API calls
5. **Component Hierarchy**: Use React DevTools

---

**Need Help?**
- React Native Docs: https://reactnative.dev/
- Troubleshooting: https://reactnative.dev/docs/troubleshooting
- Community: https://stackoverflow.com/questions/tagged/react-native

**Happy Coding! 🚀📱**
