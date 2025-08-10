import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Search,
  Settings,
  User,
  Moon,
  Sun,
  HelpCircle,
  MessageSquare,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuthStore();

  const notifications = [
    {
      id: 1,
      title: 'New student enrolled',
      message: 'John Doe has been enrolled in Class 10A',
      time: '2 minutes ago',
      type: 'info'
    },
    {
      id: 2,
      title: 'Attendance alert',
      message: 'Teacher Sarah is late for her 9 AM class',
      time: '5 minutes ago',
      type: 'warning'
    },
    {
      id: 3,
      title: 'Grade updated',
      message: 'Math grades for Class 9B have been updated',
      time: '10 minutes ago',
      type: 'success'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-navbar px-6 py-4 flex items-center justify-between"
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-white">EducateNext</h1>
        <div className="hidden md:flex items-center space-x-2 text-white/70">
          <Activity size={16} />
          <span className="text-sm">System Status: Online</span>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
          <input
            type="text"
            placeholder="Search students, teachers, classes..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {isDarkMode ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-white" />}
        </button>

        {/* Messages */}
        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative">
          <MessageSquare size={20} className="text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            2
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative"
          >
            <Bell size={20} className="text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notifications.length}
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 glass-card p-4 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">Mark all read</button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                      <p className="text-gray-600 text-xs">{notification.message}</p>
                      <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Help */}
        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <HelpCircle size={20} className="text-white" />
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <Settings size={20} className="text-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block text-white">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-white/70 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;