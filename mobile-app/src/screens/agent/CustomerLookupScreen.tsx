import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  status: 'active' | 'suspended';
}

export const CustomerLookupScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState('');

  const recentCustomers: Customer[] = [
    { id: '1', name: 'John Doe', phone: '+254712345678', balance: 5000, status: 'active' },
    { id: '2', name: 'Jane Smith', phone: '+254723456789', balance: 12000, status: 'active' },
    { id: '3', name: 'Peter Omondi', phone: '+254734567890', balance: 3500, status: 'active' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter phone number or customer ID');
      return;
    }

    setLoading(true);
    setError('');
    setCustomer(null);

    try {
      // TODO: Call customer lookup API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock customer data
      setCustomer({
        id: 'CUST-12345',
        name: 'John Doe',
        phone: searchQuery,
        balance: 15000,
        status: 'active',
      });
    } catch (err) {
      setError('Customer not found. Please check the phone number or ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (cust: Customer) => {
    setCustomer(cust);
    setSearchQuery(cust.phone);
  };

  const handleDeposit = () => {
    if (customer) {
      navigation.navigate('DepositCash', { customer });
    }
  };

  const handleWithdraw = () => {
    if (customer) {
      navigation.navigate('WithdrawCash', { customer });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Find Customer</Text>
      <Text style={styles.subtitle}>Search by phone number or customer ID</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter phone number or ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Customer Details */}
      {customer && (
        <View style={styles.customerCard}>
          <View style={styles.customerHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customer.name.charAt(0)}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerPhone}>{customer.phone}</Text>
              <Text style={styles.customerId}>ID: {customer.id}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                customer.status === 'active' ? styles.statusActive : styles.statusSuspended,
              ]}
            >
              <Text style={styles.statusText}>
                {customer.status === 'active' ? 'Active' : 'Suspended'}
              </Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>KES {customer.balance.toLocaleString()}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.depositButton} onPress={handleDeposit}>
              <Text style={styles.depositButtonText}>💵 Deposit Cash</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
              <Text style={styles.withdrawButtonText}>💸 Withdraw Cash</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recent Customers */}
      {!customer && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Customers</Text>
          {recentCustomers.map((cust) => (
            <TouchableOpacity
              key={cust.id}
              style={styles.recentItem}
              onPress={() => handleSelectCustomer(cust)}
            >
              <View style={styles.recentAvatar}>
                <Text style={styles.recentAvatarText}>{cust.name.charAt(0)}</Text>
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{cust.name}</Text>
                <Text style={styles.recentPhone}>{cust.phone}</Text>
              </View>
              <Text style={styles.recentArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* QR Scanner */}
      <TouchableOpacity style={styles.qrButton}>
        <Text style={styles.qrIcon}>📷</Text>
        <Text style={styles.qrText}>Scan Customer QR Code</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
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
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  searchButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  customerCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  customerId: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusSuspended: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  balanceContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  depositButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  depositButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recentSection: {
    marginBottom: 24,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  recentPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  recentArrow: {
    fontSize: 24,
    color: '#cbd5e1',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#c7d2fe',
    borderStyle: 'dashed',
  },
  qrIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  qrText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
});
