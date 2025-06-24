// backend/routes/classroomRoutes.ts
import { Router } from 'express';
import { createClassroom, listClassrooms } from '../controllers/classroomController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware

const router = Router();

router.post('/', authMiddleware, createClassroom); // Protect createClassroom
router.get('/', authMiddleware, listClassrooms); // Protect listClassrooms

export default router;
