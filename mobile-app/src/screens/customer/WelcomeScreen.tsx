import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Send Money Instantly',
    description: 'Transfer money to friends and family in seconds',
    image: require('../../assets/images/send-money.png'), // You'll need to add these images
  },
  {
    id: 2,
    title: 'Pay with QR Code',
    description: 'Scan and pay at any merchant instantly',
    image: require('../../assets/images/qr-payment.png'),
  },
  {
    id: 3,
    title: 'Secure & Fast',
    description: 'Your money is safe with biometric authentication',
    image: require('../../assets/images/secure.png'),
  },
];

export const WelcomeScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation();

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    navigation.navigate('GetStarted');
  };

  const handleGetStarted = () => {
    navigation.navigate('GetStarted');
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {currentSlide < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slide Content */}
      <View style={styles.slideContainer}>
        <View style={styles.imageContainer}>
          <Image source={slide.image} style={styles.image} resizeMode="contain" />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        {currentSlide < SLIDES.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#667eea',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  getStartedButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
