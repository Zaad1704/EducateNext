// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';

interface Counts {
  students: number | string;
  teachers: number | string;
  classrooms: number | string;
  // You can add more counts here, e.g., institutions, enrollments, etc.
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
      const token = localStorage.getItem('token'); // Get the JWT token

      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const headers = {
        'x-auth-token': token,
        'Content-Type': 'application/json',
      };

      try {
        // Fetch Students count
        const studentsRes = await fetch('http://localhost:5000/api/students', { headers });
        const studentsData = await studentsRes.json();
        if (!studentsRes.ok) throw new Error(studentsData.message || 'Failed to fetch students.');

        // Fetch Teachers count
        const teachersRes = await fetch('http://localhost:5000/api/teachers', { headers });
        const teachersData = await teachersRes.json();
        if (!teachersRes.ok) throw new Error(teachersData.message || 'Failed to fetch teachers.');

        // Fetch Classrooms count
        const classroomsRes = await fetch('http://localhost:5000/api/classrooms', { headers });
        const classroomsData = await classroomsRes.json();
        if (!classroomsRes.ok) throw new Error(classroomsData.message || 'Failed to fetch classrooms.');

        setCounts({
          students: studentsData.length,
          teachers: teachersData.length,
          classrooms: classroomsData.length,
        });

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on mount

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
      {/* Show summary cards for students, teachers, classrooms, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">Total Students: {counts.students}</div>
        <div className="p-4 bg-white rounded-lg shadow">Total Teachers: {counts.teachers}</div>
        <div className="p-4 bg-white rounded-lg shadow">Total Classrooms: {counts.classrooms}</div>
      </div>
    </div>
  );
};

export default Dashboard;
