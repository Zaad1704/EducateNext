import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, BarChart3 } from 'lucide-react';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-white/70">Generate and manage comprehensive reports</p>
        </div>
      </div>
      
      <div className="glass-card p-8 text-center">
        <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Report Generation</h3>
        <p className="text-white/70">Automated report card generation and analytics reports</p>
      </div>
    </div>
  );
};

export default ReportsPage;
