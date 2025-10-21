import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const UserDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params as any;

  const [selectedTab, setSelectedTab] = useState<'info' | 'kyc' | 'transactions' | 'activity'>(
    'info'
  );

  const handleApproveKYC = () => {
    Alert.alert('Approve KYC', 'Are you sure you want to approve this user\'s KYC?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          // TODO: Call approve KYC API
          Alert.alert('Success', 'KYC approved successfully');
        },
      },
    ]);
  };

  const handleRejectKYC = () => {
    Alert.alert('Reject KYC', 'Please provide a reason for rejection', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          // TODO: Call reject KYC API
          Alert.alert('Success', 'KYC rejected');
        },
      },
    ]);
  };

  const handleSuspendAccount = () => {
    Alert.alert('Suspend Account', 'Are you sure you want to suspend this account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend',
        style: 'destructive',
        onPress: () => {
          // TODO: Call suspend account API
          Alert.alert('Success', 'Account suspended');
        },
      },
    ]);
  };

  const handleResetPassword = () => {
    Alert.alert('Reset Password', 'Send password reset link to user\'s email?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: () => {
          // TODO: Call reset password API
          Alert.alert('Success', 'Password reset link sent');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* User Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user.role}</Text>
            </View>
            <View style={[styles.badge, styles.badgeStatus]}>
              <Text style={styles.badgeText}>{user.status}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'info' && styles.tabActive]}
            onPress={() => setSelectedTab('info')}
          >
            <Text style={[styles.tabText, selectedTab === 'info' && styles.tabTextActive]}>
              Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'kyc' && styles.tabActive]}
            onPress={() => setSelectedTab('kyc')}
          >
            <Text style={[styles.tabText, selectedTab === 'kyc' && styles.tabTextActive]}>
              KYC
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'transactions' && styles.tabActive]}
            onPress={() => setSelectedTab('transactions')}
          >
            <Text style={[styles.tabText, selectedTab === 'transactions' && styles.tabTextActive]}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'activity' && styles.tabActive]}
            onPress={() => setSelectedTab('activity')}
          >
            <Text style={[styles.tabText, selectedTab === 'activity' && styles.tabTextActive]}>
              Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'info' && (
          <View style={styles.tabContent}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Account Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>{user.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Registered</Text>
                <Text style={styles.infoValue}>{user.registeredDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Login</Text>
                <Text style={styles.infoValue}>2 hours ago</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Wallet Balance</Text>
                <Text style={styles.infoValue}>KES 15,000</Text>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'kyc' && (
          <View style={styles.tabContent}>
            <View style={styles.kycCard}>
              <Text style={styles.kycTitle}>KYC Status: {user.kycStatus}</Text>
              <Text style={styles.kycSubtitle}>Document Type: National ID</Text>

              <View style={styles.documentGrid}>
                <View style={styles.documentCard}>
                  <Text style={styles.documentLabel}>ID Front</Text>
                  <View style={styles.documentPlaceholder}>
                    <Text style={styles.documentIcon}>🪪</Text>
                  </View>
                </View>
                <View style={styles.documentCard}>
                  <Text style={styles.documentLabel}>ID Back</Text>
                  <View style={styles.documentPlaceholder}>
                    <Text style={styles.documentIcon}>🪪</Text>
                  </View>
                </View>
                <View style={styles.documentCard}>
                  <Text style={styles.documentLabel}>Selfie</Text>
                  <View style={styles.documentPlaceholder}>
                    <Text style={styles.documentIcon}>🤳</Text>
                  </View>
                </View>
              </View>

              {user.kycStatus === 'PENDING' && (
                <View style={styles.kycActions}>
                  <TouchableOpacity style={styles.approveButton} onPress={handleApproveKYC}>
                    <Text style={styles.approveButtonText}>✓ Approve KYC</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={handleRejectKYC}>
                    <Text style={styles.rejectButtonText}>✗ Reject KYC</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {selectedTab === 'transactions' && (
          <View style={styles.tabContent}>
            <View style={styles.transactionCard}>
              <Text style={styles.transactionTitle}>Recent Transactions</Text>
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.transactionItem}>
                  <View style={styles.transactionIcon}>
                    <Text>💸</Text>
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDesc}>Sent to Jane Smith</Text>
                    <Text style={styles.transactionDate}>Jan 20, 2024</Text>
                  </View>
                  <Text style={styles.transactionAmount}>-KES 5,000</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedTab === 'activity' && (
          <View style={styles.tabContent}>
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>Activity Log</Text>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.activityItem}>
                  <View style={styles.activityDot} />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityAction}>Login from mobile app</Text>
                    <Text style={styles.activityTime}>2 hours ago</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleResetPassword}>
          <Text style={styles.actionButtonText}>Reset Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={handleSuspendAccount}
        >
          <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
            Suspend Account
          </Text>
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
  content: {
    flex: 1,
  },
  userHeader: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeStatus: {
    backgroundColor: '#f0fdf4',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#667eea',
  },
  tabContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  kycCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kycTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  kycSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  documentGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  documentCard: {
    flex: 1,
  },
  documentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  documentPlaceholder: {
    aspectRatio: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  documentIcon: {
    fontSize: 32,
  },
  kycActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  rejectButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonDanger: {
    borderColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  actionButtonTextDanger: {
    color: '#ef4444',
  },
});
