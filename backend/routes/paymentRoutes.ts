import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentStats
} from '../controllers/paymentController';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Payment routes
router.post('/', createPayment);
router.get('/', getPayments);
router.get('/stats', getPaymentStats);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;
