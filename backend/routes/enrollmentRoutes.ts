// backend/routes/enrollmentRoutes.ts
import { Router } from 'express';
import { enrollStudent, listEnrollments } from '../controllers/enrollmentController';
import { authMiddleware, requireRole, requireInstitutionAccess } from '../middleware/authMiddleware';
import { validateStudentEnrollment } from '../middleware/validation';
import { generalRateLimit } from '../middleware/security';

const router = Router();

// Apply rate limiting
router.use(generalRateLimit);

// All routes require authentication
router.use(authMiddleware);

// Enroll student - requires admin or teacher role with validation
router.post('/', 
  requireRole(['admin', 'teacher']),
  requireInstitutionAccess,
  validateStudentEnrollment,
  enrollStudent
);

// List enrollments - requires admin or teacher role
router.get('/', 
  requireRole(['admin', 'teacher']),
  requireInstitutionAccess,
  listEnrollments
);

export default router;
