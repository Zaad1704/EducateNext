import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Download } from 'lucide-react';

const QRManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">QR Management</h1>
          <p className="text-white/70">Generate and manage QR codes for attendance</p>
        </div>
      </div>
      
      <div className="glass-card p-8 text-center">
        <QrCode className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">QR Code System</h3>
        <p className="text-white/70">Generate QR codes for students, teachers, and classrooms</p>
      </div>
    </div>
  );
};

export default QRManagementPage;
