import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from './src/store/authStore';
import { notificationService } from './src/services/notifications';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import type { RootStackParamList } from './src/types/navigation';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { SendMoneyScreen } from './src/screens/SendMoneyScreen';
import {
  WelcomeScreen,
  GetStartedScreen,
  RegisterScreen,
  VerificationScreen,
  KYCUploadScreen,
  PendingVerificationScreen,
} from './src/screens/customer';

// Initialize Sentry
if (Config.SENTRY_DSN) {
  Sentry.init({
    dsn: Config.SENTRY_DSN,
    environment: Config.ENVIRONMENT || 'development',
  });
}

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Wallet" component={WalletScreen} />
      {/* Add more tabs here */}
    </Tab.Navigator>
  );
}

function App() {
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
    notificationService.initialize();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GetStarted"
              component={GetStartedScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
            <Stack.Screen
              name="Verification"
              component={VerificationScreen}
              options={{ title: 'Verify Phone' }}
            />
            <Stack.Screen
              name="KYCUpload"
              component={KYCUploadScreen}
              options={{ title: 'Upload Documents' }}
            />
            <Stack.Screen
              name="PendingVerification"
              component={PendingVerificationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Sentry.wrap(App);
