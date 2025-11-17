import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { biometricService } from '../services/biometric';
import { api } from '../config/api';

export const BiometricPayScreen = ({ route, navigation }: any) => {
  const { merchantId, amount, currency = 'KES' } = route.params || {};
  const [scanning, setScanning] = useState(false);
  const pulseAnim = new Animated.Value(1);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleScan = async () => {
    setScanning(true);
    startPulse();

    try {
      // Verify biometric for payment
      const verified = await biometricService.verifyForPayment(amount, currency);

      if (!verified) {
        throw new Error('Biometric verification failed');
      }

      // Process payment
      const response = await api.post('/payment/biometric', {
        merchantId,
        amount,
        currency,
      });

      Alert.alert(
        'Payment Successful! ✅',
        `${currency} ${amount} paid successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert(
        'Payment Failed',
        error.response?.data?.message || error.message || 'Please try again'
      );
    } finally {
      setScanning(false);
      pulseAnim.stopAnimation();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biometric Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amount}>
            {currency} {amount?.toLocaleString() || '0'}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.scanArea,
            { transform: [{ scale: scanning ? pulseAnim : 1 }] },
          ]}
        >
          <Icon
            name="fingerprint"
            size={120}
            color={scanning ? '#6366F1' : '#CBD5E1'}
          />
        </Animated.View>

        <Text style={styles.instruction}>
          {scanning ? 'Scanning fingerprint...' : 'Place your finger on the sensor'}
        </Text>

        {!scanning && (
          <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
            <Icon name="fingerprint" size={24} color="#FFF" />
            <Text style={styles.scanButtonText}>Scan to Pay</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoBox}>
          <Icon name="shield-check" size={20} color="#10B981" />
          <Text style={styles.infoText}>
            Your biometric data is encrypted and never leaves your device
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  amountContainer: { alignItems: 'center', marginBottom: 48 },
  amountLabel: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  amount: { fontSize: 40, fontWeight: 'bold', color: '#1E293B' },
  scanArea: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instruction: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 24,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#10B981',
    marginLeft: 12,
  },
});
