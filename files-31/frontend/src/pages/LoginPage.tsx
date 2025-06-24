import React from 'react';

const LoginPage: React.FC = () => (
  <main className="flex items-center justify-center min-h-screen bg-gray-50">
    <form className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Login to EducateNext</h2>
      <input type="email" placeholder="Email" className="w-full mb-4 p-2 border rounded" />
      <input type="password" placeholder="Password" className="w-full mb-6 p-2 border rounded" />
      <button className="bg-blue-600 w-full py-2 text-white rounded hover:bg-blue-700">Login</button>
    </form>
  </main>
);

export default LoginPage;