import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';

interface ConsentItem {
  type: string;
  title: string;
  description: string;
  required: boolean;
}

const consentItems: ConsentItem[] = [
  {
    type: 'data_processing',
    title: 'Data Processing',
    description: 'Allow processing of educational data',
    required: true
  },
  {
    type: 'analytics',
    title: 'Analytics',
    description: 'Help improve our services with usage analytics',
    required: false
  }
];

export const ComplianceConsent: React.FC = () => {
  const [consents, setConsents] = useState<Record<string, boolean>>({});

  const handleConsentChange = (type: string, value: boolean) => {
    setConsents(prev => ({ ...prev, [type]: value }));
  };

  const submitConsents = async () => {
    // API call to record consents
    console.log('Consents submitted:', consents);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Preferences</Text>
      
      {consentItems.map(item => (
        <View key={item.type} style={styles.consentItem}>
          <View style={styles.consentText}>
            <Text style={styles.consentTitle}>{item.title}</Text>
            <Text style={styles.consentDesc}>{item.description}</Text>
          </View>
          <Switch
            value={consents[item.type] || false}
            onValueChange={(value) => handleConsentChange(item.type, value)}
            disabled={item.required}
          />
        </View>
      ))}
      
      <TouchableOpacity style={styles.submitButton} onPress={submitConsents}>
        <Text style={styles.submitText}>Save Preferences</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  consentItem: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  consentText: { flex: 1, marginRight: 10 },
  consentTitle: { fontSize: 16, fontWeight: '600' },
  consentDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  submitButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginTop: 20 },
  submitText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' }
});