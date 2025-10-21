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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

interface Documents {
  businessLicense?: string;
  ownerIdFront?: string;
  ownerIdBack?: string;
  premisesPhoto?: string;
}

export const AgentDocumentUploadScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { formData } = route.params as any;

  const [documents, setDocuments] = useState<Documents>({});
  const [loading, setLoading] = useState(false);

  const handleImagePick = async (type: keyof Documents) => {
    Alert.alert('Upload Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: () => handleCamera(type) },
      { text: 'Choose from Gallery', onPress: () => handleGallery(type) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCamera = async (type: keyof Documents) => {
    // TODO: Implement camera capture
    const mockImage = `data:image/jpeg;base64,/9j/4AAQSkZJRg...`;
    setDocuments({ ...documents, [type]: mockImage });
  };

  const handleGallery = async (type: keyof Documents) => {
    // TODO: Implement gallery picker
    const mockImage = `data:image/jpeg;base64,/9j/4AAQSkZJRg...`;
    setDocuments({ ...documents, [type]: mockImage });
  };

  const handleSubmit = async () => {
    // Validation
    if (!documents.businessLicense) {
      Alert.alert('Error', 'Please upload business license');
      return;
    }
    if (!documents.ownerIdFront) {
      Alert.alert('Error', 'Please upload front of owner ID');
      return;
    }
    if (!documents.ownerIdBack) {
      Alert.alert('Error', 'Please upload back of owner ID');
      return;
    }
    if (!documents.premisesPhoto) {
      Alert.alert('Error', 'Please upload business premises photo');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call agent registration API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to pending approval screen
      navigation.navigate('AgentPendingApproval');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUploadCard = (
    title: string,
    description: string,
    type: keyof Documents,
    icon: string
  ) => (
    <View style={styles.uploadCard}>
      <Text style={styles.uploadTitle}>{title}</Text>
      <Text style={styles.uploadDescription}>{description}</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={() => handleImagePick(type)}>
        {documents[type] ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: documents[type] }} style={styles.previewImage} />
            <View style={styles.changeOverlay}>
              <Text style={styles.changeText}>Change</Text>
            </View>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Text style={styles.uploadIcon}>{icon}</Text>
            <Text style={styles.uploadText}>Upload Photo</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>Step 3 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Upload Documents</Text>
        <Text style={styles.subtitle}>Please provide clear photos of the following documents</Text>

        {renderUploadCard(
          'Business License',
          'Upload your valid business license',
          'businessLicense',
          '📄'
        )}

        {renderUploadCard(
          'Owner ID - Front',
          'Front side of owner national ID',
          'ownerIdFront',
          '🪪'
        )}

        {renderUploadCard('Owner ID - Back', 'Back side of owner national ID', 'ownerIdBack', '🪪')}

        {renderUploadCard(
          'Business Premises',
          'Photo of your business location',
          'premisesPhoto',
          '🏪'
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ All documents will be reviewed by our team. Approval typically takes 2-3 business
            days.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
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
  uploadCard: {
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 150,
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
  infoBox: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
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
  submitButton: {
    flex: 2,
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
