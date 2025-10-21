import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const AgentDashboardScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [floatBalance, setFloatBalance] = useState(250000);
  const [todayStats, setTodayStats] = useState({
    transactionCount: 47,
    transactionValue: 125000,
    commissionEarned: 3750,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch latest data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.agentId}>Agent ID: AG-12345</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Float Balance Card */}
      <View style={styles.floatCard}>
        <View style={styles.floatHeader}>
          <Text style={styles.floatLabel}>Float Balance</Text>
          {floatBalance < 100000 && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>⚠️ Low</Text>
            </View>
          )}
        </View>
        <Text style={styles.floatAmount}>{formatCurrency(floatBalance)}</Text>
        <TouchableOpacity
          style={styles.topUpButton}
          onPress={() => navigation.navigate('FloatTopUp')}
        >
          <Text style={styles.topUpButtonText}>Request Top-Up</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryValue}>{todayStats.transactionCount}</Text>
            <Text style={styles.summaryLabel}>Transactions</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>💰</Text>
            <Text style={styles.summaryValue}>{formatCurrency(todayStats.transactionValue)}</Text>
            <Text style={styles.summaryLabel}>Total Value</Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardHighlight]}>
            <Text style={styles.summaryIcon}>💵</Text>
            <Text style={styles.summaryValue}>{formatCurrency(todayStats.commissionEarned)}</Text>
            <Text style={styles.summaryLabel}>Commission</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CustomerLookup')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Find Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('DepositCash')}
          >
            <Text style={styles.actionIcon}>💵</Text>
            <Text style={styles.actionText}>Deposit Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('WithdrawCash')}
          >
            <Text style={styles.actionIcon}>💸</Text>
            <Text style={styles.actionText}>Withdraw Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FloatManagement')}
          >
            <Text style={styles.actionIcon}>🏦</Text>
            <Text style={styles.actionText}>Float</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Commission This Month */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Commission This Month</Text>
        <View style={styles.commissionCard}>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>This Week</Text>
            <Text style={styles.commissionValue}>{formatCurrency(12500)}</Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>This Month</Text>
            <Text style={[styles.commissionValue, styles.commissionHighlight]}>
              {formatCurrency(45000)}
            </Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Last Month</Text>
            <Text style={styles.commissionValue}>{formatCurrency(38000)}</Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AgentTransactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Text style={styles.transactionIconText}>💵</Text>
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>Deposit - John Doe</Text>
              <Text style={styles.transactionTime}>2 hours ago</Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={styles.transactionValue}>+KES 5,000</Text>
              <Text style={styles.transactionCommission}>+KES 50</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  agentId: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  floatCard: {
    backgroundColor: '#667eea',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  floatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  floatLabel: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  warningBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  floatAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  topUpButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  topUpButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryCardHighlight: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  commissionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  commissionLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  commissionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  commissionHighlight: {
    color: '#10b981',
    fontSize: 18,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 2,
  },
  transactionCommission: {
    fontSize: 12,
    color: '#64748b',
  },
});
