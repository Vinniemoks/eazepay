import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWalletStore } from '../store/walletStore';
import { useCardStore } from '../store/cardStore';
import { Card } from '../components/Card';

export const HomeScreen = ({ navigation }: any) => {
  const { balance, currency, fetchBalance, isLoading } = useWalletStore();
  const { cards, fetchCards } = useCardStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetchBalance();
    fetchCards();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balanceAmount}>
          {currency} {balance.toLocaleString()}
        </Text>
        <View style={styles.balanceActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TopUp')}
          >
            <Icon name="plus" size={20} color="#FFF" />
            <Text style={styles.actionText}>Top Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => navigation.navigate('SendMoney')}
          >
            <Icon name="send" size={20} color="#6366F1" />
            <Text style={[styles.actionText, styles.actionTextSecondary]}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickActions}>
        <QuickAction
          icon="credit-card-plus"
          title="Create Card"
          onPress={() => navigation.navigate('CreateCard')}
        />
        <QuickAction
          icon="qrcode-scan"
          title="Scan QR"
          onPress={() => navigation.navigate('QRScanner')}
        />
        <QuickAction
          icon="fingerprint"
          title="Pay"
          onPress={() => navigation.navigate('BiometricPay')}
        />
        <QuickAction
          icon="history"
          title="History"
          onPress={() => navigation.navigate('Transactions')}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Virtual Cards</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cards')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {cards.slice(0, 2).map(card => (
          <Card key={card.cardId} {...card} />
        ))}
      </View>
    </ScrollView>
  );
};

const QuickAction = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.quickActionItem} onPress={onPress}>
    <View style={styles.quickActionIcon}>
      <Icon name={icon} size={24} color="#6366F1" />
    </View>
    <Text style={styles.quickActionTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  balanceCard: {
    backgroundColor: '#6366F1',
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginVertical: 8 },
  balanceActions: { flexDirection: 'row', marginTop: 16 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  actionButtonSecondary: { backgroundColor: '#FFF', marginRight: 0, marginLeft: 8 },
  actionText: { fontSize: 14, fontWeight: '600', color: '#FFF', marginLeft: 8 },
  actionTextSecondary: { color: '#6366F1' },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  quickActionItem: { alignItems: 'center', width: '22%' },
  quickActionIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#FFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  section: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  seeAll: { fontSize: 14, color: '#6366F1', fontWeight: '600' },
});
