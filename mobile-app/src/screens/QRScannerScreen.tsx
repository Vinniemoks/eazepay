import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { RNCamera } from 'react-native-camera'; // Uncomment when installed

export const QRScannerScreen = ({ navigation }: any) => {
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const handleBarCodeScanned = ({ data }: any) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      const paymentData = JSON.parse(data);
      
      // Navigate to payment confirmation
      navigation.navigate('PaymentConfirm', {
        merchantId: paymentData.merchantId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
      });
    } catch (error) {
      Alert.alert('Invalid QR Code', 'Please scan a valid payment QR code');
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera View - Uncomment when RNCamera is installed */}
      {/* <RNCamera
        style={styles.camera}
        onBarCodeRead={handleBarCodeScanned}
        flashMode={flashOn ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
      /> */}

      {/* Placeholder for camera */}
      <View style={styles.cameraPlaceholder}>
        <Icon name="qrcode-scan" size={100} color="#FFF" />
        <Text style={styles.placeholderText}>Camera View</Text>
        <Text style={styles.placeholderSubtext}>
          Install react-native-camera to enable scanning
        </Text>
      </View>

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Icon name={flashOn ? 'flash' : 'flash-off'} size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.corner} style={[styles.corner, styles.topLeft]} />
          <View style={styles.corner} style={[styles.corner, styles.topRight]} />
          <View style={styles.corner} style={[styles.corner, styles.bottomLeft]} />
          <View style={styles.corner} style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.instruction}>
            Position the QR code within the frame
          </Text>
          
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => navigation.navigate('ManualPayment')}
          >
            <Icon name="keyboard" size={20} color="#FFF" />
            <Text style={styles.manualButtonText}>Enter Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  placeholderText: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scanArea: {
    alignSelf: 'center',
    width: 250,
    height: 250,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#6366F1',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
});
