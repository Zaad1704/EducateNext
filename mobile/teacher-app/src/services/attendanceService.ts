import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

class AttendanceService {
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

  async startSession(classroomId: string, sessionType: 'class_start' | 'class_end') {
    const headers = await this.getHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/attendance/sessions/start`,
      { classroomId, sessionType },
      { headers }
    );
    return response.data;
  }

  async endSession(sessionId: string) {
    const headers = await this.getHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/attendance/sessions/${sessionId}/end`,
      {},
      { headers }
    );
    return response.data;
  }

  async scanQRAttendance(data: {
    qrData: string;
    sessionId: string;
    deviceId: string;
  }) {
    const headers = await this.getHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/attendance/sessions/scan`,
      data,
      { headers }
    );
    return response.data;
  }

  async getActiveSessions() {
    const headers = await this.getHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/attendance/sessions/active`,
      { headers }
    );
    return response.data;
  }

  async getSessionHistory(params?: {
    classroomId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const headers = await this.getHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/attendance/sessions/history`,
      { headers, params }
    );
    return response.data;
  }

  async markManualAttendance(data: {
    studentId: string;
    classroomId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
  }) {
    const headers = await this.getHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/attendance`,
      { ...data, scanMethod: 'manual' },
      { headers }
    );
    return response.data;
  }
}

export const attendanceService = new AttendanceService();