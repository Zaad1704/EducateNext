import React from 'react';

const StudentsPage: React.FC = () => (
  <div>
    <h1 className="text-xl font-bold mb-4">Students</h1>
    {/* Filter/Search */}
    <div className="mb-4">
      <input type="text" placeholder="Search by Name or ID" className="border p-2 rounded w-64" />
      <select className="ml-2 border p-2 rounded">
        <option value="">All Years</option>
        <option value="2025">2025</option>
        {/* Add more years dynamically */}
      </select>
    </div>
    {/* Student List Placeholder */}
    <table className="w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="p-2 text-left">ID</th>
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Classroom</th>
        </tr>
      </thead>
      <tbody>
        {/* Map students here */}
        <tr>
          <td className="p-2">25-001-001</td>
          <td className="p-2">Jane Doe</td>
          <td className="p-2">Grade 1A</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default StudentsPage;