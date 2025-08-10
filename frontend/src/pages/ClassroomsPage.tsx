import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  School,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  Wifi,
  Monitor,
  Settings
} from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  currentStudents: number;
  teacher: string;
  subject: string;
  schedule: string;
  location: string;
  equipment: string[];
  status: 'active' | 'maintenance' | 'vacant';
}

const ClassroomsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const classrooms: Classroom[] = [
    {
      id: '1',
      name: 'Room 101',
      capacity: 30,
      currentStudents: 28,
      teacher: 'Sarah Johnson',
      subject: 'Mathematics',
      schedule: 'Mon-Fri 9:00 AM - 10:30 AM',
      location: 'Building A, 1st Floor',
      equipment: ['Projector', 'Whiteboard', 'WiFi'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Room 205',
      capacity: 25,
      currentStudents: 25,
      teacher: 'Michael Chen',
      subject: 'Physics',
      schedule: 'Mon-Fri 10:00 AM - 11:30 AM',
      location: 'Building B, 2nd Floor',
      equipment: ['Lab Equipment', 'Projector', 'WiFi'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Room 103',
      capacity: 28,
      currentStudents: 0,
      teacher: 'Vacant',
      subject: 'Vacant',
      schedule: 'No Schedule',
      location: 'Building A, 1st Floor',
      equipment: ['Projector', 'Whiteboard'],
      status: 'vacant'
    }
  ];

  const filteredClassrooms = classrooms.filter(classroom => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classroom.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classroom.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || classroom.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'vacant':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Classrooms</h1>
          <p className="text-white/70">Manage classroom assignments and resources</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={16} />
          <span>Add Classroom</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder="Search classrooms by name, subject, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="vacant">Vacant</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Classrooms</p>
              <p className="text-2xl font-bold text-white">{classrooms.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <School size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Active Classes</p>
              <p className="text-2xl font-bold text-green-400">
                {classrooms.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Capacity</p>
              <p className="text-2xl font-bold text-blue-400">
                {classrooms.reduce((acc, c) => acc + c.capacity, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Vacant Rooms</p>
              <p className="text-2xl font-bold text-yellow-400">
                {classrooms.filter(c => c.status === 'vacant').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Classrooms List */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Classroom Directory</h3>
          <p className="text-white/70 text-sm">
            Showing {filteredClassrooms.length} of {classrooms.length} classrooms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom, index) => {
            const occupancyPercentage = getOccupancyPercentage(classroom.currentStudents, classroom.capacity);
            
            return (
              <motion.div
                key={classroom.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-white text-lg">{classroom.name}</h4>
                    <p className="text-white/70 text-sm">{classroom.subject}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classroom.status)}`}>
                    {classroom.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-white/70 text-sm">
                    <Users size={14} />
                    <span>{classroom.currentStudents}/{classroom.capacity} students</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70 text-sm">
                    <BookOpen size={14} />
                    <span>{classroom.teacher}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70 text-sm">
                    <Calendar size={14} />
                    <span>{classroom.schedule}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70 text-sm">
                    <MapPin size={14} />
                    <span>{classroom.location}</span>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/70">Occupancy</span>
                    <span className={`font-medium ${getOccupancyColor(occupancyPercentage)}`}>
                      {occupancyPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        occupancyPercentage >= 90 ? 'bg-red-400' :
                        occupancyPercentage >= 75 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${occupancyPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Equipment */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/70 text-sm mb-2">Equipment:</p>
                  <div className="flex flex-wrap gap-1">
                    {classroom.equipment.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white/10 rounded text-xs text-white/70"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm">
                    <Settings size={14} />
                    <span>Manage</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                      <Wifi size={14} className="text-white" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                      <Monitor size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredClassrooms.length === 0 && (
          <div className="text-center py-12">
            <School className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No classrooms found</h3>
            <p className="text-white/70">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomsPage;
