import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const AgentPendingApprovalScreen = () => {
  const navigation = useNavigation();
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTrackStatus = () => {
    // TODO: Navigate to status tracking screen
    Alert.alert('Coming Soon', 'Status tracking will be available soon');
  };

  const handleGoHome = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>📋</Text>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Text style={styles.title}>Application Submitted!</Text>
        <Text style={styles.subtitle}>Your agent application is under review</Text>

        {/* Reference Number */}
        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>Application Reference</Text>
          <Text style={styles.referenceNumber}>AG-{Date.now().toString().slice(-8)}</Text>
          <Text style={styles.referenceHint}>Save this for tracking</Text>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          <Text style={styles.timelineTitle}>What happens next?</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStep}>Application Received</Text>
              <Text style={styles.timelineDesc}>Your application has been submitted</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStep}>Document Verification</Text>
              <Text style={styles.timelineDesc}>Our team will verify your documents</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStep}>Background Check</Text>
              <Text style={styles.timelineDesc}>Business and owner verification</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStep}>Approval & Activation</Text>
              <Text style={styles.timelineDesc}>Account setup and agent ID assignment</Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>⏱️</Text>
            <Text style={styles.infoTitle}>Processing Time</Text>
            <Text style={styles.infoText}>2-3 business days</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🔔</Text>
            <Text style={styles.infoTitle}>Stay Updated</Text>
            <Text style={styles.infoText}>We'll notify you via SMS & email</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleTrackStatus}>
          <Text style={styles.secondaryButtonText}>Track Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  referenceCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  referenceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  referenceNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  referenceHint: {
    fontSize: 12,
    color: '#94a3b8',
  },
  timeline: {
    marginBottom: 24,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#cbd5e1',
    marginTop: 4,
    marginRight: 12,
  },
  timelineDotActive: {
    backgroundColor: '#667eea',
  },
  timelineContent: {
    flex: 1,
  },
  timelineStep: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
