import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useFocusEffect } from '@react-navigation/native';
import { attendanceService } from '../services/attendanceService';

interface QRScannerScreenProps {
  navigation: any;
  route: any;
}

export default function QRScannerScreen({ navigation, route }: QRScannerScreenProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sessionId, setSessionId] = useState(route.params?.sessionId);
  const devices = useCameraDevices();
  const device = devices.back;

  useFocusEffect(
    React.useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [])
  );

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    if (status === 'granted') {
      setHasPermission(true);
    } else {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    }
  };

  const onCodeScanned = async (codes: any[]) => {
    if (codes.length > 0) {
      const qrData = codes[0].value;
      setIsActive(false);
      
      try {
        const result = await attendanceService.scanQRAttendance({
          qrData,
          sessionId,
          deviceId: 'teacher-phone-001'
        });

        Alert.alert(
          'Success',
          `Attendance recorded for ${result.studentInfo.name}`,
          [
            {
              text: 'Continue Scanning',
              onPress: () => setIsActive(true)
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack()
            }
          ]
        );

      } catch (error: any) {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to record attendance',
          [
            {
              text: 'Try Again',
              onPress: () => setIsActive(true)
            }
          ]
        );
      }
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={checkCameraPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={isActive}
        codeScanner={{
          codeTypes: ['qr'],
          onCodeScanned: onCodeScanned,
        }}
      />
      
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        
        <Text style={styles.instruction}>
          Point camera at student QR code
        </Text>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instruction: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});