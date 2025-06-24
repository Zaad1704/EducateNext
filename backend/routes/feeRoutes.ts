// backend/routes/feeRoutes.ts
import { Router } from 'express';
import { createFeeBill, getFeeBills } from '../controllers/feeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Only Accountants and Administrators can create fee bills
router.post('/', authMiddleware, authorize(['Accountant', 'Administrator']), createFeeBill);
// Accountants and Administrators can get fee bills; Students/Parents might get their own later
router.get('/', authMiddleware, authorize(['Accountant', 'Administrator']), getFeeBills);

export default router;
