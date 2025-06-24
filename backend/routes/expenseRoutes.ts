// backend/routes/expenseRoutes.ts
import { Router } from 'express';
import { addExpense, getExpenses } from '../controllers/expenseController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Only Accountants and Administrators can add expenses
router.post('/', authMiddleware, authorize(['Accountant', 'Administrator']), addExpense);
// Accountants and Administrators can get expenses
router.get('/', authMiddleware, authorize(['Accountant', 'Administrator']), getExpenses);

export default router;
