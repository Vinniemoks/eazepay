# Eazepay Mobile App

React Native mobile application for Eazepay payment platform.

## Features

- 🔐 Secure authentication with biometric support
- 💰 Wallet management (send, receive, request money)
- 📱 Offline mode with transaction queue
- 🔔 Push notifications
- 📊 Transaction history
- 🎨 Modern UI with dark mode support

## Quick Start

```bash
# Install dependencies
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## Configuration

Copy `.env.example` to `.env` and configure:
```env
API_URL=https://api.eazepay.com
ENABLE_BIOMETRIC=true
ENABLE_OFFLINE=true
```

## Build

```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

## Documentation

See [APPS_SETUP_GUIDE.md](../APPS_SETUP_GUIDE.md) for detailed setup instructions.
