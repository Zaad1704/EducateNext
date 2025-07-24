'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    grades: 0,
    reports: 0,
  });

  useEffect(() => {
    // Fetch dashboard statistics
    // This would typically come from your API
    setStats({
      students: 150,
      teachers: 25,
      grades: 1200,
      reports: 45,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to EducateNext Academic Management System</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">S</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.students}</dd>
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
                    <span className="text-white font-semibold">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Teachers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.teachers}</dd>
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
                    <span className="text-white font-semibold">G</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Grades</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.grades}</dd>
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
                    <span className="text-white font-semibold">R</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Report Cards</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.reports}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/grades" className="group block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  Grade Management
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create, manage, and publish student grades
                </p>
                <div className="mt-4">
                  <span className="text-blue-600 text-sm font-medium">
                    Manage Grades →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/reports" className="group block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  Report Cards
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Generate and manage student report cards
                </p>
                <div className="mt-4">
                  <span className="text-blue-600 text-sm font-medium">
                    View Reports →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/assignments" className="group block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  Assignments
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create and manage student assignments
                </p>
                <div className="mt-4">
                  <span className="text-blue-600 text-sm font-medium">
                    Manage Assignments →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/evaluations" className="group block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  Teacher Evaluations
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Evaluate teacher performance and feedback
                </p>
                <div className="mt-4">
                  <span className="text-blue-600 text-sm font-medium">
                    View Evaluations →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/qr/scanner" className="group block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  QR Attendance
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Scan QR codes for attendance tracking
                </p>
                <div className="mt-4">
                  <span className="text-blue-600 text-sm font-medium">
                    Open Scanner →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Analytics
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                View performance analytics and insights
              </p>
              <div className="mt-4">
                <span className="text-gray-400 text-sm font-medium">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}