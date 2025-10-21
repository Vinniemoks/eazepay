import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const AgentRegisterScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    registrationNumber: '',
    businessType: '',
    location: '',
    ownerName: '',
    ownerIdNumber: '',
    ownerPhone: '',
    ownerEmail: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const businessTypes = [
    'Retail Shop',
    'Mobile Money Agent',
    'Supermarket',
    'Pharmacy',
    'Hardware Store',
    'Other',
  ];

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }
    if (!formData.businessType) {
      newErrors.businessType = 'Please select business type';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Business location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!formData.ownerIdNumber.trim()) {
      newErrors.ownerIdNumber = 'ID number is required';
    }
    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.ownerPhone)) {
      newErrors.ownerPhone = 'Please enter a valid Kenyan phone number';
    }
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      navigation.navigate('AgentDocumentUpload', { formData });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {step} of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {step === 1 ? (
          <>
            <Text style={styles.title}>Business Information</Text>
            <Text style={styles.subtitle}>Tell us about your business</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name *</Text>
              <TextInput
                style={[styles.input, errors.businessName ? styles.inputError : null]}
                placeholder="Enter business name"
                value={formData.businessName}
                onChangeText={(text) => setFormData({ ...formData, businessName: text })}
              />
              {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Registration Number *</Text>
              <TextInput
                style={[styles.input, errors.registrationNumber ? styles.inputError : null]}
                placeholder="Enter registration number"
                value={formData.registrationNumber}
                onChangeText={(text) => setFormData({ ...formData, registrationNumber: text })}
              />
              {errors.registrationNumber && (
                <Text style={styles.errorText}>{errors.registrationNumber}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Type *</Text>
              <View style={styles.typeGrid}>
                {businessTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.businessType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, businessType: type })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.businessType === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.businessType && <Text style={styles.errorText}>{errors.businessType}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Location *</Text>
              <TextInput
                style={[styles.input, errors.location ? styles.inputError : null]}
                placeholder="Enter location (e.g., Nairobi, Westlands)"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Owner Information</Text>
            <Text style={styles.subtitle}>Details of the business owner</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.ownerName ? styles.inputError : null]}
                placeholder="Enter owner's full name"
                value={formData.ownerName}
                onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
                autoCapitalize="words"
              />
              {errors.ownerName && <Text style={styles.errorText}>{errors.ownerName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID Number *</Text>
              <TextInput
                style={[styles.input, errors.ownerIdNumber ? styles.inputError : null]}
                placeholder="Enter ID number"
                value={formData.ownerIdNumber}
                onChangeText={(text) => setFormData({ ...formData, ownerIdNumber: text })}
              />
              {errors.ownerIdNumber && <Text style={styles.errorText}>{errors.ownerIdNumber}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.ownerPhone ? styles.inputError : null]}
                placeholder="+254 712 345 678"
                value={formData.ownerPhone}
                onChangeText={(text) => setFormData({ ...formData, ownerPhone: text })}
                keyboardType="phone-pad"
              />
              {errors.ownerPhone && <Text style={styles.errorText}>{errors.ownerPhone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.ownerEmail ? styles.inputError : null]}
                placeholder="Enter email address"
                value={formData.ownerEmail}
                onChangeText={(text) => setFormData({ ...formData, ownerEmail: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.ownerEmail && <Text style={styles.errorText}>{errors.ownerEmail}</Text>}
            </View>
          </>
        )}
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>{step === 2 ? 'Next' : 'Continue'}</Text>
          )}
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
  progressContainer: {
    padding: 20,
    paddingTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: '#667eea',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
