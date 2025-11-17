import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const TransactionDetailsScreen = ({ route, navigation }: any) => {
  const { transaction } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transaction Receipt\n\nAmount: ${transaction.currency} ${transaction.amount}\nType: ${transaction.type}\nDate: ${transaction.timestamp}\nReference: ${transaction.reference}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'COMPLETED':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'FAILED':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity onPress={handleShare}>
          <Icon name="share-variant" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor()}20` },
            ]}
          >
            <Icon
              name={
                transaction.status === 'COMPLETED'
                  ? 'check-circle'
                  : transaction.status === 'PENDING'
                  ? 'clock'
                  : 'alert-circle'
              }
              size={48}
              color={getStatusColor()}
            />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {transaction.status}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>
            {transaction.currency} {transaction.amount.toLocaleString()}
          </Text>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <DetailRow label="Transaction Type" value={transaction.type} />
          <DetailRow label="Reference" value={transaction.reference} />
          <DetailRow label="Date & Time" value={transaction.timestamp} />
          {transaction.recipient && (
            <DetailRow label="Recipient" value={transaction.recipient} />
          )}
          {transaction.sender && (
            <DetailRow label="Sender" value={transaction.sender} />
          )}
          {transaction.description && (
            <DetailRow label="Description" value={transaction.description} />
          )}
          {transaction.fee && (
            <DetailRow
              label="Transaction Fee"
              value={`${transaction.currency} ${transaction.fee}`}
            />
          )}
        </View>

        {/* Actions */}
        {transaction.status === 'COMPLETED' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="download" size={20} color="#6366F1" />
              <Text style={styles.actionText}>Download Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="help-circle" size={20} color="#6366F1" />
              <Text style={styles.actionText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  content: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  statusBadge: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  actions: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8,
  },
});
