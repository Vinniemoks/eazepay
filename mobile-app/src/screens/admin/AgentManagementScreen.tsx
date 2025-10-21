import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Agent {
  id: string;
  businessName: string;
  ownerName: string;
  location: string;
  phone: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  performance: number;
  commission: number;
  registeredDate: string;
}

export const AgentManagementScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>(
    'all'
  );

  const agents: Agent[] = [
    {
      id: 'AG-001',
      businessName: 'Peter\'s Shop',
      ownerName: 'Peter Omondi',
      location: 'Nairobi, Westlands',
      phone: '+254712345678',
      status: 'ACTIVE',
      performance: 4.8,
      commission: 1.5,
      registeredDate: '2024-01-10',
    },
    {
      id: 'AG-002',
      businessName: 'Mary\'s Store',
      ownerName: 'Mary Wanjiku',
      location: 'Mombasa, CBD',
      phone: '+254723456789',
      status: 'PENDING',
      performance: 0,
      commission: 1.0,
      registeredDate: '2024-01-20',
    },
    {
      id: 'AG-003',
      businessName: 'John\'s Mart',
      ownerName: 'John Kamau',
      location: 'Kisumu, Town',
      phone: '+254734567890',
      status: 'ACTIVE',
      performance: 4.5,
      commission: 1.5,
      registeredDate: '2024-01-15',
    },
  ];

  const filters = [
    { id: 'all', label: 'All Agents', count: 456 },
    { id: 'pending', label: 'Pending', count: 23 },
    { id: 'active', label: 'Active', count: 420 },
    { id: 'suspended', label: 'Suspended', count: 13 },
  ];

  const handleApprove = (agent: Agent) => {
    Alert.alert('Approve Agent', `Approve ${agent.businessName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          // TODO: Call approve agent API
          Alert.alert('Success', 'Agent approved successfully');
        },
      },
    ]);
  };

  const handleReject = (agent: Agent) => {
    Alert.alert('Reject Agent', `Reject ${agent.businessName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          // TODO: Call reject agent API
          Alert.alert('Success', 'Agent application rejected');
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'SUSPENDED':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const renderAgent = ({ item }: { item: Agent }) => (
    <TouchableOpacity
      style={styles.agentCard}
      onPress={() => navigation.navigate('AgentDetail', { agent: item })}
    >
      <View style={styles.agentHeader}>
        <View style={styles.agentIcon}>
          <Text style={styles.agentIconText}>🏪</Text>
        </View>
        <View style={styles.agentInfo}>
          <Text style={styles.agentName}>{item.businessName}</Text>
          <Text style={styles.agentOwner}>{item.ownerName}</Text>
          <Text style={styles.agentLocation}>📍 {item.location}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.agentStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Agent ID</Text>
          <Text style={styles.statValue}>{item.id}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Performance</Text>
          <Text style={styles.statValue}>
            {item.performance > 0 ? `⭐ ${item.performance}` : 'N/A'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Commission</Text>
          <Text style={styles.statValue}>{item.commission}%</Text>
        </View>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(item)}
          >
            <Text style={styles.approveButtonText}>✓ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(item)}
          >
            <Text style={styles.rejectButtonText}>✗ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID, or location"
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

      {/* Agents List */}
      <FlatList
        data={agents}
        renderItem={renderAgent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  agentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  agentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  agentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentIconText: {
    fontSize: 24,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  agentOwner: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  agentLocation: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  agentStats: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  rejectButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
