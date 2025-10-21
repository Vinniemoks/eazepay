import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from './src/store/authStore';
import { notificationService } from './src/services/notifications';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { SendMoneyScreen } from './src/screens/SendMoneyScreen';

// Initialize Sentry
if (Config.SENTRY_DSN) {
  Sentry.init({
    dsn: Config.SENTRY_DSN,
    environment: Config.ENVIRONMENT || 'development',
  });
}

const Stack = createStackNavigator();
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
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
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
