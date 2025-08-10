import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  Shield,
  Smartphone,
  Wifi,
  Signal
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TeacherActivity {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  classroom: string;
  scheduledTime: string;
  actualTime: string;
  status: 'present' | 'late' | 'absent' | 'on_leave';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deviceActivity: {
    isOnline: boolean;
    lastActive: string;
    appUsage: {
      app: string;
      duration: number;
      isEducational: boolean;
    }[];
    screenTime: number;
    batteryLevel: number;
  };
  classActivity: {
    studentsPresent: number;
    totalStudents: number;
    attendancePercentage: number;
    classStarted: boolean;
    classEnded: boolean;
  };
  alerts: {
    type: 'late_arrival' | 'absent' | 'device_offline' | 'non_educational_app' | 'location_mismatch';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }[];
}

const TeacherMonitoringPage: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherActivity[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockTeachers: TeacherActivity[] = [
      {
        id: '1',
        teacherId: 'T001',
        teacherName: 'Sarah Johnson',
        subject: 'Mathematics',
        classroom: 'Room 101',
        scheduledTime: '09:00 AM',
        actualTime: '09:15 AM',
        status: 'late',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'School Campus, Building A'
        },
        deviceActivity: {
          isOnline: true,
          lastActive: '2 minutes ago',
          appUsage: [
            { app: 'Google Classroom', duration: 45, isEducational: true },
            { app: 'WhatsApp', duration: 15, isEducational: false },
            { app: 'Calculator', duration: 10, isEducational: true }
          ],
          screenTime: 70,
          batteryLevel: 85
        },
        classActivity: {
          studentsPresent: 28,
          totalStudents: 30,
          attendancePercentage: 93.3,
          classStarted: true,
          classEnded: false
        },
        alerts: [
          {
            type: 'late_arrival',
            message: 'Teacher arrived 15 minutes late',
            severity: 'medium',
            timestamp: '09:15 AM'
          }
        ]
      },
      {
        id: '2',
        teacherId: 'T002',
        teacherName: 'Michael Chen',
        subject: 'Physics',
        classroom: 'Room 205',
        scheduledTime: '10:00 AM',
        actualTime: '10:00 AM',
        status: 'present',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'School Campus, Building B'
        },
        deviceActivity: {
          isOnline: true,
          lastActive: '1 minute ago',
          appUsage: [
            { app: 'Lab Equipment App', duration: 60, isEducational: true },
            { app: 'Email', duration: 5, isEducational: true }
          ],
          screenTime: 65,
          batteryLevel: 92
        },
        classActivity: {
          studentsPresent: 25,
          totalStudents: 25,
          attendancePercentage: 100,
          classStarted: true,
          classEnded: false
        },
        alerts: []
      },
      {
        id: '3',
        teacherId: 'T003',
        teacherName: 'Emily Davis',
        subject: 'English Literature',
        classroom: 'Room 103',
        scheduledTime: '11:00 AM',
        actualTime: 'Not arrived',
        status: 'absent',
        location: {
          latitude: 0,
          longitude: 0,
          address: 'Location unavailable'
        },
        deviceActivity: {
          isOnline: false,
          lastActive: '2 hours ago',
          appUsage: [],
          screenTime: 0,
          batteryLevel: 0
        },
        classActivity: {
          studentsPresent: 0,
          totalStudents: 28,
          attendancePercentage: 0,
          classStarted: false,
          classEnded: false
        },
        alerts: [
          {
            type: 'absent',
            message: 'Teacher not present for scheduled class',
            severity: 'high',
            timestamp: '11:00 AM'
          },
          {
            type: 'device_offline',
            message: 'Teacher device is offline',
            severity: 'high',
            timestamp: '11:00 AM'
          }
        ]
      }
    ];

    setTimeout(() => {
      setTeachers(mockTeachers);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'late':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'absent':
        return <XCircle className="text-red-500" size={20} />;
      case 'on_leave':
        return <Calendar className="text-blue-500" size={20} />;
      default:
        return <Activity className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const chartData = [
    { name: 'Present', value: teachers.filter(t => t.status === 'present').length, color: '#10B981' },
    { name: 'Late', value: teachers.filter(t => t.status === 'late').length, color: '#F59E0B' },
    { name: 'Absent', value: teachers.filter(t => t.status === 'absent').length, color: '#EF4444' },
    { name: 'On Leave', value: teachers.filter(t => t.status === 'on_leave').length, color: '#3B82F6' }
  ];

  const activityData = [
    { time: '9:00', activity: 85 },
    { time: '9:30', activity: 90 },
    { time: '10:00', activity: 78 },
    { time: '10:30', activity: 92 },
    { time: '11:00', activity: 65 },
    { time: '11:30', activity: 88 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 text-center">
          <div className="loading-pulse w-8 h-8 bg-gradient-primary rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Monitoring</h1>
          <p className="text-white/70">Real-time monitoring of teacher activities and attendance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="glass-card px-4 py-2 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="btn-primary flex items-center space-x-2">
            <Shield size={16} />
            <span>Privacy Settings</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Teachers</p>
              <p className="text-2xl font-bold text-white">{teachers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Present Today</p>
              <p className="text-2xl font-bold text-green-400">
                {teachers.filter(t => t.status === 'present').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Late Arrivals</p>
              <p className="text-2xl font-bold text-yellow-400">
                {teachers.filter(t => t.status === 'late').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Active Alerts</p>
              <p className="text-2xl font-bold text-red-400">
                {teachers.reduce((acc, teacher) => acc + teacher.alerts.length, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-danger rounded-lg flex items-center justify-center">
              <AlertCircle size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a202c'
                }}
              />
              <Line
                type="monotone"
                dataKey="activity"
                stroke="#667eea"
                strokeWidth={3}
                dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Teacher List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Teacher Activity Details</h3>
          <div className="flex items-center space-x-2 text-white/70 text-sm">
            <Shield size={16} />
            <span>Non-invasive monitoring active</span>
          </div>
        </div>

        <div className="space-y-4">
          {teachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 card-hover"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {teacher.teacherName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{teacher.teacherName}</h4>
                    <p className="text-white/70 text-sm">{teacher.subject} • {teacher.classroom}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-white/50 text-xs">
                        <Clock size={12} className="inline mr-1" />
                        {teacher.scheduledTime}
                      </span>
                      <span className="text-white/50 text-xs">
                        <MapPin size={12} className="inline mr-1" />
                        {teacher.location.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(teacher.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(teacher.status)}`}>
                        {teacher.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white/70 text-xs mt-1">
                      {teacher.actualTime !== 'Not arrived' ? `Arrived: ${teacher.actualTime}` : 'Not arrived'}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Smartphone size={16} className="text-white/70" />
                      <span className="text-white/70 text-xs">
                        {teacher.deviceActivity.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs">
                      Battery: {teacher.deviceActivity.batteryLevel}%
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="text-white/70" />
                      <span className="text-white/70 text-xs">
                        {teacher.classActivity.studentsPresent}/{teacher.classActivity.totalStudents}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs">
                      {teacher.classActivity.attendancePercentage}% attendance
                    </p>
                  </div>

                  {teacher.alerts.length > 0 && (
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <AlertCircle size={16} className="text-red-400" />
                        <span className="text-red-400 text-xs font-medium">
                          {teacher.alerts.length} alert{teacher.alerts.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alerts */}
              {teacher.alerts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="space-y-2">
                    {teacher.alerts.map((alert, alertIndex) => (
                      <div
                        key={alertIndex}
                        className={`p-3 rounded-lg ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <AlertTriangle size={16} />
                          <span className="font-medium text-sm">{alert.message}</span>
                          <span className="text-xs opacity-75">{alert.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-blue-50/10 border border-blue-200/20"
      >
        <div className="flex items-start space-x-3">
          <Shield size={20} className="text-blue-400 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Privacy & Monitoring Notice</h4>
            <p className="text-white/80 text-sm leading-relaxed">
              This monitoring system operates non-invasively and only tracks teacher activities during scheduled class hours. 
              The system respects privacy by only monitoring educational app usage, location (when on campus), and device status. 
              Personal communications and non-educational activities are not monitored. All data is encrypted and accessible only 
              to authorized administrators. Teachers are notified of monitoring activities and can request data access or opt-out 
              for personal time periods.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherMonitoringPage;
