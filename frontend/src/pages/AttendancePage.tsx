import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const AttendancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Attendance</h1>
          <p className="text-white/70">Track and manage student and teacher attendance</p>
        </div>
      </div>
      
      <div className="glass-card p-8 text-center">
        <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Attendance Management</h3>
        <p className="text-white/70">QR-based attendance system with real-time tracking</p>
      </div>
    </div>
  );
};

export default AttendancePage;
