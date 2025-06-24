// backend/routes/attendanceRoutes.ts
import { Router } from 'express';
import { markAttendance, getAttendance } from '../controllers/attendanceController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware

const router = Router();

router.post('/', authMiddleware, markAttendance); // Protect markAttendance
router.get('/', authMiddleware, getAttendance); // Protect getAttendance

export default router;
