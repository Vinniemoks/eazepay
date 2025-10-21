import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useWalletStore } from '../store/walletStore';
import { biometricService } from '../services/biometric';
import { walletApi } from '../api/wallet';

export const SendMoneyScreen = ({ navigation }: any) => {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [useBiometric, setUseBiometric] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  // Load balance on mount
  React.useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const balanceData = await walletApi.getBalance();
      setBalance(balanceData.balance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handleSend = async () => {
    if (!recipientPhone || !amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (useBiometric) {
      const success = await biometricService.authenticate('Confirm transaction');
      if (!success) {
        return;
      }
    } else if (!pin) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    setIsLoading(true);
    try {
      const response = await walletApi.sendMoney({
        recipientPhone,
        amount: amountNum,
        description,
        pin: useBiometric ? undefined : pin,
      });

      if (response.success) {
        Alert.alert(
          'Success',
          `Money sent successfully!\nReference: ${response.reference}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send money. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
      await sendMoney(recipientPhone, amountNum, description, pin);
      Alert.alert('Success', 'Money sent successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send money. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>KES {balance.toFixed(2)}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Recipient Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+254712345678"
          value={recipientPhone}
          onChangeText={setRecipientPhone}
          keyboardType="phone-pad"
          editable={!isLoading}
        />

        <Text style={styles.label}>Amount (KES)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!isLoading}
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="What's this for?"
          value={description}
          onChangeText={setDescription}
          editable={!isLoading}
        />

        {!useBiometric && (
          <>
            <Text style={styles.label}>PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              editable={!isLoading}
            />
          </>
        )}

        <TouchableOpacity
          style={styles.biometricToggle}
          onPress={() => setUseBiometric(!useBiometric)}
        >
          <Text style={styles.biometricText}>
            {useBiometric ? '✓' : '○'} Use Biometric Authentication
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Money</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceInfo: {
    backgroundColor: '#2563eb',
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  biometricToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  biometricText: {
    fontSize: 14,
    color: '#2563eb',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
