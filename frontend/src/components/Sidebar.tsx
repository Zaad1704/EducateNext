import React from 'react';

const Sidebar: React.FC = () => (
  <aside className="w-64 bg-blue-900 text-white min-h-screen p-4">
    {/* Sidebar navigation */}
    <nav>
      <ul>
        <li className="mb-2"><a href="/dashboard">Dashboard</a></li>
        <li className="mb-2"><a href="/students">Students</a></li>
        <li className="mb-2"><a href="/teachers">Teachers</a></li>
        {/* Add more links as needed */}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;