import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App: React.FC = () => (
  <BrowserRouter>
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-8 bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </div>
  </BrowserRouter>
);

export default App;