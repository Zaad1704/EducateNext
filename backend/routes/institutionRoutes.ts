// backend/routes/institutionRoutes.ts
import { Router } from 'express';
import { createInstitution, getInstitutions } from '../controllers/institutionController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware

const router = Router();

router.post('/', authMiddleware, createInstitution); // Protect createInstitution
router.get('/', authMiddleware, getInstitutions); // Protect getInstitutions

export default router;
