// frontend/src/pages/StudentsPage.tsx
import React, { useState, useEffect } from 'react';

// Define a type for Student for better type safety
interface Student {
  _id: string;
  name: string;
  generatedId: string;
  admissionYear: number;
  classroomId: {
    _id: string;
    name: string;
  };
  // Add other fields you might want to display
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Fetch students from the backend
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token'); // Get the JWT token
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/students', { // Ensure URL matches your backend
          headers: {
            'x-auth-token': token, // Send the token in the header
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch students.');
        }

        const data: Student[] = await response.json();
        setStudents(data);
      } catch (err: any) {
        console.error('Error fetching students:', err);
        setError(err.message || 'Failed to load students.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // Empty dependency array means this runs once on mount

  // Filter students based on search term and admission year
  const filteredStudents = students.filter((student) => {
    const matchesSearchTerm =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.generatedId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterYear = filterYear ? student.admissionYear.toString() === filterYear : true;

    return matchesSearchTerm && matchesFilterYear;
  });

  if (loading) {
    return <div className="text-center p-4">Loading students...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  // Generate years for the dropdown (e.g., current year +/- 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);


  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Students</h1>
      {/* Filter/Search */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by Name or ID"
          className="border p-2 rounded w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="ml-2 border p-2 rounded"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year.toString()}>{year}</option>
          ))}
        </select>
      </div>
      {/* Student List Table */}
      {filteredStudents.length === 0 ? (
        <p className="text-center text-gray-600">No students found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classroom</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Year</th>
                {/* Add more headers for other student fields if needed */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td className="p-3 whitespace-nowrap text-sm text-gray-900">{student.generatedId}</td>
                  <td className="p-3 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                  <td className="p-3 whitespace-nowrap text-sm text-gray-900">{student.classroomId ? student.classroomId.name : 'N/A'}</td>
                  <td className="p-3 whitespace-nowrap text-sm text-gray-900">{student.admissionYear}</td>
                  {/* Add more cells for other student fields if needed */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
