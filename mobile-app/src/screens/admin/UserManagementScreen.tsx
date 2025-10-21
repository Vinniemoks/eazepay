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

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'AGENT';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  registeredDate: string;
}

export const UserManagementScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>(
    'all'
  );

  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+254712345678',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      kycStatus: 'APPROVED',
      registeredDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+254723456789',
      role: 'CUSTOMER',
      status: 'PENDING',
      kycStatus: 'PENDING',
      registeredDate: '2024-01-20',
    },
    {
      id: '3',
      name: 'Peter Omondi',
      email: 'peter@example.com',
      phone: '+254734567890',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      kycStatus: 'APPROVED',
      registeredDate: '2024-01-18',
    },
  ];

  const filters = [
    { id: 'all', label: 'All', count: 15234 },
    { id: 'pending', label: 'Pending KYC', count: 45 },
    { id: 'active', label: 'Active', count: 14890 },
    { id: 'suspended', label: 'Suspended', count: 12 },
  ];

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

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'REJECTED':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('UserDetail', { user: item })}
    >
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{item.name.charAt(0)}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
      </View>

      <View style={styles.userMeta}>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <View
          style={[styles.kycBadge, { backgroundColor: `${getKYCStatusColor(item.kycStatus)}20` }]}
        >
          <Text style={[styles.kycText, { color: getKYCStatusColor(item.kycStatus) }]}>
            KYC: {item.kycStatus}
          </Text>
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
          placeholder="Search by name, email, or phone"
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
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive,
            ]}
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

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bulk Actions */}
      <View style={styles.bulkActions}>
        <TouchableOpacity style={styles.bulkButton}>
          <Text style={styles.bulkButtonText}>Export CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bulkButton}>
          <Text style={styles.bulkButtonText}>Bulk Actions</Text>
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
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#94a3b8',
  },
  userMeta: {
    alignItems: 'flex-end',
    gap: 6,
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
  kycBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kycText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bulkActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  bulkButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bulkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});
