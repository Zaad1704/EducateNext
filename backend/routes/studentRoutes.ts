// backend/routes/studentRoutes.ts
import { Router } from 'express';
import { addStudent, listStudents } from '../controllers/studentController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware

const router = Router();

router.post('/', authMiddleware, addStudent); // Protect addStudent
router.get('/', authMiddleware, listStudents); // Protect listStudents

export default router;
