import express from 'express';
import {
  getTeacherMonitoringData,
  getRealTimeTeacherActivity,
  updateTeacherLocation,
  updateDeviceActivity,
  markTeacherAttendance,
  resolveAlert,
  getTeacherPerformanceAnalytics,
  updateMonitoringSettings
} from '../controllers/teacherMonitoringController';
import { authenticateToken } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/rbac';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get teacher monitoring data (Admin, Principal, Incharge)
router.get('/data', checkRole(['admin', 'principal', 'incharge']), getTeacherMonitoringData);

// Get real-time teacher activity (Admin, Principal, Incharge)
router.get('/realtime/:institutionId', checkRole(['admin', 'principal', 'incharge']), getRealTimeTeacherActivity);

// Update teacher location (Teacher - from mobile app)
router.post('/location', checkRole(['teacher']), updateTeacherLocation);

// Update device activity (Teacher - from mobile app)
router.post('/device-activity', checkRole(['teacher']), updateDeviceActivity);

// Mark teacher attendance (Teacher, Admin)
router.post('/attendance', checkRole(['teacher', 'admin']), markTeacherAttendance);

// Resolve alerts (Admin, Principal, Incharge)
router.post('/resolve-alert', checkRole(['admin', 'principal', 'incharge']), resolveAlert);

// Get teacher performance analytics (Admin, Principal, Incharge)
router.get('/analytics', checkRole(['admin', 'principal', 'incharge']), getTeacherPerformanceAnalytics);

// Update monitoring settings (Teacher, Admin)
router.put('/settings', checkRole(['teacher', 'admin']), updateMonitoringSettings);

export default router;
