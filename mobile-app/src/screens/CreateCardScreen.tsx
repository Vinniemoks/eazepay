import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useCardStore } from '../store/cardStore';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
];

const CARD_TYPES = ['VISA', 'MASTERCARD'];

export const CreateCardScreen = ({ navigation }: any) => {
  const [currency, setCurrency] = useState('USD');
  const [cardType, setCardType] = useState('VISA');
  const [amount, setAmount] = useState('');
  const { createCard, isLoading } = useCardStore();

  const handleCreate = async () => {
    if (!amount || parseFloat(amount) < 10) {
      Alert.alert('Error', 'Minimum amount is 10');
      return;
    }

    try {
      await createCard({
        currency,
        cardType,
        initialBalance: parseFloat(amount),
      });

      Alert.alert('Success', 'Virtual card created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create card');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Virtual Card</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Select Currency</Text>
        <View style={styles.optionsRow}>
          {CURRENCIES.map(curr => (
            <TouchableOpacity
              key={curr.code}
              style={[
                styles.optionCard,
                currency === curr.code && styles.optionCardActive,
              ]}
              onPress={() => setCurrency(curr.code)}
            >
              <Text style={styles.flag}>{curr.flag}</Text>
              <Text style={styles.currencyCode}>{curr.code}</Text>
              <Text style={styles.currencyName}>{curr.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Card Type</Text>
        <View style={styles.optionsRow}>
          {CARD_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.cardTypeButton,
                cardType === type && styles.cardTypeButtonActive,
              ]}
              onPress={() => setCardType(type)}
            >
              <Text
                style={[
                  styles.cardTypeText,
                  cardType === type && styles.cardTypeTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label={`Initial Balance (${currency})`}
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          icon="cash"
        />

        <View style={styles.infoBox}>
          <Icon name="information" size={20} color="#6366F1" />
          <Text style={styles.infoText}>
            Card will be created instantly and ready to use for online shopping
          </Text>
        </View>

        <Button
          title="Create Card"
          onPress={handleCreate}
          loading={isLoading}
          disabled={!amount}
          icon="credit-card-plus"
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
  label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 12 },
  optionsRow: { flexDirection: 'row', marginBottom: 24 },
  optionCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  optionCardActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  flag: { fontSize: 32, marginBottom: 8 },
  currencyCode: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  currencyName: { fontSize: 10, color: '#64748B', marginTop: 4 },
  cardTypeButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cardTypeButtonActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  cardTypeText: { fontSize: 16, fontWeight: '600', color: '#64748B' },
  cardTypeTextActive: { color: '#6366F1' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 12, color: '#6366F1', marginLeft: 8 },
});
