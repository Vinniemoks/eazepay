import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { biometricService } from '../services/biometric';
import { useAuthStore } from '../store/authStore';

const FINGERS = [
  { id: 'LEFT_THUMB', name: 'Left Thumb', icon: 'hand-back-left' },
  { id: 'LEFT_INDEX', name: 'Left Index', icon: 'hand-back-left' },
  { id: 'LEFT_MIDDLE', name: 'Left Middle', icon: 'hand-back-left' },
  { id: 'LEFT_RING', name: 'Left Ring', icon: 'hand-back-left' },
  { id: 'LEFT_PINKY', name: 'Left Pinky', icon: 'hand-back-left' },
  { id: 'RIGHT_THUMB', name: 'Right Thumb', icon: 'hand-back-right' },
  { id: 'RIGHT_INDEX', name: 'Right Index', icon: 'hand-back-right' },
  { id: 'RIGHT_MIDDLE', name: 'Right Middle', icon: 'hand-back-right' },
  { id: 'RIGHT_RING', name: 'Right Ring', icon: 'hand-back-right' },
  { id: 'RIGHT_PINKY', name: 'Right Pinky', icon: 'hand-back-right' },
];

export const BiometricEnrollScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [enrolledFingers, setEnrolledFingers] = useState<string[]>([]);
  const [currentFinger, setCurrentFinger] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const enrollFinger = async (fingerId: string) => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setCurrentFinger(fingerId);
    setEnrolling(true);

    try {
      const success = await biometricService.enrollFingerprint(fingerId, user.id);

      if (success) {
        setEnrolledFingers([...enrolledFingers, fingerId]);
        Alert.alert('Success', `${FINGERS.find(f => f.id === fingerId)?.name} enrolled!`);
      } else {
        Alert.alert('Error', 'Failed to enroll fingerprint');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to enroll fingerprint');
    } finally {
      setEnrolling(false);
      setCurrentFinger(null);
    }
  };

  const progress = (enrolledFingers.length / FINGERS.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enroll Biometrics</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {enrolledFingers.length} / {FINGERS.length} fingers enrolled
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.grid}>
        {FINGERS.map(finger => {
          const isEnrolled = enrolledFingers.includes(finger.id);
          const isCurrent = currentFinger === finger.id;

          return (
            <TouchableOpacity
              key={finger.id}
              style={[
                styles.fingerCard,
                isEnrolled && styles.fingerCardEnrolled,
                isCurrent && styles.fingerCardCurrent,
              ]}
              onPress={() => !isEnrolled && !enrolling && enrollFinger(finger.id)}
              disabled={isEnrolled || enrolling}
            >
              <Icon
                name={finger.icon}
                size={32}
                color={isEnrolled ? '#10B981' : isCurrent ? '#6366F1' : '#64748B'}
              />
              <Text style={styles.fingerName}>{finger.name}</Text>
              {isEnrolled && (
                <Icon name="check-circle" size={20} color="#10B981" />
              )}
              {isCurrent && (
                <Text style={styles.enrollingText}>Scanning...</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {enrolledFingers.length === FINGERS.length && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
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
  progressContainer: { padding: 16, backgroundColor: '#FFF', marginBottom: 16 },
  progressText: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  fingerCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  fingerCardEnrolled: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  fingerCardCurrent: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  fingerName: { fontSize: 12, color: '#64748B', marginTop: 8 },
  enrollingText: { fontSize: 10, color: '#6366F1', marginTop: 4 },
  completeButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
});
