import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApi } from '../../api/auth';

type DocumentType = 'national_id' | 'passport' | 'huduma';

interface Document {
  front?: string;
  back?: string;
  selfie?: string;
}

export const KYCUploadScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const [documentType, setDocumentType] = useState<DocumentType>('national_id');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documents, setDocuments] = useState<Document>({});
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    { id: 'national_id', label: 'National ID' },
    { id: 'passport', label: 'Passport' },
    { id: 'huduma', label: 'Huduma Card' },
  ];

  const handleImagePick = async (type: 'front' | 'back' | 'selfie') => {
    // TODO: Implement image picker (camera/gallery)
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => handleCamera(type) },
        { text: 'Choose from Gallery', onPress: () => handleGallery(type) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCamera = async (type: 'front' | 'back' | 'selfie') => {
    // TODO: Implement camera capture
    // Simulate image capture
    const mockImage = `data:image/jpeg;base64,/9j/4AAQSkZJRg...`;
    setDocuments({ ...documents, [type]: mockImage });
  };

  const handleGallery = async (type: 'front' | 'back' | 'selfie') => {
    // TODO: Implement gallery picker
    // Simulate image selection
    const mockImage = `data:image/jpeg;base64,/9j/4AAQSkZJRg...`;
    setDocuments({ ...documents, [type]: mockImage });
  };

  const handleSubmit = async () => {
    // Validation
    if (!documentNumber.trim()) {
      Alert.alert('Error', 'Please enter document number');
      return;
    }

    if (!documents.front) {
      Alert.alert('Error', 'Please upload front of document');
      return;
    }

    if (documentType === 'national_id' && !documents.back) {
      Alert.alert('Error', 'Please upload back of ID card');
      return;
    }

    if (!documents.selfie) {
      Alert.alert('Error', 'Please upload a selfie');
      return;
    }

    setLoading(true);
    try {
      const docTypeMap = {
        national_id: 'NATIONAL_ID' as const,
        passport: 'PASSPORT' as const,
        huduma: 'HUDUMA' as const,
      };

      await authApi.uploadKYC({
        userId,
        documentType: docTypeMap[documentType],
        documentNumber,
        documentFront: documents.front!,
        documentBack: documents.back,
        selfie: documents.selfie!,
      });
      
      // Navigate to pending verification screen
      navigation.navigate('PendingVerification');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>
        Upload your documents for verification
      </Text>

      {/* Document Type Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Type</Text>
        <View style={styles.typeSelector}>
          {documentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                documentType === type.id && styles.typeButtonActive,
              ]}
              onPress={() => setDocumentType(type.id as DocumentType)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  documentType === type.id && styles.typeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Document Number */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter document number"
          value={documentNumber}
          onChangeText={setDocumentNumber}
          autoCapitalize="characters"
        />
      </View>

      {/* Upload Front */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {documentType === 'passport' ? 'Passport Photo Page' : 'Front of Document'}
        </Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleImagePick('front')}
        >
          {documents.front ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: documents.front }} style={styles.previewImage} />
              <View style={styles.changeOverlay}>
                <Text style={styles.changeText}>Change</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Upload Front</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Upload Back (only for ID cards) */}
      {documentType === 'national_id' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Back of ID Card</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleImagePick('back')}
          >
            {documents.back ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: documents.back }} style={styles.previewImage} />
                <View style={styles.changeOverlay}>
                  <Text style={styles.changeText}>Change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadText}>Upload Back</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Selfie */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selfie</Text>
        <Text style={styles.helperText}>
          Take a clear photo of your face
        </Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleImagePick('selfie')}
        >
          {documents.selfie ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: documents.selfie }} style={styles.previewImage} />
              <View style={styles.changeOverlay}>
                <Text style={styles.changeText}>Change</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>🤳</Text>
              <Text style={styles.uploadText}>Take Selfie</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit for Verification</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ Your documents will be reviewed within 24-48 hours
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  changeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
});
