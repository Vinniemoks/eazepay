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

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYEE';
  department: string;
  status: 'ACTIVE' | 'SUSPENDED';
  permissions: string[];
  lastActive: string;
}

export const AdminManagementScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const admins: Admin[] = [
    {
      id: 'ADM-001',
      name: 'Sarah Johnson',
      email: 'sarah@eazepay.com',
      role: 'MANAGER',
      department: 'Operations',
      status: 'ACTIVE',
      permissions: ['user_management', 'agent_management', 'transaction_monitoring'],
      lastActive: '2 hours ago',
    },
    {
      id: 'ADM-002',
      name: 'Michael Chen',
      email: 'michael@eazepay.com',
      role: 'EMPLOYEE',
      department: 'Customer Support',
      status: 'ACTIVE',
      permissions: ['user_management', 'kyc_verification'],
      lastActive: '30 min ago',
    },
  ];

  const handleCreateAdmin = () => {
    navigation.navigate('CreateAdmin');
  };

  const handleSuspendAdmin = (admin: Admin) => {
    Alert.alert('Suspend Admin', `Suspend ${admin.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend',
        style: 'destructive',
        onPress: () => {
          // TODO: Call suspend admin API
          Alert.alert('Success', 'Admin suspended');
        },
      },
    ]);
  };

  const renderAdmin = ({ item }: { item: Admin }) => (
    <TouchableOpacity
      style={styles.adminCard}
      onPress={() => navigation.navigate('AdminDetail', { admin: item })}
    >
      <View style={styles.adminHeader}>
        <View style={styles.adminAvatar}>
          <Text style={styles.adminAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.adminInfo}>
          <Text style={styles.adminName}>{item.name}</Text>
          <Text style={styles.adminEmail}>{item.email}</Text>
          <Text style={styles.adminDepartment}>{item.department}</Text>
        </View>
        <View style={styles.adminMeta}>
          <View style={[styles.roleBadge, item.role === 'MANAGER' && styles.roleBadgeManager]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.status === 'ACTIVE' ? styles.statusActive : styles.statusSuspended,
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.adminDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Admin ID:</Text>
          <Text style={styles.detailValue}>{item.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Permissions:</Text>
          <Text style={styles.detailValue}>{item.permissions.length} assigned</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Active:</Text>
          <Text style={styles.detailValue}>{item.lastActive}</Text>
        </View>
      </View>

      <View style={styles.permissionsList}>
        {item.permissions.slice(0, 3).map((perm, index) => (
          <View key={index} style={styles.permissionChip}>
            <Text style={styles.permissionText}>{perm.replace('_', ' ')}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search admins..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateAdmin}>
          <Text style={styles.createButtonText}>+ Create Admin</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{admins.length}</Text>
          <Text style={styles.statLabel}>Total Admins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {admins.filter((a) => a.status === 'ACTIVE').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {admins.filter((a) => a.role === 'MANAGER').length}
          </Text>
          <Text style={styles.statLabel}>Managers</Text>
        </View>
      </View>

      {/* Admins List */}
      <FlatList
        data={admins}
        renderItem={renderAdmin}
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
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  adminCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  adminHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  adminAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adminAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 2,
  },
  adminDepartment: {
    fontSize: 12,
    color: '#64748b',
  },
  adminMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  roleBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeManager: {
    backgroundColor: '#7c3aed',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#10b98120',
  },
  statusSuspended: {
    backgroundColor: '#ef444420',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  adminDetails: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  permissionChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  permissionText: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'capitalize',
  },
});
