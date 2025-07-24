'use client';

import { useState } from 'react';

export default function GradesPage() {
  const [grades, setGrades] = useState([
    {
      id: 1,
      student: 'John Doe',
      subject: 'Mathematics',
      assignment: 'Mid-term Exam',
      maxMarks: 100,
      obtainedMarks: 85,
      percentage: 85,
      grade: 'A',
      gpa: 3.7,
      date: '2024-01-15',
      isPublished: false,
    },
    {
      id: 2,
      student: 'Jane Smith',
      subject: 'Science',
      assignment: 'Lab Report',
      maxMarks: 50,
      obtainedMarks: 45,
      percentage: 90,
      grade: 'A+',
      gpa: 4.0,
      date: '2024-01-14',
      isPublished: true,
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGrade, setNewGrade] = useState({
    student: '',
    subject: '',
    assignment: '',
    maxMarks: '',
    obtainedMarks: '',
  });

  const handleCreateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const percentage = (parseInt(newGrade.obtainedMarks) / parseInt(newGrade.maxMarks)) * 100;
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : 'B';
    const gpa = percentage >= 90 ? 4.0 : percentage >= 80 ? 3.7 : percentage >= 70 ? 3.3 : 3.0;

    const gradeEntry = {
      id: grades.length + 1,
      student: newGrade.student,
      subject: newGrade.subject,
      assignment: newGrade.assignment,
      maxMarks: parseInt(newGrade.maxMarks),
      obtainedMarks: parseInt(newGrade.obtainedMarks),
      percentage: Math.round(percentage * 100) / 100,
      grade,
      gpa,
      date: new Date().toISOString().split('T')[0],
      isPublished: false,
    };

    setGrades([...grades, gradeEntry]);
    setNewGrade({ student: '', subject: '', assignment: '', maxMarks: '', obtainedMarks: '' });
    setShowCreateForm(false);
  };

  const togglePublish = (id: number) => {
    setGrades(grades.map(grade => 
      grade.id === id ? { ...grade, isPublished: !grade.isPublished } : grade
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Management</h1>
            <p className="mt-2 text-gray-600">Create, manage, and publish student grades</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Grade
          </button>
        </div>

        {/* Create Grade Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Grade</h2>
            <form onSubmit={handleCreateGrade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <input
                  type="text"
                  value={newGrade.student}
                  onChange={(e) => setNewGrade({ ...newGrade, student: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={newGrade.subject}
                  onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assignment</label>
                <input
                  type="text"
                  value={newGrade.assignment}
                  onChange={(e) => setNewGrade({ ...newGrade, assignment: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Marks</label>
                <input
                  type="number"
                  value={newGrade.maxMarks}
                  onChange={(e) => setNewGrade({ ...newGrade, maxMarks: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Obtained Marks</label>
                <input
                  type="number"
                  value={newGrade.obtainedMarks}
                  onChange={(e) => setNewGrade({ ...newGrade, obtainedMarks: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Grade
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grades Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade) => (
                    <tr key={grade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grade.student}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.assignment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.obtainedMarks}/{grade.maxMarks} ({grade.percentage}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          grade.grade === 'A+' ? 'bg-green-100 text-green-800' :
                          grade.grade === 'A' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {grade.grade} (GPA: {grade.gpa})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          grade.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {grade.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => togglePublish(grade.id)}
                          className={`${
                            grade.isPublished ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {grade.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}