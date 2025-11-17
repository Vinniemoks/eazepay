import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface TransactionItemProps {
  type: 'SEND' | 'RECEIVE' | 'TOPUP' | 'PAYMENT' | 'CARD_PURCHASE';
  amount: number;
  currency: string;
  description: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  type,
  amount,
  currency,
  description,
  timestamp,
  status,
  onPress,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'SEND':
        return 'arrow-up';
      case 'RECEIVE':
        return 'arrow-down';
      case 'TOPUP':
        return 'plus';
      case 'PAYMENT':
        return 'fingerprint';
      case 'CARD_PURCHASE':
        return 'credit-card';
      default:
        return 'swap-horizontal';
    }
  };

  const getIconColor = () => {
    if (status === 'FAILED') return '#EF4444';
    switch (type) {
      case 'SEND':
      case 'PAYMENT':
      case 'CARD_PURCHASE':
        return '#EF4444';
      case 'RECEIVE':
      case 'TOPUP':
        return '#10B981';
      default:
        return '#6366F1';
    }
  };

  const getAmountPrefix = () => {
    switch (type) {
      case 'SEND':
      case 'PAYMENT':
      case 'CARD_PURCHASE':
        return '-';
      case 'RECEIVE':
      case 'TOPUP':
        return '+';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
        <Icon name={getIcon()} size={24} color={getIconColor()} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: getIconColor() }]}>
          {getAmountPrefix()}{currency} {amount.toLocaleString()}
        </Text>
        {status === 'PENDING' && (
          <Text style={styles.statusPending}>Pending</Text>
        )}
        {status === 'FAILED' && (
          <Text style={styles.statusFailed}>Failed</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginVertical: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusPending: {
    fontSize: 12,
    color: '#F59E0B',
  },
  statusFailed: {
    fontSize: 12,
    color: '#EF4444',
  },
});
