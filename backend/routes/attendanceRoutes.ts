// backend/routes/attendanceRoutes.ts
import { Router } from 'express';
import { markAttendance, getAttendance } from '../controllers/attendanceController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware
import { authorize } from '../middleware/rbac'; // Import authorize middleware

const router = Router();

// Route to mark attendance: requires authentication and either 'Teacher' or 'Administrator' role
router.post('/', authMiddleware, authorize(['Teacher', 'Administrator']), markAttendance);
// Route to get attendance: requires authentication (no specific role check here, adjust as needed)
router.get('/', authMiddleware, getAttendance);

export default router;
