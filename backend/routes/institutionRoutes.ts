// backend/routes/institutionRoutes.ts
import { Router } from 'express';
import { createInstitution, getInstitutions } from '../controllers/institutionController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware
import { authorize } from '../middleware/rbac'; // Import authorize middleware

const router = Router();

// Route to create an institution: requires authentication and Administrator role
router.post('/', authMiddleware, authorize(['Administrator']), createInstitution);
// Route to get institutions: requires authentication (no specific role check here, adjust as needed)
router.get('/', authMiddleware, getInstitutions);

export default router;
