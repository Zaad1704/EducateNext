// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Star
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useQuery } from 'react-query';
import axiosInstance from '../api/axiosInstance';

interface DashboardStats {
  students: number;
  teachers: number;
  classrooms: number;
  subjects: number;
  attendanceRate: number;
  averageGrade: number;
  activeClasses: number;
  pendingAlerts: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'attendance' | 'grade' | 'alert' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('attendance');

  // Fetch dashboard data
  const { data: stats, isLoading, error } = useQuery<DashboardStats>(
    'dashboardStats',
    async () => {
      try {
        const [studentsRes, teachersRes, classroomsRes, subjectsRes] = await Promise.all([
          axiosInstance.get('/students'),
          axiosInstance.get('/teachers'),
          axiosInstance.get('/classrooms'),
          axiosInstance.get('/subjects'),
        ]);

        return {
          students: studentsRes.data.length,
          teachers: teachersRes.data.length,
          classrooms: classroomsRes.data.length,
          subjects: subjectsRes.data.length,
          attendanceRate: 94.5,
          averageGrade: 85.2,
          activeClasses: 12,
          pendingAlerts: 3,
        };
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Return mock data for demonstration
        return {
          students: 1250,
          teachers: 85,
          classrooms: 45,
          subjects: 12,
          attendanceRate: 94.5,
          averageGrade: 85.2,
          activeClasses: 12,
          pendingAlerts: 3,
        };
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Mock data for charts
  const attendanceData = [
    { day: 'Mon', attendance: 95, target: 90 },
    { day: 'Tue', attendance: 92, target: 90 },
    { day: 'Wed', attendance: 88, target: 90 },
    { day: 'Thu', attendance: 96, target: 90 },
    { day: 'Fri', attendance: 94, target: 90 },
    { day: 'Sat', attendance: 91, target: 90 },
    { day: 'Sun', attendance: 0, target: 0 },
  ];

  const gradeDistribution = [
    { name: 'A+', value: 25, color: '#10B981' },
    { name: 'A', value: 30, color: '#34D399' },
    { name: 'B+', value: 20, color: '#F59E0B' },
    { name: 'B', value: 15, color: '#FBBF24' },
    { name: 'C', value: 8, color: '#EF4444' },
    { name: 'D', value: 2, color: '#DC2626' },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'enrollment',
      title: 'New Student Enrolled',
      description: 'John Doe has been enrolled in Class 10A',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'attendance',
      title: 'Attendance Alert',
      description: 'Teacher Sarah is late for her 9 AM class',
      timestamp: '5 minutes ago',
      status: 'warning'
    },
    {
      id: '3',
      type: 'grade',
      title: 'Grades Updated',
      description: 'Math grades for Class 9B have been updated',
      timestamp: '10 minutes ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'payment',
      title: 'Fee Payment Received',
      description: 'Payment of $500 received from Student ID 12345',
      timestamp: '15 minutes ago',
      status: 'success'
    },
    {
      id: '5',
      type: 'alert',
      title: 'System Maintenance',
      description: 'Scheduled maintenance will begin at 2 AM',
      timestamp: '1 hour ago',
      status: 'info'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <Users size={16} />;
      case 'attendance':
        return <Calendar size={16} />;
      case 'grade':
        return <BookOpen size={16} />;
      case 'payment':
        return <Target size={16} />;
      case 'alert':
        return <AlertTriangle size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500 bg-green-100';
      case 'warning':
        return 'text-yellow-500 bg-yellow-100';
      case 'error':
        return 'text-red-500 bg-red-100';
      case 'info':
        return 'text-blue-500 bg-blue-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 text-center">
          <div className="loading-pulse w-8 h-8 bg-gradient-primary rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-white/70">Failed to load dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Welcome back! Here's what's happening today.</p>
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
            <BarChart3 size={16} />
            <span>Export Report</span>
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
              <p className="text-white/70 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-white">{stats?.students.toLocaleString()}</p>
              <p className="text-green-400 text-xs">+12% from last month</p>
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
              <p className="text-white/70 text-sm">Total Teachers</p>
              <p className="text-2xl font-bold text-white">{stats?.teachers}</p>
              <p className="text-green-400 text-xs">+3 new this month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
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
              <p className="text-white/70 text-sm">Attendance Rate</p>
              <p className="text-2xl font-bold text-white">{stats?.attendanceRate}%</p>
              <p className="text-green-400 text-xs">+2.5% improvement</p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-white" />
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
              <p className="text-white/70 text-sm">Active Classes</p>
              <p className="text-2xl font-bold text-white">{stats?.activeClasses}</p>
              <p className="text-blue-400 text-xs">Currently running</p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-lg flex items-center justify-center">
              <School size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Attendance Trend</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-white/70 text-sm">Actual</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white/70 text-sm">Target</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
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
                dataKey="attendance"
                stroke="#667eea"
                strokeWidth={3}
                dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a202c'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{activity.title}</p>
                  <p className="text-white/70 text-xs">{activity.description}</p>
                </div>
                <span className="text-white/50 text-xs">{activity.timestamp}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary flex items-center space-x-2">
              <Users size={16} />
              <span>Add Student</span>
            </button>
            <button className="w-full btn-secondary flex items-center space-x-2">
              <GraduationCap size={16} />
              <span>Add Teacher</span>
            </button>
            <button className="w-full bg-gradient-success text-white border-none rounded-xl py-3 px-4 font-semibold transition-all duration-200 hover:transform hover:scale-105 flex items-center space-x-2">
              <BookOpen size={16} />
              <span>Record Attendance</span>
            </button>
            <button className="w-full bg-gradient-warning text-white border-none rounded-xl py-3 px-4 font-semibold transition-all duration-200 hover:transform hover:scale-105 flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>Generate Report</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="font-semibold text-white mb-3">Today's Highlights</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Classes Today</span>
                <span className="text-white font-medium">24</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Average Grade</span>
                <span className="text-white font-medium">{stats?.averageGrade}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Pending Alerts</span>
                <span className="text-red-400 font-medium">{stats?.pendingAlerts}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
