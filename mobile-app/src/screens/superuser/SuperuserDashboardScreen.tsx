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

export const SuperuserDashboardScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const systemHealth = {
    overall: 99.8,
    services: [
      { name: 'Identity Service', status: 'operational', uptime: 99.9 },
      { name: 'Wallet Service', status: 'operational', uptime: 99.8 },
      { name: 'Transaction Service', status: 'operational', uptime: 99.7 },
      { name: 'Notification Service', status: 'degraded', uptime: 98.5 },
      { name: 'Database', status: 'operational', uptime: 100 },
    ],
    apiResponseTime: 145,
    errorRate: 0.2,
    activeUsers: 1247,
  };

  const kpis = {
    totalUsers: 15234,
    growthRate: 23.5,
    totalAgents: 456,
    agentGrowth: 15.2,
    transactionVolume: 125000000,
    volumeGrowth: 18.7,
    revenue: 1250000,
    revenueGrowth: 22.3,
  };

  const alerts = [
    { id: 1, type: 'warning', message: 'Notification service experiencing delays', time: '5 min ago' },
    { id: 2, type: 'info', message: 'Database backup completed successfully', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'System update deployed', time: '2 hours ago' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'down':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'info':
        return '#3b82f6';
      default:
        return '#64748b';
    }
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
          <Text style={styles.greeting}>Superuser Dashboard</Text>
          <Text style={styles.subtitle}>System Control Center</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* System Health Overview */}
      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <Text style={styles.healthTitle}>System Health</Text>
          <View style={styles.healthBadge}>
            <Text style={styles.healthBadgeText}>{systemHealth.overall}%</Text>
          </View>
        </View>

        <View style={styles.healthMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{systemHealth.apiResponseTime}ms</Text>
            <Text style={styles.metricLabel}>API Response</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{systemHealth.errorRate}%</Text>
            <Text style={styles.metricLabel}>Error Rate</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{systemHealth.activeUsers}</Text>
            <Text style={styles.metricLabel}>Active Users</Text>
          </View>
        </View>

        <View style={styles.servicesList}>
          {systemHealth.services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <View
                style={[
                  styles.serviceStatus,
                  { backgroundColor: getStatusColor(service.status) },
                ]}
              />
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceUptime}>{service.uptime}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, styles.kpiCardPrimary]}>
          <Text style={styles.kpiIcon}>👥</Text>
          <Text style={styles.kpiValue}>{kpis.totalUsers.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>Total Users</Text>
          <Text style={styles.kpiGrowth}>↗ +{kpis.growthRate}%</Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardSuccess]}>
          <Text style={styles.kpiIcon}>🏪</Text>
          <Text style={styles.kpiValue}>{kpis.totalAgents}</Text>
          <Text style={styles.kpiLabel}>Total Agents</Text>
          <Text style={styles.kpiGrowth}>↗ +{kpis.agentGrowth}%</Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardWarning]}>
          <Text style={styles.kpiIcon}>💰</Text>
          <Text style={styles.kpiValue}>
            KES {(kpis.transactionVolume / 1000000).toFixed(1)}M
          </Text>
          <Text style={styles.kpiLabel}>Transaction Volume</Text>
          <Text style={styles.kpiGrowth}>↗ +{kpis.volumeGrowth}%</Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardInfo]}>
          <Text style={styles.kpiIcon}>💵</Text>
          <Text style={styles.kpiValue}>KES {(kpis.revenue / 1000000).toFixed(2)}M</Text>
          <Text style={styles.kpiLabel}>Revenue</Text>
          <Text style={styles.kpiGrowth}>↗ +{kpis.revenueGrowth}%</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminManagement')}
          >
            <Text style={styles.actionIcon}>👨‍💼</Text>
            <Text style={styles.actionText}>Manage Admins</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SystemConfiguration')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>System Config</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Audit Logs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>System Alerts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {alerts.map((alert) => (
          <View key={alert.id} style={styles.alertItem}>
            <View
              style={[
                styles.alertDot,
                { backgroundColor: getAlertColor(alert.type) },
              ]}
            />
            <View style={styles.alertContent}>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
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
    backgroundColor: '#0f172a',
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
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  healthCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  healthBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  healthBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  healthMetrics: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  servicesList: {
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serviceStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  serviceName: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
  },
  serviceUptime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
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
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  kpiCardSuccess: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  kpiCardWarning: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  kpiCardInfo: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  kpiIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  kpiGrowth: {
    fontSize: 12,
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
    color: '#fff',
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
  actionButton: {
    width: (width - 52) / 2,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#64748b',
  },
});
