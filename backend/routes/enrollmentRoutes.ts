// backend/routes/enrollmentRoutes.ts
import { Router } from 'express';
import { enrollStudent, listEnrollments } from '../controllers/enrollmentController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware

const router = Router();

router.post('/', authMiddleware, enrollStudent); // Protect enrollStudent
router.get('/', authMiddleware, listEnrollments); // Protect listEnrollments

export default router;
