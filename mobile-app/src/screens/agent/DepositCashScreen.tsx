import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const DepositCashScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { customer } = route.params as any;

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');

  const commission = parseFloat(amount) * 0.01; // 1% commission
  const total = parseFloat(amount) || 0;

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    setStep('confirm');
  };

  const handleProcess = async () => {
    setLoading(true);
    try {
      // TODO: Call deposit API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep('success');
    } catch (error) {
      Alert.alert('Error', 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    navigation.navigate('AgentDashboard');
  };

  if (step === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Deposit Successful!</Text>
          <Text style={styles.successSubtitle}>
            KES {parseFloat(amount).toLocaleString()} deposited to {customer.name}
          </Text>

          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>Transaction Receipt</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Customer</Text>
              <Text style={styles.receiptValue}>{customer.name}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount</Text>
              <Text style={styles.receiptValue}>KES {parseFloat(amount).toLocaleString()}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Commission</Text>
              <Text style={[styles.receiptValue, styles.commissionValue]}>
                +KES {commission.toFixed(2)}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Reference</Text>
              <Text style={styles.receiptValue}>TXN-{Date.now().toString().slice(-8)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'confirm') {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Confirm Deposit</Text>
          <Text style={styles.subtitle}>Please verify the details before proceeding</Text>

          <View style={styles.confirmCard}>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Customer</Text>
              <Text style={styles.confirmValue}>{customer.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Phone</Text>
              <Text style={styles.confirmValue}>{customer.phone}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Amount</Text>
              <Text style={[styles.confirmValue, styles.amountValue]}>
                KES {parseFloat(amount).toLocaleString()}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Your Commission</Text>
              <Text style={[styles.confirmValue, styles.commissionValue]}>
                +KES {commission.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Customer will need to confirm this transaction with their PIN or biometric
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep('input')}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, loading && styles.buttonDisabled]}
            onPress={handleProcess}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Process Deposit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Deposit Cash</Text>
        <Text style={styles.subtitle}>Enter the amount to deposit</Text>

        {/* Customer Info */}
        <View style={styles.customerCard}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerAvatarText}>{customer.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerPhone}>{customer.phone}</Text>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount (KES)</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Quick Amounts */}
        <View style={styles.quickAmounts}>
          {quickAmounts.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={styles.quickButton}
              onPress={() => setAmount(amt.toString())}
            >
              <Text style={styles.quickButtonText}>{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Commission Info */}
        {amount && parseFloat(amount) > 0 && (
          <View style={styles.commissionCard}>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLabel}>Deposit Amount</Text>
              <Text style={styles.commissionAmount}>KES {parseFloat(amount).toLocaleString()}</Text>
            </View>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLabel}>Your Commission (1%)</Text>
              <Text style={[styles.commissionAmount, styles.commissionHighlight]}>
                +KES {commission.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleConfirm}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  customerAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  amountContainer: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  amountInput: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  commissionCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commissionLabel: {
    fontSize: 14,
    color: '#064e3b',
  },
  commissionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#064e3b',
  },
  commissionHighlight: {
    color: '#10b981',
  },
  confirmCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  confirmLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  amountValue: {
    fontSize: 18,
    color: '#10b981',
  },
  commissionValue: {
    color: '#10b981',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 60,
    color: '#fff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  receiptLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
