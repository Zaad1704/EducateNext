import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import ClassroomsPage from './pages/ClassroomsPage';
import AttendancePage from './pages/AttendancePage';
import GradesPage from './pages/GradesPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TeacherMonitoringPage from './pages/TeacherMonitoringPage';
import QRManagementPage from './pages/QRManagementPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Store
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex min-h-screen bg-gradient-primary animate-gradient">
          <AnimatePresence mode="wait">
            {isAuthenticated && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Sidebar />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex-1 flex flex-col">
            {isAuthenticated && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Navbar />
              </motion.div>
            )}
            
            <main className="flex-1 p-6 overflow-auto">
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public Routes */}
                  <Route 
                    path="/login" 
                    element={
                      isAuthenticated ? 
                        <Navigate to="/dashboard" replace /> : 
                        <LoginPage />
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      isAuthenticated ? 
                        <Navigate to="/dashboard" replace /> : 
                        <RegisterPage />
                    } 
                  />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={<ProtectedRoute />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="students" element={<StudentsPage />} />
                    <Route path="teachers" element={<TeachersPage />} />
                    <Route path="classrooms" element={<ClassroomsPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="grades" element={<GradesPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="teacher-monitoring" element={<TeacherMonitoringPage />} />
                    <Route path="qr-management" element={<QRManagementPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </div>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#1a202c',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;