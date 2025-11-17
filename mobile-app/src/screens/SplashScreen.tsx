import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../store/authStore';

export const SplashScreen = ({ navigation }: any) => {
  const { token, checkAuth } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is authenticated
      await checkAuth();
      
      // Wait for splash animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate based on auth status
      if (token) {
        navigation.replace('Main');
      } else {
        navigation.replace('Auth');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      navigation.replace('Auth');
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="wallet" size={80} color="#6366F1" />
      <Text style={styles.title}>EazePay</Text>
      <Text style={styles.subtitle}>Pay with a fingerprint</Text>
      <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  loader: {
    marginTop: 48,
  },
});
