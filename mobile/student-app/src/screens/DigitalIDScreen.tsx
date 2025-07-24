import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { idCardService } from '../services/idCardService';

const { width } = Dimensions.get('window');

interface IDCardData {
  id: string;
  cardNumber: string;
  cardData: {
    name: string;
    photo: string;
    id: string;
    institution: string;
    validFrom: string;
    validUntil: string;
    class: string;
    emergencyContact: string;
  };
  qrCodeId: string;
  digitalWalletAdded: boolean;
}

export default function DigitalIDScreen() {
  const [idCard, setIdCard] = useState<IDCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrSize, setQrSize] = useState(120);

  useEffect(() => {
    loadIDCard();
  }, []);

  const loadIDCard = async () => {
    try {
      setLoading(true);
      const cardData = await idCardService.getMyIDCard();
      setIdCard(cardData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load ID card');
    } finally {
      setLoading(false);
    }
  };

  const addToWallet = async () => {
    if (!idCard) return;

    try {
      await idCardService.addToWallet(idCard.id);
      setIdCard({ ...idCard, digitalWalletAdded: true });
      Alert.alert('Success', 'ID card added to digital wallet');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add to wallet');
    }
  };

  const downloadCard = async () => {
    if (!idCard) return;

    try {
      await idCardService.downloadCard(idCard.id);
      Alert.alert('Success', 'ID card downloaded');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to download card');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading ID Card...</Text>
      </View>
    );
  }

  if (!idCard) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>ID Card not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadIDCard}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Digital ID Card */}
        <View style={styles.idCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.institutionName}>{idCard.cardData.institution}</Text>
            <Text style={styles.cardType}>STUDENT ID CARD</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.photoSection}>
              <Image
                source={{ uri: idCard.cardData.photo || 'https://via.placeholder.com/100' }}
                style={styles.photo}
              />
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.studentName}>{idCard.cardData.name}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.label}>ID:</Text>
                <Text style={styles.value}>{idCard.cardData.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Class:</Text>
                <Text style={styles.value}>{idCard.cardData.class}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Valid Until:</Text>
                <Text style={styles.value}>
                  {new Date(idCard.cardData.validUntil).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.qrSection}>
              <QRCode
                value={idCard.qrCodeId}
                size={qrSize}
                backgroundColor="white"
                color="black"
              />
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardNumber}>{idCard.cardNumber}</Text>
            <Text style={styles.emergencyText}>
              Emergency: {idCard.cardData.emergencyContact}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!idCard.digitalWalletAdded && (
            <TouchableOpacity style={styles.walletButton} onPress={addToWallet}>
              <Text style={styles.walletButtonText}>Add to Wallet</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.downloadButton} onPress={downloadCard}>
            <Text style={styles.downloadButtonText}>Download PDF</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to use your QR code:</Text>
          <Text style={styles.instructionText}>
            • Show this QR code to your teacher for attendance
          </Text>
          <Text style={styles.instructionText}>
            • Keep your phone screen bright for better scanning
          </Text>
          <Text style={styles.instructionText}>
            • Make sure the QR code is clearly visible
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardContainer: {
    padding: 20,
  },
  idCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  institutionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  cardType: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  photoSection: {
    marginRight: 15,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  infoSection: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    width: 60,
  },
  value: {
    fontSize: 12,
    color: '#2c3e50',
    flex: 1,
  },
  qrSection: {
    alignItems: 'center',
    marginLeft: 10,
  },
  cardFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cardNumber: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  emergencyText: {
    fontSize: 10,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  walletButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  walletButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
});