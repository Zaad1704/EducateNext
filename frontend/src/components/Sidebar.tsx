import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  QrCode,
  Eye,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  School,
  UserCheck,
  TrendingUp,
  Shield,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
  color?: string;
}

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-600'
    },
    {
      label: 'Students',
      path: '/students',
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Teachers',
      path: '/teachers',
      icon: GraduationCap,
      color: 'text-purple-600'
    },
    {
      label: 'Classrooms',
      path: '/classrooms',
      icon: School,
      color: 'text-orange-600'
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: UserCheck,
      color: 'text-indigo-600'
    },
    {
      label: 'Grades',
      path: '/grades',
      icon: BookOpen,
      color: 'text-pink-600'
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: FileText,
      color: 'text-red-600'
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: TrendingUp,
      color: 'text-teal-600'
    },
    {
      label: 'Teacher Monitoring',
      path: '/teacher-monitoring',
      icon: Eye,
      color: 'text-yellow-600',
      badge: 3
    },
    {
      label: 'QR Management',
      path: '/qr-management',
      icon: QrCode,
      color: 'text-cyan-600'
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      color: 'text-gray-600'
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div
      initial={{ width: collapsed ? 80 : 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      className="glass-sidebar h-screen flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <School size={20} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">EducateNext</span>
            </motion.div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} className="text-white" /> : <ChevronLeft size={16} className="text-white" />}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-b border-white/20"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user.name}</p>
              <p className="text-white/70 text-xs capitalize">{user.role}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`flex-shrink-0 ${item.color}`}>
                <Icon size={20} />
              </div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex items-center justify-between"
                >
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;