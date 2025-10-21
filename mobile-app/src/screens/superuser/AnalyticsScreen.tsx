import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export const AnalyticsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const analytics = {
    userGrowth: {
      current: 15234,
      previous: 12456,
      change: 22.3,
    },
    transactionVolume: {
      current: 125000000,
      previous: 105000000,
      change: 19.0,
    },
    revenue: {
      current: 1250000,
      previous: 1020000,
      change: 22.5,
    },
    activeUsers: {
      current: 8456,
      previous: 7123,
      change: 18.7,
    },
  };

  const topAgents = [
    { id: 1, name: 'Peter\'s Shop', transactions: 1234, revenue: 123400 },
    { id: 2, name: 'Mary\'s Store', transactions: 987, revenue: 98700 },
    { id: 3, name: 'John\'s Mart', transactions: 856, revenue: 85600 },
    { id: 4, name: 'Grace Supermarket', transactions: 745, revenue: 74500 },
    { id: 5, name: 'David\'s Kiosk', transactions: 623, revenue: 62300 },
  ];

  const transactionBreakdown = [
    { type: 'Send Money', count: 45234, percentage: 45 },
    { type: 'Deposit', count: 28456, percentage: 28 },
    { type: 'Withdrawal', count: 18234, percentage: 18 },
    { type: 'Bill Payment', count: 8976, percentage: 9 },
  ];

  const periods = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' },
  ];

  const formatCurrency = (amount: number) => {
    return `KES ${(amount / 1000000).toFixed(2)}M`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.id as any)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.id && styles.periodButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>User Growth</Text>
          <Text style={styles.kpiValue}>{analytics.userGrowth.current.toLocaleString()}</Text>
          <Text style={[styles.kpiChange, styles.kpiChangePositive]}>
            {formatChange(analytics.userGrowth.change)}
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Transaction Volume</Text>
          <Text style={styles.kpiValue}>{formatCurrency(analytics.transactionVolume.current)}</Text>
          <Text style={[styles.kpiChange, styles.kpiChangePositive]}>
            {formatChange(analytics.transactionVolume.change)}
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Revenue</Text>
          <Text style={styles.kpiValue}>{formatCurrency(analytics.revenue.current)}</Text>
          <Text style={[styles.kpiChange, styles.kpiChangePositive]}>
            {formatChange(analytics.revenue.change)}
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Active Users</Text>
          <Text style={styles.kpiValue}>{analytics.activeUsers.current.toLocaleString()}</Text>
          <Text style={[styles.kpiChange, styles.kpiChangePositive]}>
            {formatChange(analytics.activeUsers.change)}
          </Text>
        </View>
      </View>

      {/* Charts Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Growth Trend</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartIcon}>📈</Text>
            <Text style={styles.chartText}>Line chart visualization</Text>
            <Text style={styles.chartSubtext}>Showing user growth over time</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Volume</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartIcon}>📊</Text>
            <Text style={styles.chartText}>Bar chart visualization</Text>
            <Text style={styles.chartSubtext}>Daily transaction volumes</Text>
          </View>
        </View>
      </View>

      {/* Transaction Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Breakdown</Text>
        <View style={styles.breakdownCard}>
          {transactionBreakdown.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownType}>{item.type}</Text>
                <Text style={styles.breakdownCount}>{item.count.toLocaleString()} txns</Text>
              </View>
              <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, { width: `${item.percentage}%` }]} />
              </View>
              <Text style={styles.breakdownPercentage}>{item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Agents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Performing Agents</Text>
        <View style={styles.agentsCard}>
          {topAgents.map((agent, index) => (
            <View key={agent.id} style={styles.agentItem}>
              <View style={styles.agentRank}>
                <Text style={styles.agentRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{agent.name}</Text>
                <Text style={styles.agentStats}>
                  {agent.transactions} txns • KES {agent.revenue.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Export Button */}
      <TouchableOpacity style={styles.exportButton}>
        <Text style={styles.exportButtonText}>📥 Export Full Report</Text>
      </TouchableOpacity>
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
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  periodButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    width: (width - 52) / 2,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  kpiChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  kpiChangePositive: {
    color: '#10b981',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  chartText: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 4,
  },
  chartSubtext: {
    fontSize: 13,
    color: '#64748b',
  },
  breakdownCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  breakdownItem: {
    marginBottom: 20,
  },
  breakdownInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  breakdownCount: {
    fontSize: 13,
    color: '#94a3b8',
  },
  breakdownBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  breakdownPercentage: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
  agentsCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  agentRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  agentStats: {
    fontSize: 12,
    color: '#94a3b8',
  },
  exportButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
