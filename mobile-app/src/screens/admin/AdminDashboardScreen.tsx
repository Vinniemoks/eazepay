import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const kpis = {
    totalUsers: 15234,
    newToday: 127,
    activeAgents: 456,
    pendingApproval: 23,
    transactionVolume: 12500000,
    volumeChange: 15.3,
    systemHealth: 99.8,
  };

  const pendingActions = [
    { id: 1, type: 'KYC Verification', count: 45, icon: '📋' },
    { id: 2, type: 'Agent Applications', count: 23, icon: '🏪' },
    { id: 3, type: 'Access Requests', count: 12, icon: '🔐' },
    { id: 4, type: 'Reported Issues', count: 8, icon: '⚠️' },
  ];

  const recentActivity = [
    { id: 1, action: 'New user registered', user: 'John Doe', time: '2 min ago' },
    { id: 2, action: 'Large transaction flagged', user: 'Jane Smith', time: '15 min ago' },
    { id: 3, action: 'Agent approved', user: 'Peter\'s Shop', time: '1 hour ago' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${(amount / 1000000).toFixed(1)}M`;
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
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>System Overview</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>88</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, styles.kpiCardPrimary]}>
          <Text style={styles.kpiIcon}>👥</Text>
          <Text style={styles.kpiValue}>{kpis.totalUsers.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>Total Users</Text>
          <Text style={styles.kpiChange}>+{kpis.newToday} today</Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardSuccess]}>
          <Text style={styles.kpiIcon}>🏪</Text>
          <Text style={styles.kpiValue}>{kpis.activeAgents}</Text>
          <Text style={styles.kpiLabel}>Active Agents</Text>
          <Text style={styles.kpiChange}>{kpis.pendingApproval} pending</Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardWarning]}>
          <Text style={styles.kpiIcon}>💰</Text>
          <Text style={styles.kpiValue}>{formatCurrency(kpis.transactionVolume)}</Text>
          <Text style={styles.kpiLabel}>Transaction Volume</Text>
          <Text style={styles.kpiChange}>+{kpis.volumeChange}% today</Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardInfo]}>
          <Text style={styles.kpiIcon}>⚡</Text>
          <Text style={styles.kpiValue}>{kpis.systemHealth}%</Text>
          <Text style={styles.kpiLabel}>System Health</Text>
          <Text style={styles.kpiChange}>All systems operational</Text>
        </View>
      </View>

      {/* Pending Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Actions</Text>
        <View style={styles.actionsGrid}>
          {pendingActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => {
                if (action.type === 'KYC Verification') navigation.navigate('UserManagement');
                if (action.type === 'Agent Applications') navigation.navigate('AgentManagement');
              }}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionCount}>{action.count}</Text>
              <Text style={styles.actionType}>{action.type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <Text style={styles.quickActionIcon}>👥</Text>
            <Text style={styles.quickActionText}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AgentManagement')}
          >
            <Text style={styles.quickActionIcon}>🏪</Text>
            <Text style={styles.quickActionText}>Agents</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('TransactionMonitoring')}
          >
            <Text style={styles.quickActionIcon}>💳</Text>
            <Text style={styles.quickActionText}>Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Charts Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Growth (Last 7 Days)</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartIcon}>📈</Text>
            <Text style={styles.chartText}>Chart visualization</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityAction}>{activity.action}</Text>
              <Text style={styles.activityUser}>{activity.user}</Text>
            </View>
            <Text style={styles.activityTime}>{activity.time}</Text>
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
  subtitle: {
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
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  kpiCardPrimary: {
    backgroundColor: '#f0f4ff',
    borderColor: '#c7d2fe',
  },
  kpiCardSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  kpiCardWarning: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  kpiCardInfo: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  kpiIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  kpiChange: {
    fontSize: 11,
    color: '#10b981',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
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
  actionCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 4,
  },
  actionType: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  chartCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chartPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  chartText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 12,
    color: '#64748b',
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
