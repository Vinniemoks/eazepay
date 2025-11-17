import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

interface CardProps {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  currency: string;
  balance: number;
  cardType: 'VISA' | 'MASTERCARD';
  status: 'ACTIVE' | 'FROZEN' | 'BLOCKED';
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  cardNumber,
  cardHolder,
  expiryDate,
  currency,
  balance,
  cardType,
  status,
  onPress,
}) => {
  const gradientColors =
    status === 'ACTIVE'
      ? ['#6366F1', '#8B5CF6']
      : status === 'FROZEN'
      ? ['#64748B', '#475569']
      : ['#EF4444', '#DC2626'];

  const maskedNumber = `**** **** **** ${cardNumber.slice(-4)}`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient colors={gradientColors} style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.cardType}>{cardType}</Text>
          <Icon name="contactless-payment" size={24} color="#FFF" />
        </View>

        <View style={styles.body}>
          <Text style={styles.cardNumber}>{maskedNumber}</Text>
          <Text style={styles.cardHolder}>{cardHolder.toUpperCase()}</Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.label}>VALID THRU</Text>
            <Text style={styles.expiry}>{expiryDate}</Text>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.label}>BALANCE</Text>
            <Text style={styles.balance}>
              {currency} {balance.toLocaleString()}
            </Text>
          </View>
        </View>

        {status !== 'ACTIVE' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    height: 200,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 12,
  },
  cardHolder: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginBottom: 4,
  },
  expiry: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
