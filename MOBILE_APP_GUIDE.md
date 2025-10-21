# Eazepay Mobile App Development Guide

## Overview

This guide covers the development of Eazepay mobile applications for iOS and Android platforms.

## Technology Stack Options

### Option 1: React Native (Recommended)
**Pros**:
- Single codebase for iOS and Android
- Large community and ecosystem
- Fast development
- Hot reload for quick iterations
- Can reuse some web components logic

**Cons**:
- Slightly larger app size
- Some native modules may be needed

### Option 2: Flutter
**Pros**:
- Excellent performance
- Beautiful UI out of the box
- Single codebase
- Growing ecosystem

**Cons**:
- Different language (Dart)
- Smaller community than React Native

### Option 3: Native (Swift/Kotlin)
**Pros**:
- Best performance
- Full platform capabilities
- Best user experience

**Cons**:
- Two separate codebases
- Longer development time
- Higher maintenance cost

## Recommended: React Native

### Project Structure
```
eazepay-mobile/
├── src/
│   ├── api/                    # API client
│   │   ├── client.ts          # HTTP client configuration
│   │   ├── auth.ts            # Authentication API
│   │   ├── transactions.ts    # Transaction API
│   │   ├── wallet.ts          # Wallet API
│   │   └── offline.ts         # Offline queue
│   ├── components/            # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── BiometricPrompt.tsx
│   ├── screens/               # App screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── BiometricSetupScreen.tsx
│   │   ├── wallet/
│   │   │   ├── WalletScreen.tsx
│   │   │   ├── SendMoneyScreen.tsx
│   │   │   └── ReceiveMoneyScreen.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionListScreen.tsx
│   │   │   └── TransactionDetailScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       └── SettingsScreen.tsx
│   ├── navigation/            # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── store/                 # State management (Redux/Zustand)
│   │   ├── authSlice.ts
│   │   ├── walletSlice.ts
│   │   ├── transactionSlice.ts
│   │   └── offlineSlice.ts
│   ├── services/              # Business logic
│   │   ├── biometric.ts       # Biometric authentication
│   │   ├── storage.ts         # Local storage
│   │   ├── notifications.ts   # Push notifications
│   │   └── offline.ts         # Offline sync
│   ├── utils/                 # Utilities
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   └── types/                 # TypeScript types
│       ├── api.ts
│       ├── models.ts
│       └── navigation.ts
├── android/                   # Android native code
├── ios/                       # iOS native code
├── App.tsx                    # Root component
├── app.json                   # App configuration
└── package.json
```

## Core Features

### 1. Authentication
```typescript
// src/api/auth.ts
import { apiClient } from './client';

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password
    });
    return response.data;
  },

  register: async (userData: RegisterData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  verify2FA: async (sessionToken: string, otp?: string, biometricData?: any) => {
    const response = await apiClient.post('/api/auth/verify-2fa', {
      sessionToken,
      otp,
      biometricData
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/api/auth/session/refresh', {
      refreshToken
    });
    return response.data;
  }
};
```

### 2. Biometric Authentication
```typescript
// src/services/biometric.ts
import ReactNativeBiometrics from 'react-native-biometrics';

export class BiometricService {
  private rnBiometrics = new ReactNativeBiometrics();

  async isAvailable(): Promise<boolean> {
    const { available } = await this.rnBiometrics.isSensorAvailable();
    return available;
  }

  async authenticate(reason: string): Promise<boolean> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: reason
      });
      return success;
    } catch (error) {
      console.error('Biometric auth failed:', error);
      return false;
    }
  }

  async createSignature(payload: string): Promise<string> {
    const { signature } = await this.rnBiometrics.createSignature({
      promptMessage: 'Authenticate transaction',
      payload
    });
    return signature;
  }
}
```

### 3. Offline Support
```typescript
// src/services/offline.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export class OfflineService {
  private queue: Transaction[] = [];
  private isOnline: boolean = true;

  constructor() {
    this.initNetworkListener();
    this.loadQueue();
  }

  private initNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline) {
        this.syncQueue();
      }
    });
  }

  async addToQueue(transaction: Transaction) {
    this.queue.push(transaction);
    await this.saveQueue();
  }

  async syncQueue() {
    if (!this.isOnline || this.queue.length === 0) return;

    const transaction = this.queue[0];
    try {
      await this.sendTransaction(transaction);
      this.queue.shift();
      await this.saveQueue();
      this.syncQueue(); // Process next
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async saveQueue() {
    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.queue));
  }

  private async loadQueue() {
    const data = await AsyncStorage.getItem('offline_queue');
    this.queue = data ? JSON.parse(data) : [];
  }
}
```

