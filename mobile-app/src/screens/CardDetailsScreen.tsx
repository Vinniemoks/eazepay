import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useCardStore } from '../store/cardStore';

export const CardDetailsScreen = ({ route, navigation }: any) => {
  const { cardId } = route.params;
  const { cards, freezeCard, unfreezeCard, deleteCard } = useCardStore();
  const [showDetails, setShowDetails] = useState(false);

  const card = cards.find(c => c.cardId === cardId);

  if (!card) {
    return (
      <View style={styles.container}>
        <Text>Card not found</Text>
      </View>
    );
  }

  const handleFreeze = async () => {
    try {
      if (card.status === 'ACTIVE') {
        await freezeCard(cardId);
        Alert.alert('Success', 'Card frozen successfully');
      } else {
        await unfreezeCard(cardId);
        Alert.alert('Success', 'Card unfrozen successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update card status');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCard(cardId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete card');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Details</Text>
        <TouchableOpacity>
          <Icon name="dots-vertical" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <Card {...card} />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.detailRow}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={styles.detailLabel}>Card Number</Text>
          <View style={styles.detailRight}>
            <Text style={styles.detailValue}>
              {showDetails ? card.cardNumber : `**** **** **** ${card.cardNumber.slice(-4)}`}
            </Text>
            <Icon
              name={showDetails ? 'eye-off' : 'eye'}
              size={20}
              color="#64748B"
            />
          </View>
        </TouchableOpacity>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>CVV</Text>
          <Text style={styles.detailValue}>
            {showDetails ? card.cvv : '***'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expiry Date</Text>
          <Text style={styles.detailValue}>{card.expiryDate}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Card Holder</Text>
          <Text style={styles.detailValue}>{card.cardHolder}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text
            style={[
              styles.detailValue,
              { color: card.status === 'ACTIVE' ? '#10B981' : '#F59E0B' },
            ]}
          >
            {card.status}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Top Up Card"
          onPress={() => navigation.navigate('TopUpCard', { cardId })}
          icon="plus"
        />

        <Button
          title={card.status === 'ACTIVE' ? 'Freeze Card' : 'Unfreeze Card'}
          onPress={handleFreeze}
          variant="secondary"
          icon={card.status === 'ACTIVE' ? 'snowflake' : 'fire'}
        />

        <Button
          title="Delete Card"
          onPress={handleDelete}
          variant="danger"
          icon="delete"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  cardContainer: { padding: 16 },
  section: { backgroundColor: '#FFF', marginTop: 16 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: { fontSize: 14, color: '#64748B' },
  detailRight: { flexDirection: 'row', alignItems: 'center' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginRight: 8 },
  actions: { padding: 16 },
});
