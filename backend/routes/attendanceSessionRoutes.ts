import express from 'express';
import { 
  startAttendanceSession, 
  endAttendanceSession, 
  scanQRAttendance, 
  getActiveSessions,
  getSessionHistory 
} from '../controllers/attendanceSessionController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/start', protect, authorize(['Teacher', 'Administrator']), startAttendanceSession);
router.put('/:sessionId/end', protect, authorize(['Teacher', 'Administrator']), endAttendanceSession);
router.post('/scan', protect, authorize(['Teacher', 'Administrator']), scanQRAttendance);
router.get('/active', protect, authorize(['Teacher', 'Administrator']), getActiveSessions);
router.get('/history', protect, authorize(['Teacher', 'Administrator']), getSessionHistory);

export default router;