### 4. Push Notifications
```typescript
// src/services/notifications.ts
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

export class NotificationService {
  async initialize() {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      await this.registerToken(token);
    }

    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      this.showNotification(remoteMessage);
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
    });
  }

  private showNotification(message: any) {
    PushNotification.localNotification({
      title: message.notification?.title,
      message: message.notification?.body,
      data: message.data
    });
  }

  private async registerToken(token: string) {
    // Send token to backend
    await apiClient.post('/api/notifications/register', { token });
  }
}
```

### 5. QR Code Scanner
```typescript
// src/screens/wallet/ScanQRScreen.tsx
import React from 'react';
import { RNCamera } from 'react-native-camera';

export const ScanQRScreen = () => {
  const handleBarCodeRead = (event: any) => {
    const data = JSON.parse(event.data);
    // Process payment request
    navigation.navigate('ConfirmPayment', { data });
  };

  return (
    <RNCamera
      style={{ flex: 1 }}
      onBarCodeRead={handleBarCodeRead}
      barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
    />
  );
};
```

## API Client Configuration

```typescript
// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

export const apiClient = axios.create({
  baseURL: Config.API_URL || 'https://api.eazepay.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(
          `${Config.API_URL}/api/auth/session/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data;
        await AsyncStorage.setItem('access_token', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## Environment Configuration

```bash
# .env.development
API_URL=http://localhost:8000
ENABLE_BIOMETRIC=true
ENABLE_OFFLINE=true

# .env.production
API_URL=https://api.eazepay.com
ENABLE_BIOMETRIC=true
ENABLE_OFFLINE=true
```

## Setup Instructions

### 1. Initialize React Native Project
```bash
npx react-native init EazepayMobile --template react-native-template-typescript
cd EazepayMobile
```

### 2. Install Dependencies
```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# State Management
npm install @reduxjs/toolkit react-redux
# or
npm install zustand

# API & Storage
npm install axios
npm install @react-native-async-storage/async-storage

# Biometric
npm install react-native-biometrics

# Camera & QR
npm install react-native-camera
npm install react-native-qrcode-scanner

# Notifications
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-push-notification

# Network
npm install @react-native-community/netinfo

# UI Components
npm install react-native-paper
# or
npm install native-base

# Forms
npm install react-hook-form

# Environment
npm install react-native-config

# Icons
npm install react-native-vector-icons
```

### 3. Configure Firebase
1. Create Firebase project
2. Add iOS and Android apps
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Follow Firebase setup instructions

### 4. Configure Deep Linking
```json
// app.json
{
  "expo": {
    "scheme": "eazepay",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "eazepay"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "bundleIdentifier": "com.eazepay.app",
      "associatedDomains": ["applinks:eazepay.com"]
    }
  }
}
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests (Detox)
```bash
npm install --save-dev detox
detox test
```

## Build & Release

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
pod install
# Open Xcode and build
```

## App Store Submission

### iOS (App Store)
1. Create App Store Connect account
2. Create app listing
3. Upload build via Xcode
4. Submit for review

### Android (Play Store)
1. Create Google Play Console account
2. Create app listing
3. Upload APK/AAB
4. Submit for review

## Monitoring & Analytics

### Sentry (Error Tracking)
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production'
});
```

### Analytics
```typescript
import analytics from '@react-native-firebase/analytics';

await analytics().logEvent('transaction_completed', {
  amount: 1000,
  currency: 'KES'
});
```

## Next Steps

1. **Set up development environment**
2. **Create basic app structure**
3. **Implement authentication flow**
4. **Add wallet functionality**
5. **Implement biometric authentication**
6. **Add offline support**
7. **Integrate push notifications**
8. **Add QR code scanning**
9. **Test on real devices**
10. **Submit to app stores**

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase for React Native](https://rnfirebase.io/)
- [React Native Biometrics](https://github.com/SelfLender/react-native-biometrics)
