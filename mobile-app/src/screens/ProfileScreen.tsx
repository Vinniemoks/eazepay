import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../store/authStore';

export const ProfileScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Icon name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user?.fullName || 'User Name'}</Text>
        <Text style={styles.phone}>{user?.phoneNumber || '+254 700 000 000'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard icon="wallet" label="Balance" value="KES 12,450" />
        <StatCard icon="credit-card" label="Cards" value="3" />
        <StatCard icon="swap-horizontal" label="Transactions" value="127" />
      </View>

      <View style={styles.section}>
        <MenuItem
          icon="account-edit"
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <MenuItem
          icon="fingerprint"
          title="Biometric Settings"
          onPress={() => navigation.navigate('BiometricEnroll')}
        />
        <MenuItem
          icon="shield-check"
          title="Security"
          onPress={() => navigation.navigate('Security')}
        />
        <MenuItem
          icon="bell"
          title="Notifications"
          onPress={() => navigation.navigate('Notifications')}
        />
        <MenuItem
          icon="help-circle"
          title="Help & Support"
          onPress={() => navigation.navigate('Help')}
        />
        <MenuItem
          icon="cog"
          title="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </ScrollView>
  );
};

const StatCard = ({ icon, label, value }: any) => (
  <View style={styles.statCard}>
    <Icon name={icon} size={24} color="#6366F1" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Icon name={icon} size={24} color="#6366F1" />
    <Text style={styles.menuTitle}>{title}</Text>
    <Icon name="chevron-right" size={24} color="#CBD5E1" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#FFF' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  phone: { fontSize: 14, color: '#64748B', marginTop: 4 },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  section: { marginTop: 16, backgroundColor: '#FFF' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuTitle: { flex: 1, fontSize: 16, color: '#1E293B', marginLeft: 16 },
});
