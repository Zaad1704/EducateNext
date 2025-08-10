import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, User } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/70">Manage system settings and preferences</p>
        </div>
      </div>
      
      <div className="glass-card p-8 text-center">
        <Settings className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">System Settings</h3>
        <p className="text-white/70">Configure system preferences, security, and notifications</p>
      </div>
    </div>
  );
};

export default SettingsPage;
