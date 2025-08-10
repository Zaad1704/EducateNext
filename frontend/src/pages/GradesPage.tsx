import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Award } from 'lucide-react';

const GradesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Grades</h1>
          <p className="text-white/70">Manage student grades and academic performance</p>
        </div>
      </div>
      
      <div className="glass-card p-8 text-center">
        <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Grade Management</h3>
        <p className="text-white/70">Comprehensive grading system with analytics and reporting</p>
      </div>
    </div>
  );
};

export default GradesPage;
