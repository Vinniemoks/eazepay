# 📱 EazePay Mobile App

> Pay with a fingerprint. Shop globally with local currency.

## 🎉 Complete Mobile Application

A full-featured React Native mobile app for the EazePay platform with biometric payments, virtual cards, and wallet management.

## ✨ Features

### 🏠 Home Dashboard
- Wallet balance overview
- Quick actions (Create Card, Scan QR, Pay, History)
- Virtual cards preview
- Real-time notifications

### 💳 Virtual Cards
- Create cards in USD, EUR, GBP
- VISA and Mastercard support
- Freeze/unfreeze cards
- View card details securely
- Transaction history per card

### 💰 Wallet Management
- View balance in multiple currencies
- Top up with M-Pesa
- Send money to contacts
- Transaction history with filters

### 🖐️ Biometric Payments
- Enroll all 10 fingers
- Pay with single fingerprint
- Bank-level security
- Sub-second verification

### 📊 Transactions
- Complete transaction history
- Filter by type (Send, Receive, Top-up, Payment)
- Detailed transaction view
- Share receipts

### ⚙️ Settings & Profile
- User profile management
- Biometric settings
- Security options
- Notification preferences
- Help & support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

```bash
# Navigate to mobile app
cd mobile-app

# Install dependencies
npm install

# iOS only - Install pods
cd ios && pod install && cd ..

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

### Optional Dependencies

```bash
# For card gradients
npm install react-native-linear-gradient

# For QR scanning
npm install react-native-camera

# For biometric authentication
npm install react-native-biometrics
```

## 📱 Screens

### Authentication
- Splash Screen
- Login
- Register
- Onboarding

### Main App
- **Home** - Dashboard with balance and quick actions
- **Wallet** - Balance, top-up, send money
- **Cards List** - All virtual cards
- **Create Card** - New card creation
- **Card Details** - View and manage card
- **Transactions** - Transaction history
- **Transaction Details** - Detailed view
- **Profile** - User information and stats
- **Settings** - App configuration
- **Help** - FAQ and support
- **Notifications** - All notifications
- **QR Scanner** - Scan to pay
- **Biometric Pay** - Fingerprint payment
- **Biometric Enroll** - Enroll fingerprints
- **Top Up** - M-Pesa wallet top-up
- **Send Money** - Transfer funds

## 🎨 Components

### Reusable Components
- **Button** - Multi-variant button with loading states
- **Input** - Text input with icons and validation
- **Card** - Beautiful virtual card display
- **TransactionItem** - Transaction list item

## 🗺️ Navigation Structure

```
App
├── Splash Screen
├── Auth Stack (Login, Register)
└── Main Tabs
    ├── Home Tab
    │   ├── Home
    │   ├── Cards List
    │   ├── Create Card
    │   ├── Card Details
    │   ├── Top Up
    │   ├── Send Money
    │   ├── Transactions
    │   ├── Transaction Details
    │   ├── QR Scanner
    │   ├── Biometric Pay
    │   └── Notifications
    ├── Wallet Tab
    │   ├── Wallet
    │   ├── Top Up
    │   ├── Send Money
    │   └── Transactions
    ├── Transactions Tab
    └── Profile Tab
        ├── Profile
        ├── Settings
        ├── Help
        ├── Biometric Enroll
        └── Notifications
```

## 🔧 Configuration

### API Configuration
Edit `src/config/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000';
```

### Theme Configuration
Edit `src/config/theme.ts`:
```typescript
export const theme = {
  colors: {
    primary: '#6366F1',
    success: '#10B981',
    // ...
  }
};
```

## 📦 State Management

Using Zustand for state management:

- **authStore** - Authentication state
- **walletStore** - Wallet balance and transactions
- **cardStore** - Virtual cards management

## 🎨 Design System

### Colors
- Primary: #6366F1 (Indigo)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Danger: #EF4444 (Red)
- Background: #F8FAFC
- Surface: #FFFFFF

### Typography
- Headers: 18-32px, Bold
- Body: 14-16px, Regular
- Captions: 12px, Regular

### Spacing
- Small: 8px
- Medium: 16px
- Large: 24px
- XL: 32px

## 🔒 Security

- Biometric data encrypted locally
- JWT token authentication
- Secure API communication
- PIN/Password protection
- Session management

## 📱 Platform Support

- ✅ iOS 12+
- ✅ Android 6.0+

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📚 Documentation

- [Quick Reference](./QUICK_REFERENCE.md) - Common patterns and tips
- [Screens Guide](./SCREENS_ADDED.md) - All screens documentation
- [Enhancement Guide](./MOBILE_APP_ENHANCEMENT_COMPLETE.md) - Complete feature list

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npx react-native start --reset-cache
```

### iOS Build Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
```

## 📈 Performance

- Optimized images and assets
- Lazy loading for screens
- Efficient state management
- Minimal re-renders

## 🎯 Roadmap

- [ ] Push notifications
- [ ] Offline mode
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Analytics integration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

- Email: support@eazepay.com
- Phone: +254 700 000 000
- WhatsApp: +254 700 000 000

## 🎉 Credits

Built with ❤️ by the EazePay team

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: ✅ Production Ready
