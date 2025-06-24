// backend/routes/teacherRoutes.ts
import { Router } from 'express';
import { addTeacher, listTeachers } from '../controllers/teacherController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware

const router = Router();

router.post('/', authMiddleware, addTeacher); // Protect addTeacher
router.get('/', authMiddleware, listTeachers); // Protect listTeachers

export default router;
