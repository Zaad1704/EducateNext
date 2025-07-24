import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_BASE_URL = 'http://localhost:5000/api';

class IDCardService {
  private async getAuthToken() {
    return await AsyncStorage.getItem('authToken');
  }

  private async getHeaders() {
    const token = await this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getMyIDCard() {
    try {
      const headers = await this.getHeaders();
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(
        `${API_BASE_URL}/id-cards/${userId}?userType=student`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load ID card');
    }
  }

  async addToWallet(cardId: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/id-cards/${cardId}/wallet`,
        {},
        { headers }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add to wallet');
    }
  }

  async downloadCard(cardId: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/id-cards/${cardId}/download`,
        { 
          headers,
          responseType: 'blob'
        }
      );
      
      // Handle file download in React Native
      // This would typically involve saving to device storage
      Alert.alert('Success', 'ID card downloaded successfully');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download card');
    }
  }

  async getAttendanceHistory(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/attendance`,
        { headers, params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load attendance');
    }
  }

  async getGrades(params?: {
    academicYear?: string;
    semester?: string;
    subjectId?: string;
  }) {
    try {
      const headers = await this.getHeaders();
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(
        `${API_BASE_URL}/grades/student/${userId}`,
        { headers, params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load grades');
    }
  }

  async getReportCards(params?: {
    academicYear?: string;
    semester?: string;
  }) {
    try {
      const headers = await this.getHeaders();
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(
        `${API_BASE_URL}/reports`,
        { 
          headers, 
          params: { ...params, studentId: userId }
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load report cards');
    }
  }
}

export const idCardService = new IDCardService();