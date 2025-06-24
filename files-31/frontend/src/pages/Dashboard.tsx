import React from 'react';

const Dashboard: React.FC = () => (
  <div>
    <h1 className="text-xl font-bold mb-4">Dashboard</h1>
    {/* Show summary cards for students, teachers, classrooms, etc. */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-white rounded-lg shadow">Total Students: --</div>
      <div className="p-4 bg-white rounded-lg shadow">Total Teachers: --</div>
      <div className="p-4 bg-white rounded-lg shadow">Total Classrooms: --</div>
    </div>
  </div>
);

export default Dashboard;