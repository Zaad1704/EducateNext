import React from 'react';

const Navbar: React.FC = () => (
  <header className="bg-white shadow-sm p-4 flex justify-between items-center">
    <div className="font-bold text-blue-700 text-lg">EducateNext</div>
    {/* User info / menu */}
    <div>User Menu</div>
  </header>
);

export default Navbar;