import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Transaction {
  id: string;
  type: 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAWAL';
  from: string;
  to: string;
  amount: number;
  fee: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  flagged: boolean;
  timestamp: string;
}

export const TransactionMonitoringScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'flagged' | 'pending' | 'failed'>(
    'all'
  );

  const transactions: Transaction[] = [
    {
      id: 'TXN-001',
      type: 'SEND',
      from: 'John Doe',
      to: 'Jane Smith',
      amount: 50000,
      fee: 50,
      status: 'COMPLETED',
      flagged: true,
      timestamp: '2024-01-20 14:30',
    },
    {
      id: 'TXN-002',
      type: 'DEPOSIT',
      from: 'Agent Shop',
      to: 'Peter Omondi',
      amount: 10000,
      fee: 100,
      status: 'COMPLETED',
      flagged: false,
      timestamp: '2024-01-20 14:25',
    },
    {
      id: 'TXN-003',
      type: 'WITHDRAWAL',
      from: 'Mary Wanjiku',
      to: 'Agent Store',
      amount: 5000,
      fee: 50,
      status: 'PENDING',
      flagged: false,
      timestamp: '2024-01-20 14:20',
    },
  ];

  const filters = [
    { id: 'all', label: 'All', count: 12500 },
    { id: 'flagged', label: 'Flagged', count: 23 },
    { id: 'pending', label: 'Pending', count: 156 },
    { id: 'failed', label: 'Failed', count: 12 },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SEND':
        return '#ef4444';
      case 'RECEIVE':
        return '#10b981';
      case 'DEPOSIT':
        return '#3b82f6';
      case 'WITHDRAWAL':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'FAILED':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[styles.transactionCard, item.flagged && styles.transactionCardFlagged]}
      onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
    >
      {item.flagged && (
        <View style={styles.flaggedBadge}>
          <Text style={styles.flaggedText}>⚠️ Flagged</Text>
        </View>
      )}

      <View style={styles.transactionHeader}>
        <View style={[styles.typeIcon, { backgroundColor: `${getTypeColor(item.type)}20` }]}>
          <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
            {item.type.charAt(0)}
          </Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionId}>{item.id}</Text>
          <Text style={styles.transactionType}>{item.type}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>From:</Text>
          <Text style={styles.detailValue}>{item.from}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>To:</Text>
          <Text style={styles.detailValue}>{item.to}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.amountValue}>KES {item.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fee:</Text>
          <Text style={styles.detailValue}>KES {item.fee}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{item.timestamp}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, user, or amount"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterChip, selectedFilter === filter.id && styles.filterChipActive]}
            onPress={() => setSelectedFilter(filter.id as any)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter.id && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
            <View
              style={[
                styles.filterCount,
                selectedFilter === filter.id && styles.filterCountActive,
              ]}
            >
              <Text
                style={[
                  styles.filterCountText,
                  selectedFilter === filter.id && styles.filterCountTextActive,
                ]}
              >
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>KES 12.5M</Text>
          <Text style={styles.statLabel}>Today's Volume</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>98.5%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Export Button */}
      <View style={styles.exportContainer}>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📊 Export Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterCount: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountActive: {
    backgroundColor: '#fff',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterCountTextActive: {
    color: '#667eea',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  transactionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  transactionCardFlagged: {
    borderColor: '#fbbf24',
    borderWidth: 2,
  },
  flaggedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flaggedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transactionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  exportContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  exportButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
