# 📱 EazePay Mobile App - Quick Reference

## 🚀 Quick Start

```bash
cd mobile-app
npm install
npx react-native run-ios    # or run-android
```

## 📂 File Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # All app screens
├── navigation/         # Navigation setup
├── store/             # State management (Zustand)
└── config/            # API & theme config
```

## 🎨 Components

### Button
```tsx
import { Button } from '../components/Button';

<Button 
  title="Click Me"
  onPress={handlePress}
  variant="primary"  // primary | secondary | outline | danger
  icon="check"
  loading={isLoading}
/>
```

### Input
```tsx
import { Input } from '../components/Input';

<Input
  label="Phone Number"
  value={phone}
  onChangeText={setPhone}
  icon="phone"
  keyboardType="phone-pad"
  error={error}
/>
```

### Card
```tsx
import { Card } from '../components/Card';

<Card
  cardNumber="1234567890123456"
  cardHolder="John Doe"
  expiryDate="12/25"
  currency="USD"
  balance={1000}
  cardType="VISA"
  status="ACTIVE"
/>
```

## 🗺️ Navigation

### Navigate to Screen
```tsx
navigation.navigate('ScreenName', { param: value });
```

### Go Back
```tsx
navigation.goBack();
```

### Bottom Tabs
- Home
- Wallet
- Transactions
- Profile

## 📱 Screens

### Home Stack
- HomeMain
- CreateCard
- CardDetails
- TopUp
- SendMoney
- Transactions
- TransactionDetails
- QRScanner
- Notifications

### Wallet Stack
- WalletMain
- TopUp
- SendMoney
- Transactions

### Profile Stack
- ProfileMain
- Settings
- Help
- BiometricEnroll
- Notifications

## 🎨 Theme Colors

```tsx
Primary: #6366F1
Success: #10B981
Warning: #F59E0B
Danger: #EF4444
Background: #F8FAFC
Surface: #FFFFFF
Text: #1E293B
TextSecondary: #64748B
```

## 🔧 API Usage

```tsx
import { api } from '../config/api';

// GET request
const response = await api.get('/endpoint');

// POST request
const response = await api.post('/endpoint', { data });

// With auth token (automatic)
// Token is added from authStore
```

## 📦 State Management

### Auth Store
```tsx
import { useAuthStore } from '../store/authStore';

const { user, token, login, logout } = useAuthStore();
```

### Wallet Store
```tsx
import { useWalletStore } from '../store/walletStore';

const { balance, currency, fetchBalance } = useWalletStore();
```

### Card Store
```tsx
import { useCardStore } from '../store/cardStore';

const { cards, createCard, fetchCards } = useCardStore();
```

## 🎯 Common Patterns

### Loading State
```tsx
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await api.post('/endpoint');
  } catch (error) {
    Alert.alert('Error', 'Something went wrong');
  } finally {
    setLoading(false);
  }
};
```

### Pull to Refresh
```tsx
<ScrollView
  refreshControl={
    <RefreshControl 
      refreshing={loading} 
      onRefresh={fetchData} 
    />
  }
>
```

### Alert Confirmation
```tsx
Alert.alert(
  'Confirm',
  'Are you sure?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'OK', onPress: handleConfirm }
  ]
);
```

## 🔍 Icons

Using `react-native-vector-icons/MaterialCommunityIcons`

Common icons:
- home
- wallet
- credit-card
- send
- history
- account
- settings
- help-circle
- bell
- fingerprint
- qrcode-scan

## 📱 Screen Templates

### Basic Screen
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MyScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text>My Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
```

### Screen with Header
```tsx
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Icon name="arrow-left" size={24} color="#1E293B" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Title</Text>
  <View style={{ width: 24 }} />
</View>
```

## 🎨 Common Styles

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
```

## 🔥 Tips

1. **Always handle errors** - Use try/catch with Alert
2. **Show loading states** - Use loading prop on buttons
3. **Validate inputs** - Check before API calls
4. **Use TypeScript** - Add types for better DX
5. **Test on devices** - Simulator ≠ Real device
6. **Pull to refresh** - Users expect it
7. **Empty states** - Show when no data
8. **Consistent spacing** - Use 8px increments

## 📚 Resources

- [React Native Docs](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vector Icons](https://oblador.github.io/react-native-vector-icons/)

## 🐛 Common Issues

### Metro bundler issues
```bash
npx react-native start --reset-cache
```

### iOS build issues
```bash
cd ios && pod install && cd ..
```

### Android build issues
```bash
cd android && ./gradlew clean && cd ..
```

## 🎉 Quick Commands

```bash
# Start metro
npm start

# Run iOS
npm run ios

# Run Android
npm run android

# Clear cache
npm start -- --reset-cache

# Install pods (iOS)
cd ios && pod install

# Clean Android
cd android && ./gradlew clean
```

---

**Need help?** Check the full documentation in `MOBILE_APP_ENHANCEMENT_COMPLETE.md`
