// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance

interface Counts {
  students: number | string;
  teachers: number | string;
  classrooms: number | string;
}

const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState<Counts>({
    students: '--',
    teachers: '--',
    classrooms: '--',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use axiosInstance for all requests. Token is handled by interceptor.
        const [studentsRes, teachersRes, classroomsRes] = await Promise.all([
          axiosInstance.get('/students'),
          axiosInstance.get('/teachers'),
          axiosInstance.get('/classrooms'),
        ]);

        setCounts({
          students: studentsRes.data.length,
          teachers: teachersRes.data.length,
          classrooms: classroomsRes.data.length,
        });

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">Total Students: Loading...</div>
          <div className="p-4 bg-white rounded-lg shadow">Total Teachers: Loading...</div>
          <div className="p-4 bg-white rounded-lg shadow">Total Classrooms: Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow text-red-600 col-span-full">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">Total Students: {counts.students}</div>
        <div className="p-4 bg-white rounded-lg shadow">Total Teachers: {counts.teachers}</div>
        <div className="p-4 bg-white rounded-lg shadow">Total Classrooms: {counts.classrooms}</div>
      </div>
    </div>
  );
};

export default Dashboard;
