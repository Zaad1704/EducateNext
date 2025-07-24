'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    studentPerformance: {
      averageGPA: 3.2,
      passRate: 85,
      improvementRate: 7.5,
      subjectWisePerformance: [
        { subject: 'Mathematics', averageGrade: 3.4, passRate: 82 },
        { subject: 'Science', averageGrade: 3.1, passRate: 78 },
        { subject: 'English', averageGrade: 3.6, passRate: 90 },
        { subject: 'History', averageGrade: 3.0, passRate: 75 }
      ]
    },
    attendance: {
      overallRate: 92,
      monthlyTrends: [
        { month: '2024-01', rate: 89 },
        { month: '2024-02', rate: 91 },
        { month: '2024-03', rate: 94 },
        { month: '2024-04', rate: 92 },
        { month: '2024-05', rate: 88 },
        { month: '2024-06', rate: 95 }
      ]
    },
    teacherPerformance: {
      averageRating: 8.2,
      totalEvaluations: 45,
      topPerformers: 8,
      improvementNeeded: 3
    }
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'performance',
      severity: 'medium',
      title: 'Declining Math Scores',
      message: 'Mathematics performance has dropped by 5% this month',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'attendance',
      severity: 'high',
      title: 'Low Attendance Alert',
      message: 'Class 5A attendance below 80% threshold',
      createdAt: '2024-01-14T14:20:00Z'
    }
  ]);

  const [insights, setInsights] = useState([
    {
      type: 'performance_trend',
      message: 'Student performance showing positive trend in Science subjects',
      recommendation: 'Continue current teaching methods for Science'
    },
    {
      type: 'attendance_pattern',
      message: 'Attendance drops significantly on Mondays',
      recommendation: 'Consider implementing Monday motivation programs'
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const performanceData = analytics.studentPerformance.subjectWisePerformance.map(subject => ({
    name: subject.subject,
    gpa: subject.averageGrade,
    passRate: subject.passRate
  }));

  const attendanceData = analytics.attendance.monthlyTrends.map(trend => ({
    month: new Date(trend.month).toLocaleDateString('en-US', { month: 'short' }),
    rate: trend.rate
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Generate Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Average GPA</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.studentPerformance.averageGPA}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pass Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.studentPerformance.passRate}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">📅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Attendance</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.attendance.overallRate}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">⭐</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Teacher Rating</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.teacherPerformance.averageRating}/10</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Subject-wise Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="gpa" fill="#3B82F6" name="Average GPA" />
                <Bar dataKey="passRate" fill="#10B981" name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} name="Attendance Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Recommendation:</span> {insight.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}