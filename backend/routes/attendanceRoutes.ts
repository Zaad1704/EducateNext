import { Router } from 'express';
import { markAttendance, getAttendance } from '../controllers/attendanceController';

const router = Router();

router.post('/', markAttendance);
router.get('/', getAttendance);

export default router;