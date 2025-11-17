import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { api } from '../config/api';

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export const TopUpScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) < 10) {
      Alert.alert('Error', 'Minimum top up amount is KES 10');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/mpesa/stk-push', {
        phoneNumber: phoneNumber || undefined,
        amount: parseFloat(amount),
      });

      Alert.alert(
        'Payment Initiated',
        'Please check your phone and enter your M-Pesa PIN',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Top up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="wallet-plus" size={64} color="#6366F1" />
        </View>

        <Text style={styles.label}>Quick Amounts</Text>
        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map(amt => (
            <TouchableOpacity
              key={amt}
              style={[
                styles.quickAmountButton,
                amount === amt.toString() && styles.quickAmountButtonActive,
              ]}
              onPress={() => setAmount(amt.toString())}
            >
              <Text
                style={[
                  styles.quickAmountText,
                  amount === amt.toString() && styles.quickAmountTextActive,
                ]}
              >
                {amt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Amount (KES)"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          icon="cash"
        />

        <Input
          label="Phone Number (Optional)"
          placeholder="254712345678"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          icon="phone"
        />

        <Text style={styles.note}>
          Leave phone number empty to use your registered number
        </Text>

        <Button
          title={`Top Up KES ${amount || '0'}`}
          onPress={handleTopUp}
          loading={loading}
          disabled={!amount}
          icon="check"
        />
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
  content: { padding: 16 },
  iconContainer: { alignItems: 'center', marginVertical: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 12 },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  quickAmountButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickAmountButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  quickAmountText: { fontSize: 16, fontWeight: '600', color: '#64748B' },
  quickAmountTextActive: { color: '#FFF' },
  note: { fontSize: 12, color: '#64748B', marginBottom: 16, fontStyle: 'italic' },
});
