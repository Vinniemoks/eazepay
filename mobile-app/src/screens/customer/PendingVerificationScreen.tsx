import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const PendingVerificationScreen = () => {
  const navigation = useNavigation();
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate checkmark
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = () => {
    // Navigate to dashboard with limited access
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.checkmarkContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Text style={styles.title}>Account Created Successfully!</Text>
        <Text style={styles.subtitle}>
          Your documents are being verified
        </Text>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>⏱️</Text>
            <Text style={styles.infoTitle}>Verification Time</Text>
            <Text style={styles.infoText}>Usually takes 24-48 hours</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🔔</Text>
            <Text style={styles.infoTitle}>Stay Updated</Text>
            <Text style={styles.infoText}>
              You'll receive a notification once approved
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📱</Text>
            <Text style={styles.infoTitle}>Limited Access</Text>
            <Text style={styles.infoText}>
              You can explore the app while waiting
            </Text>
          </View>
        </View>

        {/* What's Next */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>What happens next?</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Our team reviews your documents
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              You receive approval notification
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Start sending and receiving money
            </Text>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to App</Text>
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
    paddingTop: 60,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 60,
    color: '#fff',
    fontWeight: 'bold',
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
    marginBottom: 32,
  },
  infoContainer: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  nextSteps: {
    backgroundColor: '#f0f4ff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
