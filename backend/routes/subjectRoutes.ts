// backend/routes/subjectRoutes.ts
import { Router } from 'express';
import { createSubject, listSubjects } from '../controllers/subjectController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware

const router = Router();

router.post('/', authMiddleware, createSubject); // Protect createSubject
router.get('/', authMiddleware, listSubjects); // Protect listSubjects

export default router;
