import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Star,
  GraduationCap,
  Users,
  BookOpen
} from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  experience: number;
  rating: number;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  classes: number;
  students: number;
  avatar: string;
}

const TeachersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const teachers: Teacher[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@school.edu',
      phone: '+1 (555) 123-4567',
      subject: 'Mathematics',
      experience: 8,
      rating: 4.8,
      status: 'active',
      joinDate: '2020-03-15',
      classes: 4,
      students: 120,
      avatar: 'SJ'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@school.edu',
      phone: '+1 (555) 234-5678',
      subject: 'Physics',
      experience: 12,
      rating: 4.9,
      status: 'active',
      joinDate: '2018-09-01',
      classes: 3,
      students: 90,
      avatar: 'MC'
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily.davis@school.edu',
      phone: '+1 (555) 345-6789',
      subject: 'English Literature',
      experience: 6,
      rating: 4.7,
      status: 'on_leave',
      joinDate: '2021-01-10',
      classes: 5,
      students: 150,
      avatar: 'ED'
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@school.edu',
      phone: '+1 (555) 456-7890',
      subject: 'History',
      experience: 15,
      rating: 4.6,
      status: 'active',
      joinDate: '2015-08-20',
      classes: 4,
      students: 110,
      avatar: 'DW'
    }
  ];

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teachers</h1>
          <p className="text-white/70">Manage and monitor teacher information and performance</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={16} />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder="Search teachers by name, subject, or email..."
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
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
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
              <p className="text-white/70 text-sm">Total Teachers</p>
              <p className="text-2xl font-bold text-white">{teachers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
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
              <p className="text-white/70 text-sm">Active Teachers</p>
              <p className="text-2xl font-bold text-green-400">
                {teachers.filter(t => t.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center">
              <Users size={24} className="text-white" />
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
              <p className="text-white/70 text-sm">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-400">
                {(teachers.reduce((acc, t) => acc + t.rating, 0) / teachers.length).toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-lg flex items-center justify-center">
              <Star size={24} className="text-white" />
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
              <p className="text-white/70 text-sm">Total Classes</p>
              <p className="text-2xl font-bold text-blue-400">
                {teachers.reduce((acc, t) => acc + t.classes, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Teachers List */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Teacher Directory</h3>
          <p className="text-white/70 text-sm">
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{teacher.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{teacher.name}</h4>
                    <p className="text-white/70 text-sm">{teacher.subject}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(teacher.status)}`}>
                    {teacher.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <Mail size={14} />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <Phone size={14} />
                  <span>{teacher.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <Calendar size={14} />
                  <span>Joined {new Date(teacher.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <Award size={14} />
                  <span>{teacher.experience} years experience</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <Star size={14} className="text-yellow-400" />
                  <span className="text-white text-sm">{teacher.rating}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={14} className="text-white/70" />
                  <span className="text-white/70 text-sm">{teacher.students} students</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm">
                  <Eye size={14} />
                  <span>View Details</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <Edit size={14} className="text-white" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <Mail size={14} className="text-white" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <MoreVertical size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No teachers found</h3>
            <p className="text-white/70">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersPage;
